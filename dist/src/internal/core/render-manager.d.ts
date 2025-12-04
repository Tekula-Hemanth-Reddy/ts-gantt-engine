import { GanttHeader, GanttTask } from "../../engine/model";
import { Regions, Region, ICoordinateData, IInstruction } from "../common";
import { CanvasEngine } from "./canvas-engine";
export declare class RenderManager {
    private canvasEngine;
    constructor(chartCanvas: CanvasEngine);
    drawHeaders(headers: GanttHeader[], regions: Regions): void;
    drawDateHeaders(header: {
        labels: string[];
        totalUnits: number;
    }, unitWidth: number): number;
    drawTableData: (regions: Regions, chartData: GanttTask[], headers: GanttHeader[], canvasHeight: number, symbolFun: (pId: string) => string, paddingFun: (pId: string) => number) => void;
    drawRegion(region: Region, drawFn: () => void): void;
    drawTasks(chartData: GanttTask[], totalUnits: number, unitWidth: number, height: number, getCoordinatesPItem: (item: string) => ICoordinateData | null | undefined): void;
    drawRelations(chartData: GanttTask[], relationShipInstructions: (item: string) => IInstruction[]): void;
    drawToolTip(position: {
        x: number;
        y: number;
    } | undefined, data: ICoordinateData | null): void;
    drawVerticalLines(chartHeight: number, totalUnits: number, unitWidth: number): void;
    drawHorizontalLine: (positionX: number, positionY: number, width: number) => void;
}
//# sourceMappingURL=render-manager.d.ts.map