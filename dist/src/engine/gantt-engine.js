import { CanvasEngine, RenderManager, GANTT_CANVAS_CONSTANTS, GANTT_HEADER_WIDTH, GANTT_HEADER_HEIGHT, GANTT_HEADER_BG, GANTT_CANVAS_BG, GANTT_TEXT_COLOR, GANTT_LINE_COLOR, GANTT_FONT, BOX_HEIGHT, getRegion, REGIONS, getMousePosition, getEngines, } from "../internal/index.js";
export class GanttEngine {
    _canvas;
    _canvasCtx;
    // Region definitions
    regions;
    format;
    mousePosition;
    initialLoad = true;
    timeOutRef;
    // Scroll states
    scrollX = 0;
    scrollY = 0;
    maxScrollX = 0;
    maxScrollY = 0;
    // Event handler reference for cleanup
    wheelHandler;
    mouseMoveHandler;
    mouseClickHandler;
    // Animation frame reference for cleanup
    animationFrameId = null;
    //event emitters
    onBarClick;
    dayContext;
    weekContext;
    monthContext;
    quarterContext;
    yearContext;
    // Current Engine
    engineContext;
    canvasEngine;
    renderManager;
    constructor(canvasBody, format, onBarClick) {
        this._canvas = canvasBody;
        this._canvasCtx = canvasBody.getContext("2d");
        const dpr = window.devicePixelRatio || 1; // do NOT change this
        const rect = this._canvas.getBoundingClientRect();
        // Set internal size according to DPR
        this._canvas.width = rect.width * dpr;
        this._canvas.height = rect.height * dpr;
        // Reset transformation matrix before scaling to prevent cumulative transformations
        this._canvasCtx.setTransform(1, 0, 0, 1, 0, 0);
        // Scale drawing operations
        this._canvasCtx.scale(dpr, dpr);
        this.canvasEngine = new CanvasEngine(this._canvasCtx, GANTT_CANVAS_CONSTANTS);
        this.renderManager = new RenderManager(this.canvasEngine);
        this.format = format || "day";
        this.onBarClick = onBarClick;
    }
    getCanvas() {
        return this._canvas;
    }
    getBounds() {
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
    setFormat(format) {
        this.format = format;
        const operations = this.engineContext.getOperations();
        this.engineContext = this.getEngineContext(format);
        this.engineContext.setOperations(operations);
        this.setUp();
    }
    render(headers, data, options) {
        [
            this.dayContext,
            this.weekContext,
            this.monthContext,
            this.quarterContext,
            this.yearContext,
        ] = getEngines(this._canvasCtx, headers, data);
        this.canvasEngine.setUpCanvasStyles({
            columnWidth: options.columnWidth || GANTT_HEADER_WIDTH,
            headerHeight: options.headerHeight || GANTT_HEADER_HEIGHT,
            headerBg: options.headerBg || GANTT_HEADER_BG,
            canvasBg: options.canvasBg || GANTT_CANVAS_BG,
            lineColor: options.lineColor || GANTT_TEXT_COLOR,
            textColor: options.fontColor || GANTT_LINE_COLOR,
            font: options.font || GANTT_FONT,
        });
        this.engineContext = this.getEngineContext(this.format);
        this.setUp();
    }
    clearScreen() {
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
    destroy() {
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
    draw() {
        this.clearScreen();
        const ctx = this._canvasCtx;
        const [, , , height] = this.getBounds();
        // Region 1: Fixed Header (no scroll)
        this.renderManager.drawRegion(this.regions.header, () => {
            this.renderManager.drawHeaders(this.engineContext.getHeaders(), this.regions);
        });
        // Region 2: Dates (horizontal scroll only)
        this.renderManager.drawRegion(this.regions.dates, () => {
            ctx.translate(-this.scrollX, 0);
            const x = this.renderManager.drawDateHeaders(this.engineContext.getDateHeaders(), this.engineContext.getUnitWidth());
            this.maxScrollX = Math.max(0, x - this.regions.dates.width);
        });
        // Region 3: Data (vertical scroll only)
        this.renderManager.drawRegion(this.regions.data, () => {
            ctx.translate(0, -this.scrollY);
            this.renderManager.drawTableData(this.regions, this.engineContext.getTaskData(), this.engineContext.getHeaders(), height || 0, (pId) => {
                return this.engineContext.getItemSymbol(pId);
            }, (pId) => {
                return this.engineContext.getItemPadding(pId);
            });
            // Update max scroll Y
            this.maxScrollY = Math.max(0, this.engineContext.getTaskData().length * BOX_HEIGHT -
                this.regions.data.height);
        });
        // Region 4: Gantt (both scrolls)
        this.renderManager.drawRegion(this.regions.gantt, () => {
            ctx.translate(-this.scrollX, -this.scrollY);
            this.renderManager.drawTasks(this.engineContext.getTaskData(), this.engineContext.getDateHeaders().totalUnits, this.engineContext.getUnitWidth(), height || 0, (pItem) => {
                return this.engineContext.getCoordinatesPItem(pItem);
            });
            this.renderManager.drawRelations(this.engineContext.getTaskData(), (pItem) => {
                return this.engineContext.getRelationShipItem(pItem);
            });
            if (this.initialLoad) {
                this.initialLoad = false;
                this.scrollX =
                    this.engineContext.getMinMax().min -
                        this.engineContext.getUnitWidth();
            }
        });
        if (this.mousePosition && this.mousePosition.y - this.scrollY > 0) {
            this.renderManager.drawToolTip({
                x: this.mousePosition.x + this.regions.gantt.x - this.scrollX,
                y: this.mousePosition.y + this.regions.gantt.y - this.scrollY,
            }, this.engineContext.getTaskItem(this.mousePosition.x, this.mousePosition.y));
        }
        // Store the animation frame ID so we can cancel it later
        this.animationFrameId = requestAnimationFrame(this.draw.bind(this));
    }
    setUp() {
        // Stop any existing animation loop before starting a new one
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.initialLoad = true;
        const headerHeight = this.canvasEngine.getCanvasConstants().headerHeight;
        const headerWidth = this.canvasEngine.getCanvasConstants().columnWidth;
        // Define the 4 regions
        this.regions = getRegion(headerHeight, this._canvas.height - headerHeight, (this.engineContext.getHeaders().length + 1) * headerWidth, this._canvas.width);
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
    initializeScrollHandlers() {
        this.wheelHandler = (e) => {
            e.preventDefault();
            const mouseX = e.offsetX;
            const mouseY = e.offsetY;
            // Determine which region was scrolled
            if (mouseX >= this.regions.gantt.x && mouseY >= this.regions.gantt.y) {
                // Gantt: both directions
                this.scrollX += e.deltaX;
                this.scrollY += e.deltaY;
            }
            else if (mouseX >= this.regions.dates.x &&
                mouseY < this.regions.dates.y + this.regions.dates.height) {
                // Dates: horizontal only
                this.scrollX += e.deltaX;
            }
            else if (mouseX < this.regions.data.width &&
                mouseY >= this.regions.data.y) {
                // Data: vertical only
                this.scrollY += e.deltaY;
            }
            // Clamp scroll values
            this.scrollX = Math.max(0, Math.min(this.scrollX, this.maxScrollX));
            this.scrollY = Math.max(0, Math.min(this.scrollY, this.maxScrollY));
        };
        this._canvas.addEventListener("wheel", this.wheelHandler);
    }
    initializeMouseMoveHandlers() {
        this.mouseMoveHandler = (e) => {
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
    initializeMouseClickHandlers() {
        this.mouseClickHandler = (e) => {
            const pos = this.getMousePosInternal(e);
            if (pos.region == REGIONS.GANTT) {
                const item = this.engineContext.getTaskItem(pos.point.x, pos.point.y);
                if (item && typeof this.onBarClick == "function") {
                    this.onBarClick({ pId: item.data.pId });
                }
            }
            else if (pos.region == REGIONS.DATA) {
                this.engineContext.expandOrClose(pos.point.x, pos.point.y, this.canvasEngine.getCanvasConstants().columnWidth * 2);
            }
        };
        this._canvas.addEventListener("click", this.mouseClickHandler);
    }
    getMousePosInternal(evt) {
        const [x, y] = this.getBounds();
        return getMousePosition(evt, this.regions, { x: x || 0, y: y || 0 }, { x: this.scrollX, y: this.scrollY });
    }
    // get engine context according to format
    getEngineContext(format) {
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
//# sourceMappingURL=gantt-engine.js.map