import {
  Regions,
  EngineContext,
  CanvasEngine,
  RenderManager,
  GANTT_CANVAS_CONSTANTS,
  GANTT_HEADER_WIDTH,
  GANTT_HEADER_HEIGHT,
  GANTT_HEADER_BG,
  GANTT_CANVAS_BG,
  GANTT_TEXT_COLOR,
  GANTT_LINE_COLOR,
  GANTT_FONT,
  BOX_HEIGHT,
  getRegion,
  REGIONS,
  getMousePosition,
  getEngines,
  Point,
} from "../internal";
import type {
  IGanttEngine,
  GanttTask,
  GanttHeader,
  PFormat,
  GanttOptions,
} from "./model";

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

  //event emitters
  private onBarClick?: ((data: { pId: string }) => void) | undefined;

  private dayContext!: EngineContext;
  private weekContext!: EngineContext;
  private monthContext!: EngineContext;
  private quarterContext!: EngineContext;
  private yearContext!: EngineContext;
  // Current Engine
  private engineContext!: EngineContext;
  private canvasEngine!: CanvasEngine;
  private renderManager!: RenderManager;

  constructor(
    canvasBody: HTMLCanvasElement,
    format?: PFormat,
    onBarClick?: (data: { pId: string }) => void
  ) {
    this._canvas = canvasBody;
    this._canvasCtx = canvasBody.getContext("2d") as CanvasRenderingContext2D;

    this.canvasEngine = new CanvasEngine(
      this._canvasCtx,
      GANTT_CANVAS_CONSTANTS
    );
    this.renderManager = new RenderManager(this.canvasEngine);

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
    options: GanttOptions
  ): void {
    [this.dayContext, this.weekContext, this.monthContext, this.quarterContext, this.yearContext] = getEngines(
      this._canvasCtx,
      headers,
      data
    );

    this.canvasEngine.setUpCanvasStyles({
      columnWidth: options.columnWidth || GANTT_HEADER_WIDTH,
      rowHeight: options.rowHeight || GANTT_HEADER_HEIGHT,
      headerBg: options.headerBg || GANTT_HEADER_BG,
      canvasBg: options.canvasBg || GANTT_CANVAS_BG,
      lineColor: options.lineColor || GANTT_TEXT_COLOR,
      textColor: options.fontColor || GANTT_LINE_COLOR,
      font: options.font || GANTT_FONT,
    });
    this.engineContext = this.getEngineContext(this.format);
    this.setUp();
  }

  clearScreen(): void {
    const [, , width, height] = this.getBounds();
    this._canvasCtx.clearRect(0, 0, width || 0, height || 0);
  }

  private draw(): void {
    this.clearScreen();

    const ctx = this._canvasCtx;
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
      const x = this.renderManager.drawDateHeaders(
        this.engineContext.getDateHeaders(),
        this.engineContext.getUnitWidth()
      );
      this.maxScrollX = Math.max(0, x - this.regions.dates.width);
    });

    // Region 3: Data (vertical scroll only)
    this.renderManager.drawRegion(this.regions.data, () => {
      ctx.translate(0, -this.scrollY);
      this.renderManager.drawTableData(
        this.regions,
        this.engineContext.getTaskData(),
        this.engineContext.getHeaders(),
        height || 0,
        (pId: string) => {
          return this.engineContext.getItemSymbol(pId);
        },
        (pId: string) => {
          return this.engineContext.getItemPadding(pId);
        }
      );
      // Update max scroll Y
      this.maxScrollY = Math.max(
        0,
        this.engineContext.getTaskData().length * BOX_HEIGHT -
          this.regions.data.height
      );
    });

    // Region 4: Gantt (both scrolls)
    this.renderManager.drawRegion(this.regions.gantt, () => {
      ctx.translate(-this.scrollX, -this.scrollY);
      const [, , , height] = this.getBounds();
      this.renderManager.drawTasks(
        this.engineContext.getTaskData(),
        this.engineContext.getDateHeaders().totalUnits,
        this.engineContext.getUnitWidth(),
        height || 0,
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
      if (this.initialLoad) {
        this.initialLoad = false;
        this.scrollX =
          this.engineContext.getMinMax().min -
          this.engineContext.getUnitWidth();
      }
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
    requestAnimationFrame(this.draw.bind(this));
  }

  private setUp(): void {
    // remove event listeners
    this.destroy();
    this.initialLoad = true;
    const headerHeight = this.canvasEngine.getCanvasConstants().rowHeight;
    const headerWidth = this.canvasEngine.getCanvasConstants().columnWidth;

    // Define the 4 regions
    this.regions = getRegion(
      headerHeight,
      this._canvas.height - headerHeight,
      (this.engineContext.getHeaders().length + 1) * headerWidth,
      this._canvas.width
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
      this.timeOutRef = setTimeout(() => {
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
          this.onBarClick({ pId: item.data.pId });
        }
      } else if (pos.region == REGIONS.DATA) {
        this.engineContext.expandOrClose(
          pos.point.x,
          pos.point.y,
          this.canvasEngine.getCanvasConstants().columnWidth * 2
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

  /**
   * Clean up event listeners (call this when destroying the chart)
   */
  private destroy(): void {
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
