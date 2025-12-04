import { GanttHeader, GanttTask } from "../../engine/model";
import {
  Regions,
  COLUMN_PADDING,
  FIRST_COLUMN_PADDING,
  getFittedText,
  GANTT_HEADER_HEIGHT,
  BOX_HEIGHT,
  Region,
  ICoordinateData,
  BAR_RESIDUE,
  BAR_HEIGHT,
  IInstruction,
  RELATION_LINE_WIDTH,
  relationLineColor,
  TOOL_TIP,
  GANTT_LINE_COLOR,
} from "../common";
import { CanvasEngine } from "./canvas-engine";

export class RenderManager {
  private canvasEngine!: CanvasEngine;

  constructor(chartCanvas: CanvasEngine) {
    this.canvasEngine = chartCanvas;
  }

  drawHeaders(headers: GanttHeader[], regions: Regions): void {
    const headerWidth = this.canvasEngine.getCanvasConstants().columnWidth;
    // Example header drawing
    this.canvasEngine.setFillStyle(
      this.canvasEngine.getCanvasConstants().headerBg
    );
    this.canvasEngine.fillRect(
      { x: 0, y: 0 },
      regions.header.width,
      regions.header.height
    );
    this.canvasEngine.setFillStyle(
      this.canvasEngine.getCanvasConstants().canvasBg
    );
    let positionX = 0;
    for (const [index, header] of headers.entries()) {
      const columnWidth = headerWidth * (index == 0 ? 2 : 1);
      const rightPadding = COLUMN_PADDING;
      const leftPadding =
        COLUMN_PADDING + (index == 0 ? FIRST_COLUMN_PADDING : 0);
      // draw rectangle
      this.canvasEngine.rect(
        { x: positionX, y: 0 },
        columnWidth,
        regions.header.height
      );
      // get text
      const text = getFittedText(
        this.canvasEngine.getCanvasContext(),
        columnWidth - (leftPadding + rightPadding),
        header.hName
      );
      // fill text
      this.canvasEngine.fillText(text, {
        x: leftPadding + positionX,
        y: regions.header.height / 2,
      });
      positionX += columnWidth;
    }
  }

  drawDateHeaders(
    header: { labels: string[]; totalUnits: number },
    unitWidth: number
  ): number {
    this.canvasEngine.setFillStyle(
      this.canvasEngine.getCanvasConstants().headerBg
    );
    this.canvasEngine.fillRect(
      { x: 0, y: 0 },
      header.totalUnits * unitWidth,
      GANTT_HEADER_HEIGHT
    );
    this.canvasEngine.setFillStyle(
      this.canvasEngine.getCanvasConstants().canvasBg
    );
    this.canvasEngine.setTextAlign("center");
    const headerY = 0;
    let x = 0;
    // Draw header cells
    for (let i = 0; i < header.labels.length; i++) {
      const label = header.labels[i] || "";
      // Draw cell border
      this.canvasEngine.rect(
        { x: x, y: headerY },
        unitWidth,
        GANTT_HEADER_HEIGHT
      );
      this.canvasEngine.fillText(label, {
        x: x + unitWidth / 2,
        y: headerY + GANTT_HEADER_HEIGHT / 2,
      });
      x += unitWidth;
    }
    this.canvasEngine.setTextAlign("left");

    return x;
  }

  drawTableData = (
    regions: Regions,
    chartData: GanttTask[],
    headers: GanttHeader[],
    canvasHeight: number,
    symbolFun: (pId: string) => string,
    paddingFun: (pId: string) => number
  ): void => {
    const headerWidth = this.canvasEngine.getCanvasConstants().columnWidth;
    this.canvasEngine.fillRect(
      { x: 0, y: 0 },
      regions.data.width,
      Math.max(chartData.length * BOX_HEIGHT, canvasHeight)
    );

    // Draw task names
    for (const [index, task] of chartData.entries()) {
      const y = index * BOX_HEIGHT + BOX_HEIGHT / 2;
      let positionX = 0;
      for (const [i, header] of headers.entries()) {
        const rightPadding = COLUMN_PADDING;
        const extraPadding = paddingFun(task.pId);
        let columnWidth = headerWidth;
        let leftPadding = COLUMN_PADDING;
        let symbol = "";
        if (i == 0) {
          columnWidth = headerWidth * 2;
          leftPadding += extraPadding;
          symbol = symbolFun(task.pId);
        }
        this.canvasEngine.rect(
          { x: positionX, y: index * BOX_HEIGHT },
          columnWidth,
          BOX_HEIGHT
        );
        const text = getFittedText(
          this.canvasEngine.getCanvasContext(),
          columnWidth - (leftPadding + rightPadding),
          task.pData[header.hId] || "N/A"
        );
        this.canvasEngine.fillText(symbol, {
          x: leftPadding + positionX - 20,
          y,
        });
        this.canvasEngine.fillText(text, { x: leftPadding + positionX, y });
        positionX += columnWidth;
      }
    }
  };

