import { GANTT_CANVAS_CONSTANTS, type ICanvasConstants } from "../../common/index.js";

export class CanvasConstants {
    private columnWidth: number = GANTT_CANVAS_CONSTANTS.columnWidth
    private headerHeight: number = GANTT_CANVAS_CONSTANTS.headerHeight
    private headerBg: string = GANTT_CANVAS_CONSTANTS.headerBg
    private canvasBg: string = GANTT_CANVAS_CONSTANTS.canvasBg
    private lineColor: string = GANTT_CANVAS_CONSTANTS.lineColor
    private textColor: string = GANTT_CANVAS_CONSTANTS.textColor
    private font: string = GANTT_CANVAS_CONSTANTS.font
    private todayHighlightBg: string | null = null

    constructor(canvasConstants: ICanvasConstants) {
        this.columnWidth = canvasConstants.columnWidth;
        this.headerHeight = canvasConstants.headerHeight;
        this.headerBg = canvasConstants.headerBg;
        this.canvasBg = canvasConstants.canvasBg;
        this.lineColor = canvasConstants.lineColor;
        this.textColor = canvasConstants.textColor;
        this.font = canvasConstants.font;
        this.todayHighlightBg = canvasConstants.todayHighlightBg || null;
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

    getTodayHighlightBg(): string | null {
        return this.todayHighlightBg;
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