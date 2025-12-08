import { type GanttDuration, type GanttHeader, type GanttTask } from "../../engine/model.js";
import {
  TOOL_TIP,
  COLUMN_PADDING,
  RELATION_LINE_WIDTH,
  FIRST_COLUMN_PADDING,
  getFittedText,
  type Point,
  type Region,
  type Regions,
  type IInstruction,
  type ICoordinateData,
  type IGanttTaskData,
} from "../common/index.js";
import { CanvasConstants, TaskConstants } from "./base/index.js";
import { CanvasEngine } from "./canvas-engine.js";

export class RenderManager {
  private canvasEngine!: CanvasEngine;
  private taskConstants!: TaskConstants;
  private canvasConstants!: CanvasConstants;

  constructor(chartCanvas: CanvasEngine, taskConstants: TaskConstants, canvasConstants: CanvasConstants) {
    this.canvasEngine = chartCanvas;
    this.taskConstants = taskConstants;
    this.canvasConstants = canvasConstants;
  }

  drawCanvasBox(point: Point, width: number, height: number) {
    this.canvasEngine.rect(point, width, height);
  }

  drawHeaders(headers: GanttHeader[], regions: Regions): void {
    const headerWidth = this.canvasConstants.getColumnWidth();
    const headerHeight = this.canvasConstants.getHeaderHeight();
    // Example header drawing
    this.canvasEngine.setFillStyle(
      this.canvasConstants.getHeaderBg()
    );
    this.canvasEngine.fillRect(
      { x: 0, y: 0 },
      regions.header.width,
      headerHeight
    );
    this.canvasEngine.setFillStyle(
      this.canvasConstants.getCanvasBg()
    );
    let positionX = 0;
    for (const [index, header] of headers.entries()) {
      const columnWidth = headerWidth * (index == 0 ? 2 : 1);
      const rightPadding = COLUMN_PADDING;
      const leftPadding =
        COLUMN_PADDING + (index == 0 ? FIRST_COLUMN_PADDING : 0);
      // draw rectangle
      this.canvasEngine.rect({ x: positionX, y: 0 }, columnWidth, headerHeight);
      // get text
      const text = getFittedText(
        this.canvasEngine.getCanvasContext(),
        columnWidth - (leftPadding + rightPadding),
        header.hName
      );
      // fill text
      this.canvasEngine.fillText(text, {
        x: leftPadding + positionX,
        y: headerHeight / 2,
      });
      positionX += columnWidth;
    }
  }

  drawDateHeaders(
    header: { labels: string[]; totalUnits: number },
    unitWidth: number
  ): number {
    const headerHeight = this.canvasConstants.getHeaderHeight();
    this.canvasEngine.setFillStyle(
      this.canvasConstants.getHeaderBg()
    );
    this.canvasEngine.fillRect(
      { x: 0, y: 0 },
      header.totalUnits * unitWidth,
      headerHeight
    );
    this.canvasEngine.setFillStyle(
      this.canvasConstants.getCanvasBg()
    );
    this.canvasEngine.setTextAlign("center");
    const headerY = 0;
    let x = 0;
    // Draw header cells
    for (let i = 0; i < header.labels.length; i++) {
      const label = header.labels[i] || "";
      // Draw cell border
      this.canvasEngine.rect({ x: x, y: headerY }, unitWidth, headerHeight);
      this.canvasEngine.fillText(label, {
        x: x + unitWidth / 2,
        y: headerY + headerHeight / 2,
      });
      x += unitWidth;
    }
    this.canvasEngine.setTextAlign("left");

    return x;
  }