  drawRegion(region: Region, drawFn: () => void): void {
    this.canvasEngine.drawRegion(region, drawFn);
  }

  drawTasks(
    chartData: GanttTask[],
    totalUnits: number,
    unitWidth: number,
    height: number,
    getCoordinatesPItem: (item: string) => ICoordinateData | null | undefined
  ): void {
    this.canvasEngine.fillRect(
      { x: 0, y: 0 },
      totalUnits * unitWidth,
      Math.max(chartData.length * BOX_HEIGHT, height)
    );
    this.drawVerticalLines(
      Math.max(chartData.length * BOX_HEIGHT, height),
      totalUnits,
      unitWidth
    );

    const yResidue = BAR_RESIDUE / 2;
    let positionY = yResidue;

    chartData.forEach((item) => {
      const taskBar = getCoordinatesPItem(item.pId);
      if (taskBar) {
        this.canvasEngine.setFillStyle(item.pDurations.gClass);
        this.canvasEngine.followInstructions(taskBar.instructions);
        this.canvasEngine.setFillStyle(
          this.canvasEngine.getCanvasConstants().canvasBg
        );
      }
      positionY += BAR_HEIGHT + yResidue * 2;
      this.drawHorizontalLine(0, positionY - yResidue, totalUnits * unitWidth);
    });
  }

  drawRelations(
    chartData: GanttTask[],
    relationShipInstructions: (item: string) => IInstruction[]
  ): void {
    this.canvasEngine.setLineWidth(RELATION_LINE_WIDTH);
    chartData.forEach((task) => {
      task.pRelation.forEach((relation) => {
        this.canvasEngine.setStrokeColor(
          relationLineColor(relation.pType)
        );
        const key = `${task.pId}#_#${relation.pTarget}#_#${relation.pType}`;
        const instructions = relationShipInstructions(key);
        this.canvasEngine.followInstructions(instructions);
        // follow instructions
      });
    });
    this.canvasEngine.setStrokeColor(
      this.canvasEngine.getCanvasConstants().lineColor
    );
    this.canvasEngine.setLineWidth(1);
  }

  drawToolTip(
    position: { x: number; y: number } | undefined,
    data: ICoordinateData | null
  ) {
    if (position && data) {
      this.canvasEngine.setFillStyle("#000");
      this.canvasEngine.box(
        { x: position.x - TOOL_TIP.offsetX, y: position.y - TOOL_TIP.offsetY },
        TOOL_TIP.width,
        TOOL_TIP.height,
        TOOL_TIP.radius
      );
      this.canvasEngine.moveTo(position.x, position.y);
      this.canvasEngine.lineTo(
        position.x - TOOL_TIP.triangle,
        position.y - (TOOL_TIP.offsetY - TOOL_TIP.height)
      );
      this.canvasEngine.lineTo(
        position.x + TOOL_TIP.triangle,
        position.y - (TOOL_TIP.offsetY - TOOL_TIP.height)
      );
      this.canvasEngine.closePath();
      this.canvasEngine.fill();

      this.canvasEngine.setFillStyle(GANTT_LINE_COLOR);
      this.canvasEngine.setFont("10px Arial");
      this.canvasEngine.writeText(
        `${data.data.title} ${data.data.percentage}`,
        {
          x: position.x - TOOL_TIP.offsetX + 10,
          y: position.y - TOOL_TIP.offsetY + 15,
        }
      );
      this.canvasEngine.writeText(`Start Date: ${data.data.startDate}`, {
        x: position.x - TOOL_TIP.offsetX + 10,
        y: position.y - TOOL_TIP.offsetY + 30,
      });
      this.canvasEngine.writeText(`End Date:  ${data.data.endDate}`, {
        x: position.x - TOOL_TIP.offsetX + 10,
        y: position.y - TOOL_TIP.offsetY + 45,
      });
      this.canvasEngine.setFillStyle(
        this.canvasEngine.getCanvasConstants().canvasBg
      );
      this.canvasEngine.setFont(this.canvasEngine.getCanvasConstants().font);
    }
  }

  drawVerticalLines(
    chartHeight: number,
    totalUnits: number,
    unitWidth: number
  ): void {
    this.canvasEngine.setLineWidth(1.5);
    for (let i = 0; i <= totalUnits; i++) {
      const x = i * unitWidth;
      this.canvasEngine.beginPath();
      this.canvasEngine.moveTo(x, 0);
      this.canvasEngine.lineTo(x, chartHeight);
      this.canvasEngine.stroke();
    }
    this.canvasEngine.setLineWidth(1);
  }

  drawHorizontalLine = (
    positionX: number,
    positionY: number,
    width: number
  ): void => {
    this.canvasEngine.setLineWidth(1.5);
    this.canvasEngine.beginPath();
    this.canvasEngine.moveTo(positionX, positionY);
    this.canvasEngine.lineTo(positionX + width, positionY);
    this.canvasEngine.stroke();
    this.canvasEngine.setLineWidth(1);
  };
}
