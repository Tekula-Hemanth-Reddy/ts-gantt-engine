export type PFormat = "day" | "week" | "month" | "quarter" | "year";
export type PType = "FF" | "SF" | "FS" | "SS";
export type GanttDurationType = "main" | "original" | "planned" | "updated" | "actual" | "critical" | "baseline" | "forecast" | string;
export interface GanttDuration {
    gId: GanttDurationType;
    gName: string;
    gClass: string;
    gStart?: Date;
    gEnd?: Date;
    gPercentage: number;
}
export interface GanttTask {
    pId: string;
    pName: string;
    pMainTimeline: GanttDuration;
    pTimelines: GanttDuration[];
    pParent?: string;
    pRelation?: {
        pTarget: string;
        pType: PType;
    }[];
    pData: {
        [key: string]: string;
    };
}
export interface GanttHeader {
    hId: string;
    hName: string;
}
export interface GanttOptions {
    columnWidth?: number;
    headerHeight?: number;
    headerBg?: string;
    canvasBg?: string;
    fontColor?: string;
    lineColor?: string;
    font?: string;
    boxHeight?: number;
    barHeight?: number;
    barHorizontalResidue?: number;
    barVerticalResidue?: number;
    curveRadius?: number;
}
export interface RelationColors {
    FS: string;
    SF: string;
    SS: string;
    FF: string;
}
export interface IGanttEngine {
    getCanvas(): HTMLCanvasElement;
    getBounds(): number[];
    setFormat(format: PFormat): void;
    render(headers: GanttHeader[], data: GanttTask[], options: GanttOptions, relationColors?: RelationColors, timeZone?: string): void;
    clearScreen(): void;
    destroy(): void;
}
//# sourceMappingURL=model.d.ts.map