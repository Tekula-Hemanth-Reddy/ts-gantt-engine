"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GanttEngine = void 0;
const internal_1 = require("../internal");
class GanttEngine {
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
        this.canvasEngine = new internal_1.CanvasEngine(this._canvasCtx, internal_1.GANTT_CANVAS_CONSTANTS);
        this.renderManager = new internal_1.RenderManager(this.canvasEngine);
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
        [this.dayContext, this.weekContext, this.monthContext, this.quarterContext, this.yearContext] = (0, internal_1.getEngines)(this._canvasCtx, headers, data);
        this.canvasEngine.setUpCanvasStyles({
            columnWidth: options.columnWidth || internal_1.GANTT_HEADER_WIDTH,
            rowHeight: options.rowHeight || internal_1.GANTT_HEADER_HEIGHT,
            headerBg: options.headerBg || internal_1.GANTT_HEADER_BG,
            canvasBg: options.canvasBg || internal_1.GANTT_CANVAS_BG,
            lineColor: options.lineColor || internal_1.GANTT_TEXT_COLOR,
            textColor: options.fontColor || internal_1.GANTT_LINE_COLOR,
            font: options.font || internal_1.GANTT_FONT,
        });
        this.engineContext = this.getEngineContext(this.format);
        this.setUp();
    }
    clearScreen() {
        const [, , width, height] = this.getBounds();
        this._canvasCtx.clearRect(0, 0, width || 0, height || 0);
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
            this.maxScrollY = Math.max(0, this.engineContext.getTaskData().length * internal_1.BOX_HEIGHT -
                this.regions.data.height);
        });
        // Region 4: Gantt (both scrolls)
        this.renderManager.drawRegion(this.regions.gantt, () => {
            ctx.translate(-this.scrollX, -this.scrollY);
            const [, , , height] = this.getBounds();
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
        requestAnimationFrame(this.draw.bind(this));
    }
    setUp() {
        // remove event listeners
        this.destroy();
        this.initialLoad = true;
        const headerHeight = this.canvasEngine.getCanvasConstants().rowHeight;
        const headerWidth = this.canvasEngine.getCanvasConstants().columnWidth;
        // Define the 4 regions
        this.regions = (0, internal_1.getRegion)(headerHeight, this._canvas.height - headerHeight, (this.engineContext.getHeaders().length + 1) * headerWidth, this._canvas.width);
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
            this.timeOutRef = setTimeout(() => {
                this.mousePosition = undefined;
            }, 1000);
        };
        this._canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }
    initializeMouseClickHandlers() {
        this.mouseClickHandler = (e) => {
            const pos = this.getMousePosInternal(e);
            if (pos.region == internal_1.REGIONS.GANTT) {
                const item = this.engineContext.getTaskItem(pos.point.x, pos.point.y);
                if (item && typeof this.onBarClick == "function") {
                    this.onBarClick({ pId: item.data.pId });
                }
            }
            else if (pos.region == internal_1.REGIONS.DATA) {
                this.engineContext.expandOrClose(pos.point.x, pos.point.y, this.canvasEngine.getCanvasConstants().columnWidth * 2);
            }
        };
        this._canvas.addEventListener("click", this.mouseClickHandler);
    }
    getMousePosInternal(evt) {
        const [x, y] = this.getBounds();
        return (0, internal_1.getMousePosition)(evt, this.regions, { x: x || 0, y: y || 0 }, { x: this.scrollX, y: this.scrollY });
    }
    /**
     * Clean up event listeners (call this when destroying the chart)
     */
    destroy() {
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
exports.GanttEngine = GanttEngine;
//# sourceMappingURL=gantt-engine.js.map