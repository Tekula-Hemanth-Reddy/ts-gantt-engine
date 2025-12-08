import { GANTT_CANVAS_CONSTANTS } from "../../common/index.js";
export class CanvasConstants {
    columnWidth = GANTT_CANVAS_CONSTANTS.columnWidth;
    headerHeight = GANTT_CANVAS_CONSTANTS.headerHeight;
    headerBg = GANTT_CANVAS_CONSTANTS.headerBg;
    canvasBg = GANTT_CANVAS_CONSTANTS.canvasBg;
    lineColor = GANTT_CANVAS_CONSTANTS.lineColor;
    textColor = GANTT_CANVAS_CONSTANTS.textColor;
    font = GANTT_CANVAS_CONSTANTS.font;
    constructor(canvasConstants) {
        this.columnWidth = canvasConstants.columnWidth;
        this.headerHeight = canvasConstants.headerHeight;
        this.headerBg = canvasConstants.headerBg;
        this.canvasBg = canvasConstants.canvasBg;
        this.lineColor = canvasConstants.lineColor;
        this.textColor = canvasConstants.textColor;
        this.font = canvasConstants.font;
    }
    getColumnWidth() {
        return this.columnWidth;
    }
    getHeaderHeight() {
        return this.headerHeight;
    }
    getHeaderBg() {
        return this.headerBg;
    }
    getCanvasBg() {
        return this.canvasBg;
    }
    getLineColor() {
        return this.lineColor;
    }
    getTextColor() {
        return this.textColor;
    }
    getFont() {
        return this.font;
    }
    getCanvasConstants() {
        return {
            columnWidth: this.columnWidth,
            headerHeight: this.headerHeight,
            headerBg: this.headerBg,
            canvasBg: this.canvasBg,
            lineColor: this.lineColor,
            textColor: this.textColor,
            font: this.font,
        };
    }
}
//# sourceMappingURL=canvas-constants.js.map