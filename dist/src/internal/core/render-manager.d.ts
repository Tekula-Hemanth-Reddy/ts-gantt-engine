import { type GanttDuration, type GanttHeader, type GanttTask } from "../../engine/model.js";
import { type Point, type Region, type Regions, type IInstruction, type ICoordinateData, type IGanttTaskData } from "../common/index.js";
import { CanvasConstants, TaskConstants } from "./base/index.js";
import { CanvasEngine } from "./canvas-engine.js";
export declare class RenderManager {
    private canvasEngine;
    private taskConstants;
    private canvasConstants;
    constructor(chartCanvas: CanvasEngine, taskConstants: TaskConstants, canvasConstants: CanvasConstants);
    drawCanvasBox(point: Point, width: number, height: number): void;
    drawHeaders(headers: GanttHeader[], regions: Regions): void;
    drawDateHeaders(header: {
        labels: string[];
        totalUnits: number;
    }, unitWidth: number): number;
    drawTableData: (regions: Regions, chartData: GanttTask[], canvasHeight: number, timeLinesCount: number, getGanttTaskData: (pId: string) => IGanttTaskData | null) => void;
    drawRegion(region: Region, drawFn: () => void): void;
    drawTimeLines(item: GanttDuration['gClass'], taskBar: ICoordinateData | null | undefined, positionY: number, yResidue: number): {
        positionY: number;
        taskDrawn: boolean;
    };
    drawTasks(chartData: GanttTask[], totalUnits: number, unitWidth: number, height: number, timeLinesCount: number, getCoordinatesPItem: (item: string) => ICoordinateData | null | undefined): void;
    drawRelations(chartData: GanttTask[], relationShipInstructions: (item: string) => IInstruction[]): void;
    drawToolTip(position: {
        x: number;
        y: number;
    } | undefined, data: ICoordinateData | null): void;
    drawVerticalLines(chartHeight: number, totalUnits: number, unitWidth: number): void;
    drawHorizontalLine: (positionX: number, positionY: number, width: number) => void;
}
//# sourceMappingURL=render-manager.d.ts.map