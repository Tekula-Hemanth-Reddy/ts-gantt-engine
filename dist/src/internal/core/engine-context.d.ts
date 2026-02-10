import { type PFormat, type GanttHeader, type GanttTask } from "../../engine/model.js";
import { type TaskOperation, type GanttDateHeader, type ICoordinateData, type IInstruction, type IGanttTaskData } from "../common/index.js";
import { CanvasConstants, ExpandCollapse, TaskConstants } from "./base/index.js";
export declare class EngineContext {
    private _canvasCtx;
    private unitWidth;
    private format;
    private minDate;
    private maxDate;
    private headers;
    private originalTaskData;
    private taskData;
    private operations;
    private timeZone?;
    private datesHeader;
    private canvasConstants;
    private taskConstants;
    private expandCollapseSymbol;
    private timeLinesCount;
    private max_min_map;
    private coordinateMap;
    private ganttTaskDataMap;
    private relationShipInstructions;
    private relationShipConstants;
    constructor(canvasCtx: CanvasRenderingContext2D, format: PFormat, headers: GanttHeader[], data: GanttTask[], operations: Map<string, TaskOperation>, canvasConstants: CanvasConstants, taskConstants: TaskConstants, expandCollapseSymbol: ExpandCollapse, timeZone?: string);
    getTaskConstants(): TaskConstants;
    getFormat(): PFormat;
    getUnitWidth(): number;
    getMinMax(): {
        max: number;
        min: number;
    };
    getHeaders(): GanttHeader[];
    getDateHeaders(): GanttDateHeader;
    getTaskData(): GanttTask[];
    getCoordinatesArray(): MapIterator<ICoordinateData>;
    getCoordinatesMap(): Map<string, ICoordinateData>;
    getTimeLinesCount(): number;
    getCoordinatesPItem(pId: string): ICoordinateData | null;
    getGanttTaskDataMap(): Map<string, IGanttTaskData>;
    getGanttTaskData(pId: string): IGanttTaskData | null;
    getRelationshipMap(): Map<string, IInstruction[]>;
    getRelationShipItem(pId: string): IInstruction[];
    setOperations(operations: Map<string, TaskOperation>): void;
    getOperations(): Map<string, TaskOperation>;
    getItemSymbol(pId: string): string;
    getItemPadding(pId: string): number;
    getTaskItem(x: number, y: number): ICoordinateData | null;
    getGanttTaskItem(x: number, y: number): IGanttTaskData | null;
    closeItem(pId: string): void;
    expandOrClose(x: number, y: number): void;
    private resetContext;
    private getMinMaxDates;
    /**
     * so root nodes have Paren key as default parent
     * as we have tasks in sorted order according to parent child
     * iterate through every task if any task is open(taken from operations) push task into task items
     */
    private setUpTasks;
    private setUpGanttTaskData;
    private getTimeLineLength;
    /**
     * 1. Shift the minimum date backward by 10 units to ensure all task relations are visible.
     * 2. Generate all date labels and compute the total number of timeline units.
     * 3. For each task, calculate the exact X-positions based on its start and end dates.
     * 4. Determine the chart's global minimum and maximum X-positions from all tasks.
     * 5. Compute each task's Y-position using the row index and the fixed row height.
     * 6. Build a coordinate map using PId as the key and the calculated X/Y positions as values.
     */
    private setUpChartData;
    /**
     * 1. set boundaries with minimum and max positions to make turns
     * 2. For a relation to draw we need both source and target data
     * 3. Draw Relations
     */
    private setUpRelations;
    private createTimeLine;
    /**
     * 1. Create instructions to draw task bars
     * 2. Get text wrt to width of task bar
     * 3. Fill text in task bar
     */
    private drawTaskBar;
    private drawSingleRelation;
    private drawSourceSegment;
    private drawCrossTypeSegment;
    private drawTargetSegment;
    private drawFinalArrows;
}
//# sourceMappingURL=engine-context.d.ts.map