  drawTableData = (
    regions: Regions,
    chartData: GanttTask[],
    canvasHeight: number,
    timeLinesCount: number,
    getGanttTaskData: (pId: string) => IGanttTaskData | null,
  ): void => {
    this.canvasEngine.fillRect(
      { x: 0, y: 0 },
      regions.data.width,
      Math.max(timeLinesCount * this.taskConstants.getBoxHeight(), canvasHeight)
    );

    // Draw task names
    for (const task of chartData) {
      const ganttTaskData = getGanttTaskData(task.pId);
      if (ganttTaskData) {
        this.canvasEngine.followInstructions(ganttTaskData.instructions);
      }
    }

    this.canvasEngine.rect(
      { x: 0, y: 0 },
      regions.data.width,
      Math.max(timeLinesCount * this.taskConstants.getBoxHeight(), canvasHeight)
    );
  };

  drawRegion(region: Region, drawFn: () => void): void {
    this.canvasEngine.drawRegion(region, drawFn);
  }

  drawTimeLines(item: GanttDuration['gClass'], taskBar: ICoordinateData | null | undefined, positionY: number, yResidue: number): { positionY: number; taskDrawn: boolean } {
    let taskDrawn = false;
    if (taskBar) {
      taskDrawn = true;
      this.canvasEngine.setFillStyle(item);
      this.canvasEngine.followInstructions(taskBar.instructions);
      this.canvasEngine.setFillStyle(
        this.canvasConstants.getCanvasBg()
      );
      positionY += this.taskConstants.getBarHeight() + yResidue * 2;
    }
    return {positionY, taskDrawn};
  }

  drawTasks(
    chartData: GanttTask[],
    totalUnits: number,
    unitWidth: number,
    height: number,
    timeLinesCount: number,
    getCoordinatesPItem: (item: string) => ICoordinateData | null | undefined
  ): void {
    this.canvasEngine.rect(
      { x: 0, y: 0 },
      totalUnits * unitWidth,
      Math.max(timeLinesCount * this.taskConstants.getBoxHeight(), height)
    );
    this.canvasEngine.fill();
    this.drawVerticalLines(
      Math.max(timeLinesCount * this.taskConstants.getBoxHeight(), height),
      totalUnits,
      unitWidth
    );

    const yResidue = this.taskConstants.getVerticalResidue() / 2;
    let positionY = yResidue;

    chartData.forEach((item) => {
      const taskBar = getCoordinatesPItem(item.pId);
      const mainTimeLine = this.drawTimeLines(item.pMainTimeline.gClass, taskBar, positionY, yResidue);
      positionY = mainTimeLine.positionY;
      item.pTimelines.forEach((timeLine) => {
        const timeLineBar = getCoordinatesPItem(`${item.pId}#_#${timeLine.gId}`);
        const otherTimeLine = this.drawTimeLines(timeLine.gClass, timeLineBar, positionY, yResidue);
        positionY = otherTimeLine.positionY;
        mainTimeLine.taskDrawn = (mainTimeLine.taskDrawn || otherTimeLine.taskDrawn);
      });
      if(!mainTimeLine.taskDrawn)
      {
        positionY += this.taskConstants.getBarHeight() + yResidue * 2;
      }
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
        this.canvasEngine.setStrokeColor(this.canvasEngine.getRelationColor(relation.pType));
        const key = `${task.pId}#_#${relation.pTarget}#_#${relation.pType}`;
        const instructions = relationShipInstructions(key);
        this.canvasEngine.followInstructions(instructions);
        // follow instructions
      });
    });
    this.canvasEngine.setStrokeColor(
      this.canvasConstants.getLineColor()
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
        data.data.toolTipWidth,
        TOOL_TIP.height,
        this.taskConstants.getRadius()
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

      this.canvasEngine.setFillStyle(this.canvasConstants.getLineColor());
      this.canvasEngine.setFont("10px Arial");
      const title = getFittedText(this.canvasEngine.getCanvasContext(), data.data.toolTipWidth, `${data.data.title} | ${data.data.description}`);
      this.canvasEngine.writeText(
        title,
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
        this.canvasConstants.getCanvasBg()
      );
      this.canvasEngine.setFont(this.canvasConstants.getFont());
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
