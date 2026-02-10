export type PFormat = "day" | "week" | "month" | "quarter" | "year";
export type PType = "FF" | "SF" | "FS" | "SS";

export type GanttDurationType =
  | "main"
  | "original"
  | "planned"
  | "updated"
  | "actual"
  | "critical"
  | "baseline"
  | "forecast"
  | string;

export interface GanttDuration {
  gId: GanttDurationType;   // e.g., main, planned, actual, etc.
  gName: string;          // label
  gClass: string;          // css class for color/styling
  gStart?: Date;            // required for main
  gEnd?: Date;              // required for main
  gPercentage: number;
}

export interface GanttTask {
  pId: string;
  pName: string;
  // REQUIRED timeline – primary bar
  pMainTimeline: GanttDuration;
  // optional comparison durations
  pTimelines: GanttDuration[];
  pParent?: string;
  pRelation?: {
    pTarget: string;
    pType: PType;
  }[];
  pData: { [key: string]: string }; // key has to be hId
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
  FS: string; // Finish to Start
  SF: string; // Start to Finish
  SS: string; // Start to Start
  FF: string; // Finish to Finish
}

export interface IGanttEngine {
  getCanvas(): HTMLCanvasElement;
  getBounds(): number[];
  setFormat(format: PFormat): void;
  render(
    headers: GanttHeader[],
    data: GanttTask[],
    options: GanttOptions,
    relationColors?: RelationColors,
    timeZone?: string
  ): void;
  clearScreen(): void;
  destroy(): void;
}
