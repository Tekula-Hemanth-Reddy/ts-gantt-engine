import type { IGanttEngine, GanttTask, GanttHeader, PFormat, GanttOptions, RelationColors, GanttDurationType } from "./model.js";
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
    private animationFrameId;
    private onBarClick?;
    private dayContext;
    private weekContext;
    private monthContext;
    private quarterContext;
    private yearContext;
    private engineContext;
    private canvasEngine;
    private renderManager;
    private canvasConstants;
    private taskConstants;
    private expandCollapseSymbol;
    constructor(canvasBody: HTMLCanvasElement, format?: PFormat, onBarClick?: (data: {
        pId: string;
        gId: GanttDurationType;
    }) => void);
    getCanvas(): HTMLCanvasElement;
    getBounds(): number[];
    setFormat(format: PFormat): void;
    render(headers: GanttHeader[], data: GanttTask[], options: GanttOptions, relationColors?: RelationColors, timeZone?: string): void;
    clearScreen(): void;
    /**
     * Public method to clean up the engine when destroying
     * Stops animation loop and removes event listeners
     */
    destroy(): void;
    private draw;
    private setUp;
    private initializeScrollHandlers;
    private initializeMouseMoveHandlers;
    private initializeMouseClickHandlers;
    private getMousePosInternal;
    private resetCanvas;
    private setContextDPR;
    private setUpMaxScrolls;
    private getEngineContext;
}
//# sourceMappingURL=gantt-engine.d.ts.map