import {
  EngineContext,
  CanvasEngine,
  RenderManager,
  GANTT_HEADER_WIDTH,
  GANTT_HEADER_HEIGHT,
  GANTT_HEADER_BG,
  GANTT_CANVAS_BG,
  GANTT_TEXT_COLOR,
  GANTT_LINE_COLOR,
  GANTT_FONT,
  getRegion,
  REGIONS,
  getMousePosition,
  getEngines,
  RELATION_COLOR,
  GANTT_START_COORDINATES,
  TASK_CONSTANTS,
  EXPAND_COLLAPSE_SYMBOL,
  CanvasConstants,
  TaskConstants,
  ExpandCollapse,
  type Point,
  type Regions,
} from "../internal/index.js";
import type {
  IGanttEngine,
  GanttTask,
  GanttHeader,
  PFormat,
  GanttOptions,
  RelationColors,
  GanttDurationType,
} from "./model.js";

export class GanttEngine implements IGanttEngine {
  private _canvas: HTMLCanvasElement;
  private _canvasCtx: CanvasRenderingContext2D;

  // Region definitions
  private regions!: Regions;
  private format: PFormat;
  private mousePosition!: Point | undefined;
  private initialLoad = true;
  private timeOutRef!: number;

  // Scroll states
  private scrollX: number = 0;
  private scrollY: number = 0;
  private maxScrollX: number = 0;
  private maxScrollY: number = 0;

  // Event handler reference for cleanup
  private wheelHandler?: ((e: WheelEvent) => void) | undefined;
  private mouseMoveHandler?: ((e: MouseEvent) => void) | undefined;
  private mouseClickHandler?: ((e: MouseEvent) => void) | undefined;

  // Animation frame reference for cleanup
  private animationFrameId: number | null = null;

  //event emitters
  private onBarClick?: ((data: { pId: string, gId: GanttDurationType }) => void) | undefined;

  private dayContext!: EngineContext;
  private weekContext!: EngineContext;
  private monthContext!: EngineContext;
  private quarterContext!: EngineContext;
  private yearContext!: EngineContext;
  // Current Engine
  private engineContext!: EngineContext;
  private canvasEngine!: CanvasEngine;
  private renderManager!: RenderManager;
  private canvasConstants!: CanvasConstants;
  private taskConstants!: TaskConstants;
  private expandCollapseSymbol!: ExpandCollapse;
  constructor(
    canvasBody: HTMLCanvasElement,
    format?: PFormat,
    onBarClick?: (data: { pId: string, gId: GanttDurationType }) => void
  ) {
    this._canvas = canvasBody;
    this._canvasCtx = canvasBody.getContext("2d") as CanvasRenderingContext2D;
    this.resetCanvas();
    this.setContextDPR(true);
    this.canvasEngine = new CanvasEngine(
      this._canvasCtx,
      RELATION_COLOR
    );
    this.format = format || "day";
    this.onBarClick = onBarClick;
  }

  getCanvas(): HTMLCanvasElement {
    return this._canvas;
  }

  getBounds(): number[] {
    const bounds = this._canvas.getBoundingClientRect();
    return [
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      bounds.left,
      bounds.top,
    ];
  }

  setFormat(format: PFormat): void {
    this.format = format;
    const operations = this.engineContext.getOperations();
    this.engineContext = this.getEngineContext(format);
    this.engineContext.setOperations(operations);
    this.setUp();
  }

  render(
    headers: GanttHeader[],
    data: GanttTask[],
    options: GanttOptions,
    relationColors?: RelationColors
  ): void {
    this.canvasConstants = new CanvasConstants({
      columnWidth: options.columnWidth || GANTT_HEADER_WIDTH,
      headerHeight: options.headerHeight || GANTT_HEADER_HEIGHT,
      headerBg: options.headerBg || GANTT_HEADER_BG,
      canvasBg: options.canvasBg || GANTT_CANVAS_BG,
      lineColor: options.lineColor || GANTT_TEXT_COLOR,
      textColor: options.fontColor || GANTT_LINE_COLOR,
      font: options.font || GANTT_FONT,
    });
    this.taskConstants = new TaskConstants( {
      boxHeight: options.boxHeight || TASK_CONSTANTS.boxHeight,
      barHeight: options.barHeight || TASK_CONSTANTS.barHeight,
      horizontalResidue: options.barHorizontalResidue || TASK_CONSTANTS.horizontalResidue,
      verticalResidue: options.barVerticalResidue || TASK_CONSTANTS.verticalResidue,
      radius: options.curveRadius || TASK_CONSTANTS.radius,
    });
    this.expandCollapseSymbol = new ExpandCollapse(EXPAND_COLLAPSE_SYMBOL);
    this.renderManager = new RenderManager(this.canvasEngine, this.taskConstants, this.canvasConstants);
    [
      this.dayContext,
      this.weekContext,
      this.monthContext,
      this.quarterContext,
      this.yearContext,
    ] = getEngines(this._canvasCtx, headers, data,this.canvasConstants, this.taskConstants, this.expandCollapseSymbol);

    this.canvasEngine.setUpCanvasStyles(this.canvasConstants);
    this.canvasEngine.setUpRelationColors(relationColors || RELATION_COLOR);
    this.engineContext = this.getEngineContext(this.format);
    // Reset scroll positions on re-render
    this.scrollX = 0;
    this.scrollY = 0;
    this.setUp();
  }

