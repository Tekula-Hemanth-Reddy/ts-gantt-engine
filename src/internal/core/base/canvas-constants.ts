import { GANTT_CANVAS_CONSTANTS, type ICanvasConstants } from "../../common";

export class CanvasConstants {
    private columnWidth: number = GANTT_CANVAS_CONSTANTS.columnWidth
    private headerHeight: number = GANTT_CANVAS_CONSTANTS.headerHeight
    private headerBg: string = GANTT_CANVAS_CONSTANTS.headerBg
    private canvasBg: string = GANTT_CANVAS_CONSTANTS.canvasBg
    private lineColor: string = GANTT_CANVAS_CONSTANTS.lineColor
    private textColor: string = GANTT_CANVAS_CONSTANTS.textColor
    private font: string = GANTT_CANVAS_CONSTANTS.font

    constructor(canvasConstants: ICanvasConstants) {
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