export type Point = {
    x: number;
    y: number;
};
export type TaskCoordinates = {
    start: Point;
    end: Point;
};
export type RelationType = "S" | "F";
export type Direction = 1 | -1;
export declare enum REGIONS {
    HEADER = "HEADER",
    DATE_HEADER = "DATE_HEADER",
    DATA = "DATA",
    GANTT = "GANTT"
}
export declare enum Instruction {
    BEGIN_PATH = "BEGIN_PATH",
    CLOSE_PATH = "CLOSE_PATH",
    FILL = "FILL",
    STROKE = "STROKE",
    FILL_TEXT = "FILL_TEXT",
    MOVE_TO = "MOVE_TO",
    LINE_TO = "LINE_TO",
    ARC_TO = "ARC_TO",
    QUADRATIC_CURVE_TO = "QUADRATIC_CURVE_TO",
    TRIANGLE = "TRIANGLE",
    BOX = "Box"
}
export interface Region {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface Regions {
    header: Region;
    dates: Region;
    data: Region;
    gantt: Region;
}
export interface RelationDrawingState {
    currentX: number;
    currentY: number;
}
export interface GanttDateHeader {
    totalUnits: number;
    labels: string[];
}
export interface TaskOperation {
    open: boolean;
    symbol: string;
    padding: number;
    children: string[];
}
export interface IInstruction {
    instruction: Instruction;
    data: (string | number)[];
}
export interface ICanvasConstants {
    columnWidth: number;
    rowHeight: number;
    headerBg: string;
    canvasBg: string;
    lineColor: string;
    textColor: string;
    font: string;
}
export interface ICoordinateData {
    start: {
        x: number;
        y: number;
    };
    end: {
        x: number;
        y: number;
    };
    instructions: IInstruction[];
    data: {
        pId: string;
        title: string;
        startDate: string;
        endDate: string;
        percentage: string;
    };
}
//# sourceMappingURL=internal-types.d.ts.map