import { type ICanvasConstants } from "../../common/index.js";
export declare class CanvasConstants {
    private columnWidth;
    private headerHeight;
    private headerBg;
    private canvasBg;
    private lineColor;
    private textColor;
    private font;
    constructor(canvasConstants: ICanvasConstants);
    getColumnWidth(): number;
    getHeaderHeight(): number;
    getHeaderBg(): string;
    getCanvasBg(): string;
    getLineColor(): string;
    getTextColor(): string;
    getFont(): string;
    getCanvasConstants(): {
        columnWidth: number;
        headerHeight: number;
        headerBg: string;
        canvasBg: string;
        lineColor: string;
        textColor: string;
        font: string;
    };
}
//# sourceMappingURL=canvas-constants.d.ts.map