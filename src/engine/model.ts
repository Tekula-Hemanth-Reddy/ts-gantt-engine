export type PFormat = "day" | "week" | "month" | "quarter" | "year";
export type PType = "FF" | "SF" | "FS" | "SS";

export interface GanttTask {
  pId: string;
  pName: string;
  pDurations: {
    gClass: string;
    gStart?: Date;
    gEnd?: Date;
    gPercentage?: number;
  };
  pParent?: string;
  pRelation: {
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
}

export interface IGanttEngine {
  getCanvas(): HTMLCanvasElement;
  getBounds(): number[];
  setFormat(format: PFormat): void;
  render(
    headers: GanttHeader[],
    data: GanttTask[],
    options: GanttOptions
  ): void;
  clearScreen(): void;
  destroy(): void;
}