  clearScreen(): void {
    // Note: This only clears the canvas visually, but doesn't stop the animation loop
    // Use destroy() to properly clean up the engine
    const width = this.regions.gantt.width + this.regions.data.width;
    const height = this.regions.gantt.height + this.regions.dates.height;
    this._canvasCtx.clearRect(0, 0, width, height);
  }

  /**
   * Public method to clean up the engine when destroying
   * Stops animation loop and removes event listeners
   */
  destroy(): void {
    // Cancel any ongoing animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Clear any pending timeouts
    if (this.timeOutRef) {
      clearTimeout(this.timeOutRef);
    }

    // Remove event listeners
    if (this.wheelHandler) {
      this._canvas.removeEventListener("wheel", this.wheelHandler);
      this.wheelHandler = undefined;
    }
    if (this.mouseMoveHandler) {
      this._canvas.removeEventListener("mousemove", this.mouseMoveHandler);
      this.mouseMoveHandler = undefined;
    }
    if (this.mouseClickHandler) {
      this._canvas.removeEventListener("click", this.mouseClickHandler);
      this.mouseClickHandler = undefined;
    }

    // Clear the canvas
    this.clearScreen();
  }

  private draw(): void {
    const ctx = this._canvasCtx;
    // Ensure DPR scaling is always applied correctly
    this.setContextDPR();
    this.clearScreen();
    this.setUpMaxScrolls();
    const [, , , height] = this.getBounds();

    // Region 1: Fixed Header (no scroll)
    this.renderManager.drawRegion(this.regions.header, () => {
      this.renderManager.drawHeaders(
        this.engineContext.getHeaders(),
        this.regions
      );
    });

    // Region 2: Dates (horizontal scroll only)
    this.renderManager.drawRegion(this.regions.dates, () => {
      ctx.translate(-this.scrollX, 0);
      this.renderManager.drawDateHeaders(
        this.engineContext.getDateHeaders(),
        this.engineContext.getUnitWidth()
      );
    });

    // Region 3: Data (vertical scroll only)
    this.renderManager.drawRegion(this.regions.data, () => {
      ctx.translate(0, -this.scrollY);
      this.renderManager.drawTableData(
        this.regions,
        this.engineContext.getTaskData(),
        height || 0,
        this.engineContext.getTimeLinesCount(),
        (pId: string) => {
          return this.engineContext.getGanttTaskData(pId);
        }
      );
    });

    // Region 4: Gantt (both scrolls)
    this.renderManager.drawRegion(this.regions.gantt, () => {
      ctx.translate(-this.scrollX, -this.scrollY);
      this.renderManager.drawTasks(
        this.engineContext.getTaskData(),
        this.engineContext.getDateHeaders().totalUnits,
        this.engineContext.getUnitWidth(),
        height || 0,
        this.engineContext.getTimeLinesCount(),
        (pItem: string) => {
          return this.engineContext.getCoordinatesPItem(pItem);
        }
      );
      this.renderManager.drawRelations(
        this.engineContext.getTaskData(),
        (pItem: string) => {
          return this.engineContext.getRelationShipItem(pItem);
        }
      );
    });
    if (this.mousePosition && this.mousePosition.y - this.scrollY > 0) {
      this.renderManager.drawToolTip(
        {
          x: this.mousePosition.x + this.regions.gantt.x - this.scrollX,
          y: this.mousePosition.y + this.regions.gantt.y - this.scrollY,
        },
        this.engineContext.getTaskItem(
          this.mousePosition.x,
          this.mousePosition.y
        )
      );
    }

    ctx.restore(); // Restore canvas state after drawing

    // Store the animation frame ID so we can cancel it later
    this.animationFrameId = requestAnimationFrame(this.draw.bind(this));
  }

  private setUp(): void {
    // Stop any existing animation loop before starting a new one
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.initialLoad = true;
    const headerHeight = this.canvasConstants.getHeaderHeight();
    const headerWidth = this.canvasConstants.getColumnWidth();

    // Use CSS dimensions (display size) instead of internal canvas dimensions
    const rect = this._canvas.getBoundingClientRect();
    const displayWidth = rect.width;
    const displayHeight = rect.height;

    // Define the 4 regions
    this.regions = getRegion(
      headerHeight,
      displayHeight - headerHeight,
      (this.engineContext.getHeaders().length + 1) * headerWidth,
      displayWidth,
      GANTT_START_COORDINATES
    );

    // Initialize scroll handlers only once
    if (!this.wheelHandler) {
      this.initializeScrollHandlers();
    }
    if (!this.mouseMoveHandler) {
      this.initializeMouseMoveHandlers();
    }
    if (!this.mouseClickHandler) {
      this.initializeMouseClickHandlers();
    }
    requestAnimationFrame(this.draw.bind(this));
  }

