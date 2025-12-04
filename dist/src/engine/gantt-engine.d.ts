import type { IGanttEngine, GanttTask, GanttHeader, PFormat, GanttOptions } from "./model";
export declare class GanttEngine implements IGanttEngine {
    private _canvas;
    private _canvasCtx;
    private regions;
    private format;
    private mousePosition;
    private initialLoad;
    private timeOutRef;
    private scrollX;
    private scrollY;
    private maxScrollX;
    private maxScrollY;
    private wheelHandler?;
    private mouseMoveHandler?;
    private mouseClickHandler?;
    private onBarClick?;
    private dayContext;
    private weekContext;
    private monthContext;
    private quarterContext;
    private yearContext;
    private engineContext;
    private canvasEngine;
    private renderManager;
    constructor(canvasBody: HTMLCanvasElement, format?: PFormat, onBarClick?: (data: {
        pId: string;
    }) => void);
    getCanvas(): HTMLCanvasElement;
    getBounds(): number[];
    setFormat(format: PFormat): void;
    render(headers: GanttHeader[], data: GanttTask[], options: GanttOptions): void;
    clearScreen(): void;
    private draw;
    private setUp;
    private initializeScrollHandlers;
    private initializeMouseMoveHandlers;
    private initializeMouseClickHandlers;
    private getMousePosInternal;
    /**
     * Clean up event listeners (call this when destroying the chart)
     */
    private destroy;
    private getEngineContext;
}
//# sourceMappingURL=gantt-engine.d.ts.map