  private initializeScrollHandlers(): void {
    this.wheelHandler = (e: WheelEvent) => {
      e.preventDefault();

      const mouseX = e.offsetX;
      const mouseY = e.offsetY;

      // Determine which region was scrolled
      if (mouseX >= this.regions.gantt.x && mouseY >= this.regions.gantt.y) {
        // Gantt: both directions
        this.scrollX += e.deltaX;
        this.scrollY += e.deltaY;
      } else if (
        mouseX >= this.regions.dates.x &&
        mouseY < this.regions.dates.y + this.regions.dates.height
      ) {
        // Dates: horizontal only
        this.scrollX += e.deltaX;
      } else if (
        mouseX < this.regions.data.width &&
        mouseY >= this.regions.data.y
      ) {
        // Data: vertical only
        this.scrollY += e.deltaY;
      }

      // Clamp scroll values
      this.scrollX = Math.max(0, Math.min(this.scrollX, this.maxScrollX));
      this.scrollY = Math.max(0, Math.min(this.scrollY, this.maxScrollY));
    };

    this._canvas.addEventListener("wheel", this.wheelHandler);
  }

  private initializeMouseMoveHandlers(): void {
    this.mouseMoveHandler = (e: MouseEvent) => {
      const pos = this.getMousePosInternal(e);
      if (this.timeOutRef) {
        clearTimeout(this.timeOutRef);
      }
      this.mousePosition = {
        x: pos.point.x,
        y: pos.point.y,
      };
      this.timeOutRef = window.setTimeout(() => {
        this.mousePosition = undefined;
      }, 1000);
    };

    this._canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }

  private initializeMouseClickHandlers(): void {
    this.mouseClickHandler = (e: MouseEvent) => {
      const pos = this.getMousePosInternal(e);
      if (pos.region == REGIONS.GANTT) {
        const item = this.engineContext.getTaskItem(pos.point.x, pos.point.y);
        if (item && typeof this.onBarClick == "function") {
          this.onBarClick({ pId: item.data.pId, gId: item.data.gId });
        }
      } else if (pos.region == REGIONS.DATA) {
        this.engineContext.expandOrClose(
          pos.point.x,
          pos.point.y
        );
      }
    };

    this._canvas.addEventListener("click", this.mouseClickHandler);
  }

  private getMousePosInternal(evt: MouseEvent) {
    const [x, y] = this.getBounds();
    return getMousePosition(
      evt,
      this.regions,
      { x: x || 0, y: y || 0 },
      { x: this.scrollX, y: this.scrollY }
    );
  }

  private resetCanvas(): void {
    this._canvasCtx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._canvas.width = this._canvas.clientWidth;
    this._canvas.height = this._canvas.clientHeight;
  }

  private setContextDPR(setCanvasDimensions = false): void {
    const dpr = window.devicePixelRatio || 1;
    if (setCanvasDimensions) {
      const rect = this._canvas.getBoundingClientRect();
      // Set internal size according to DPR
      this._canvas.width = rect.width * dpr;
      this._canvas.height = rect.height * dpr;
      // CRITICAL: Set CSS display size to prevent stretching
      this._canvas.style.width = `${rect.width}px`;
      this._canvas.style.height = `${rect.height}px`;
    }
    this._canvasCtx.save();
    this._canvasCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    this._canvasCtx.scale(dpr, dpr); // Reapply DPR scaling
  }

  private setUpMaxScrolls(): void {
    // Calculate scroll limits based on both date headers AND actual task positions
    const datesWidth = this.engineContext.getDateHeaders().totalUnits * this.engineContext.getUnitWidth();
    const taskBounds = this.engineContext.getMinMax();
    this.maxScrollX = Math.max(0, datesWidth - this.regions.dates.width);
    this.maxScrollY = Math.max(
      0,
      this.engineContext.getTimeLinesCount() * this.taskConstants.getBoxHeight() -
      this.regions.data.height
    );
    // Set initial scroll position if this is the first load
    if (this.initialLoad) {
      this.initialLoad = false;
      this.scrollX = Math.min(
        taskBounds.min - this.engineContext.getUnitWidth(),
        this.maxScrollX
      );
    }
  }

  // get engine context according to format
  private getEngineContext(format: PFormat) {
    switch (format) {
      case "week":
        return this.weekContext;
      case "month":
        return this.monthContext;
      case "quarter":
        return this.quarterContext;
      case "year":
        return this.yearContext;
      case "day":
      default:
        return this.dayContext;
    }
  }
}
