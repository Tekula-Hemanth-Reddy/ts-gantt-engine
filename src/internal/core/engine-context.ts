import moment from "moment-timezone";
import {
  type PFormat,
  type GanttHeader,
  type GanttTask,
  type GanttDuration,
  type PType,
} from "../../engine/model.js";
import {
  ganttUnitWidth,
  PARENT_KEY,
  isBefore,
  isAfter,
  generateGanttHeader,
  getExactPosition,
  momentString,
  RELATION_BOUNDARY_PADDING,
  getRelationShipGap,
  Instruction,
  getFittedText,
  getDirectionMultiplier,
  RELATION_VERTICAL_OFFSET_MULTIPLIER,
  getVerticalOffset,
  RELATION_MINIMUM_GAP,
  RELATION_MIDPOINT_DIVISOR,
  formatBuffer,
  COLUMN_PADDING,
  TOOL_TIP,
  textWidth,
  type TaskOperation,
  type GanttDateHeader,
  type ICoordinateData,
  type IInstruction,
  type RelationType,
  type TaskCoordinates,
  type RelationDrawingState,
  type Direction,
  type IGanttTaskData,
} from "../common/index.js";
import {
  CanvasConstants,
  ExpandCollapse,
  TaskConstants,
} from "./base/index.js";

export class EngineContext {
  private _canvasCtx: CanvasRenderingContext2D;

  // Items specific to Format
  private unitWidth: number;
  private format: PFormat;
  private minDate!: Date;
  private maxDate!: Date;

  // Data related to tasks
  private headers: GanttHeader[] = [];
  private originalTaskData: GanttTask[];
  private taskData!: GanttTask[];
  private operations!: Map<string, TaskOperation>;
  private timeZone?: string;
  private datesHeader: GanttDateHeader = { totalUnits: 0, labels: [] };

  // Constants
  private canvasConstants!: CanvasConstants;
  private taskConstants!: TaskConstants;
  private expandCollapseSymbol!: ExpandCollapse;

  // Task map
  private timeLinesCount = 0;
  private max_min_map: { max: number; min: number } = {
    max: Number.MIN_SAFE_INTEGER,
    min: Number.MAX_SAFE_INTEGER,
  };
  private coordinateMap: Map<string, ICoordinateData> = new Map();
  private ganttTaskDataMap: Map<string, IGanttTaskData> = new Map();
  private relationShipInstructions: Map<string, IInstruction[]> = new Map();
  private relationShipConstants: Map<
    string,
    Record<PType, { max: number; min: number }>
  > = new Map();

  constructor(
    canvasCtx: CanvasRenderingContext2D,
    format: PFormat,
    headers: GanttHeader[],
    data: GanttTask[],
    operations: Map<string, TaskOperation>,
    canvasConstants: CanvasConstants,
    taskConstants: TaskConstants,
    expandCollapseSymbol: ExpandCollapse,
    timeZone?: string
  ) {
    this._canvasCtx = canvasCtx;
    this.format = format;
    this.headers = headers;
    this.originalTaskData = data;
    this.operations = operations;
    this.canvasConstants = canvasConstants;
    this.taskConstants = taskConstants;
    this.expandCollapseSymbol = expandCollapseSymbol;
    this.unitWidth = ganttUnitWidth(this.format);
    if (timeZone) {
      this.timeZone = timeZone;
    }
    this.setUpTasks();
  }

  //#region.......... Getters ..................
  getTaskConstants() {
    return this.taskConstants;
  }
  getFormat() {
    return this.format;
  }
  getUnitWidth() {
    return this.unitWidth;
  }
  getMinMax() {
    return this.max_min_map;
  }
  getHeaders() {
    return this.headers;
  }
  getDateHeaders() {
    return this.datesHeader;
  }
  getTaskData() {
    return this.taskData;
  }
  getCoordinatesArray() {
    return this.coordinateMap.values();
  }
  getCoordinatesMap() {
    return this.coordinateMap;
  }
  getTimeLinesCount() {
    return this.timeLinesCount;
  }
  getCoordinatesPItem(pId: string) {
    return this.getCoordinatesMap().get(pId) || null;
  }
  getGanttTaskDataMap() {
    return this.ganttTaskDataMap;
  }

  getGanttTaskData(pId: string) {
    return this.getGanttTaskDataMap().get(pId) || null;
  }

  getRelationshipMap() {
    return this.relationShipInstructions;
  }

  getRelationShipItem(pId: string) {
    return this.getRelationshipMap().get(pId) || [];
  }

  setOperations(operations: Map<string, TaskOperation>) {
    this.operations = new Map(operations);
    this.setUpTasks();
  }

  getOperations() {
    return this.operations;
  }

  getItemSymbol(pId: string) {
    const operation = this.operations.get(pId);
    return operation?.symbol || this.expandCollapseSymbol.getNeutral();
  }

  getItemPadding(pId: string) {
    const operation = this.operations.get(pId);
    return operation?.padding || 0;
  }

  getTaskItem(x: number, y: number) {
    for (const item of this.getCoordinatesArray()) {
      if (
        x >= item.start.x &&
        x <= item.end.x &&
        y >= item.start.y &&
        y <= item.end.y
      ) {
        return item;
      }
    }
    return null;
  }
  getGanttTaskItem(x: number, y: number) {
    for (const item of this.getGanttTaskDataMap().values()) {
      if (
        x >= item.start.x &&
        x <= item.end.x &&
        y >= item.start.y &&
        y <= item.end.y
      ) {
        return item;
      }
    }
    return null;
  }

  closeItem(pId: string) {
    const operation = this.operations.get(pId);
    if (operation && operation.children.length) {
      operation.open = false;
      operation.symbol = this.expandCollapseSymbol.getExpand();
      for (const item of operation.children) {
        this.closeItem(item);
      }
    }
  }

  expandOrClose(x: number, y: number) {
    if (x < this.canvasConstants.getColumnWidth() * 2) {
      const ganttTaskItem = this.getGanttTaskItem(x, y);
      if (!ganttTaskItem) {
        return;
      }
      const operation = this.operations.get(ganttTaskItem.data.pId);
      if (operation && operation.children.length) {
        if (!operation.open) {
          operation.open = true;
          operation.symbol = this.expandCollapseSymbol.getCollapse();
        } else {
          this.closeItem(ganttTaskItem.data.pId);
        }
        this.setUpTasks();
      }
    }
  }
  //#endregion.......... Getters ..................

  private resetContext(){
    this.max_min_map = {
      max: Number.MIN_SAFE_INTEGER,
      min: Number.MAX_SAFE_INTEGER,
    };
    this.coordinateMap.clear();
    this.relationShipInstructions.clear();
    this.ganttTaskDataMap.clear();
    this.relationShipConstants.clear();
  }

  private getMinMaxDates(
    timeLine: GanttDuration,
    minDate: Date,
    maxDate: Date
  ) {
    if (timeLine.gStart && isBefore(timeLine.gStart, minDate, this.timeZone)) {
      minDate = timeLine.gStart;
    }
    if (timeLine.gEnd && isAfter(timeLine.gEnd, maxDate, this.timeZone)) {
      maxDate = timeLine.gEnd;
    }
    return {
      minDate,
      maxDate,
      timeLineCount: timeLine.gStart && timeLine.gEnd ? 1 : 0,
    };
  }
  /**
   * so root nodes have Paren key as default parent
   * as we have tasks in sorted order according to parent child
   * iterate through every task if any task is open(taken from operations) push task into task items
   */
  private setUpTasks() {
    const chartData: GanttTask[] = [];
    this.timeLinesCount = 0;
    let minimumDate = new Date();
    let maximumDate = new Date();
    for (const item of this.originalTaskData) {
      const operation = this.operations.get(item.pParent || PARENT_KEY);
      let timeLineCount = 0;
      if (operation?.open || false) {
        const dates = this.getMinMaxDates(
          item.pMainTimeline,
          minimumDate,
          maximumDate
        );
        minimumDate = dates.minDate;
        maximumDate = dates.maxDate;
        timeLineCount += dates.timeLineCount;
        for (const timeLine of item.pTimelines) {
          const dates = this.getMinMaxDates(timeLine, minimumDate, maximumDate);
          minimumDate = dates.minDate;
          maximumDate = dates.maxDate;
          timeLineCount += dates.timeLineCount;
        }
        this.timeLinesCount += timeLineCount || 1;
        chartData.push(item);
      }
    }
    this.taskData = chartData;
    this.resetContext();
    this.setUpGanttTaskData();
    this.setUpChartData(minimumDate, maximumDate);
  }

  private setUpGanttTaskData() {
    const headerWidth = this.canvasConstants.getColumnWidth();
    let positionY = 0;
    for (const task of this.taskData) {
      let positionX = 0;
      const boxHeight =
        this.taskConstants.getBoxHeight() * this.getTimeLineLength(task);
      const textPositionY = positionY + boxHeight / 2;
      const instructions: IInstruction[] = [];
      for (const [i, header] of this.headers.entries()) {
        const rightPadding = COLUMN_PADDING;
        const extraPadding = this.getItemPadding(task.pId);
        let columnWidth = headerWidth;
        let leftPadding = COLUMN_PADDING;
        let symbol = "";
        if (i == 0) {
          columnWidth = headerWidth * 2;
          leftPadding += extraPadding;
          symbol = this.getItemSymbol(task.pId);
          this.ganttTaskDataMap.set(task.pId, {
            start: { x: positionX, y: positionY },
            end: { x: positionX + columnWidth, y: positionY + boxHeight },
            instructions: [],
            data: {
              pId: task.pId,
              title: task.pName,
            },
          });
        }
        instructions.push({
          instruction: Instruction.RECT,
          data: [positionX, positionY, columnWidth, boxHeight],
        });
        const text = getFittedText(
          this._canvasCtx,
          columnWidth - (leftPadding + rightPadding),
          task.pData[header.hId] || "N/A"
        );
        instructions.push({
          instruction: Instruction.FILL_TEXT,
          data: [symbol, leftPadding + positionX - 20, textPositionY],
        });
        instructions.push({
          instruction: Instruction.FILL_TEXT,
          data: [text, leftPadding + positionX, textPositionY],
        });
        positionX += columnWidth;
      }
      this.ganttTaskDataMap.get(task.pId)?.instructions.push(...instructions);
      positionY += boxHeight;
    }
  }

  private getTimeLineLength(task: GanttTask) {
    let len = 0;
    if (task.pMainTimeline.gStart && task.pMainTimeline.gEnd) {
      len++;
    }
    for (const timeLine of task.pTimelines) {
      if (timeLine.gStart && timeLine.gEnd) {
        len++;
      }
    }
    return len == 0 ? 1 : len;
  }

  /**
   * 1. Shift the minimum date backward by 10 units to ensure all task relations are visible.
   * 2. Generate all date labels and compute the total number of timeline units.
   * 3. For each task, calculate the exact X-positions based on its start and end dates.
   * 4. Determine the chart's global minimum and maximum X-positions from all tasks.
   * 5. Compute each task's Y-position using the row index and the fixed row height.
   * 6. Build a coordinate map using PId as the key and the calculated X/Y positions as values.
   */
  private setUpChartData(minimumDate: Date, maximumDate: Date) {
    const buffer = formatBuffer(this.format);
    // set Minimum and Maximum Dates
    // Parse dates as UTC first, then convert to timezone if provided
    const minimumDateMoment = this.timeZone 
      ? moment.utc(minimumDate).tz(this.timeZone) 
      : moment(minimumDate);
    const maximumDateMoment = this.timeZone 
      ? moment.utc(maximumDate).tz(this.timeZone) 
      : moment(maximumDate);
    this.minDate = new Date(minimumDateMoment.subtract(buffer, this.format).toDate());
    this.maxDate = new Date(maximumDateMoment.add(buffer, this.format).toDate());
    // Get Date Headers
    this.datesHeader = generateGanttHeader(
      this.format,
      this.minDate,
      this.maxDate,
      this.timeZone
    );

    this.max_min_map = {
      max: Number.MIN_SAFE_INTEGER,
      min: Number.MAX_SAFE_INTEGER,
    };
    const yResidue = this.taskConstants.getVerticalResidue() / 2;
    let positionY = yResidue;
    for (const item of this.taskData) {
      const mainKey = `${item.pId}`;
      const mainTimeLine = this.createTimeLine(
        mainKey,
        item,
        item.pMainTimeline,
        positionY,
        yResidue
      );
      positionY = mainTimeLine.positionY;
      for (const timeLine of item.pTimelines || []) {
        const key = `${item.pId}#_#${timeLine.gId}`;
        const otherTimeLine = this.createTimeLine(
          key,
          item,
          timeLine,
          positionY,
          yResidue
        );
        positionY = otherTimeLine.positionY;
        mainTimeLine.taskDrawn =
          mainTimeLine.taskDrawn || otherTimeLine.taskDrawn;
      }
      if (!mainTimeLine.taskDrawn) {
        positionY += this.taskConstants.getBarHeight() + yResidue * 2;
      }
    }
    this.setUpRelations();
  }

  /**
   * 1. set boundaries with minimum and max positions to make turns
   * 2. For a relation to draw we need both source and target data
   * 3. Draw Relations
   */
  private setUpRelations() {
    const boundaries = {
      max: this.max_min_map.max + RELATION_BOUNDARY_PADDING * 2,
      min: this.max_min_map.min - RELATION_BOUNDARY_PADDING * 2,
    };
    // Iterate through all tasks and their relations
    for (const task of this.taskData) {
      for (const relation of task.pRelation || []) {
        // Validate relation has source and target, and they're different
        if (!task.pId || !relation.pTarget || task.pId === relation.pTarget) {
          continue;
        }

        // Get coordinates for source and target tasks
        const source = this.coordinateMap.get(task.pId);
        const target = this.coordinateMap.get(relation.pTarget);

        // Only draw if both coordinates exist
        if (!source || !target) {
          continue;
        }

        const RELATION_GAP = getRelationShipGap(relation.pType);

        let relationNode = this.relationShipConstants.get(target.data.pId);
        if (!relationNode) {
          relationNode = {
            SS: { min: 0, max: 0 },
            SF: { min: 0, max: 0 },
            FF: { min: 0, max: 0 },
            FS: { min: 0, max: 0 },
          };
        }
        let internalBoundaries = { ...boundaries };
        let boundariesChanged = false;
        if (
          relationNode[relation.pType].max == 0 &&
          relationNode[relation.pType].min == 0
        ) {
          relationNode[relation.pType] = internalBoundaries;
          boundariesChanged = true;
          this.relationShipConstants.set(target.data.pId, relationNode);
        } else {
          internalBoundaries = { ...relationNode[relation.pType] };
        }
        // Draw the relation and update boundaries if needed
        const instructions: IInstruction[] = this.drawSingleRelation(
          {
            start: {
              x: source.start.x,
              y: source.start.y + this.taskConstants.getBarHeight() / 2,
            },
            end: {
              x: source.end.x,
              y: source.start.y + this.taskConstants.getBarHeight() / 2,
            },
          },
          {
            start: {
              x: target.start.x,
              y: target.start.y + this.taskConstants.getBarHeight() / 2,
            },
            end: {
              x: target.end.x,
              y: target.start.y + this.taskConstants.getBarHeight() / 2,
            },
          },
          relation.pType,
          internalBoundaries,
          RELATION_GAP
        );
        this.relationShipInstructions.set(
          `${task.pId}#_#${relation.pTarget}#_#${relation.pType}`,
          instructions
        );

        if (boundariesChanged) {
          const [sourceType, targetType] = relation.pType.split("") as [
            RelationType,
            RelationType
          ];

          // Expand boundaries for subsequent relations to avoid overlap
          if (sourceType === "F" || targetType === "F") {
            boundaries.max += RELATION_BOUNDARY_PADDING;
          }
          if (sourceType === "S" || targetType === "S") {
            boundaries.min -= RELATION_BOUNDARY_PADDING;
          }
        }
      }
    }
  }

  private createTimeLine(
    key: string,
    item: GanttTask,
    timeLine: GanttDuration,
    positionY: number,
    yResidue: number
  ): { positionY: number; taskDrawn: boolean } {
    let taskDrawn = false;
    if (timeLine.gStart && timeLine.gEnd) {
      taskDrawn = true;
      let startX = getExactPosition(
        this.minDate,
        timeLine.gStart,
        this.format,
        true,
        this.timeZone
      );
      let endX = getExactPosition(
        this.minDate,
        timeLine.gEnd,
        this.format,
        false,
        this.timeZone
      );
      if (this.format === "day") {
        endX = endX + ganttUnitWidth(this.format);
      }
      if (endX < startX) {
        const a = startX;
        startX = endX;
        endX = a;
      } else if (endX - startX < this.taskConstants.getVerticalResidue()) {
        endX = startX + this.taskConstants.getVerticalResidue();
      }
      this.max_min_map.max = Math.max(this.max_min_map.max, endX);
      this.max_min_map.min = Math.min(this.max_min_map.min, startX);
      const toolTipWidth = Math.min(
        Math.max(
          textWidth(
            this._canvasCtx,
            `${item.pName} | ${timeLine.gName} ${timeLine.gPercentage || 0} %`,
            TOOL_TIP.width
          ),
          textWidth(
            this._canvasCtx,
            `Start Date: ${momentString(timeLine.gStart, this.timeZone)}`,
            TOOL_TIP.width
          ),
          textWidth(
            this._canvasCtx,
            `End Date: ${momentString(timeLine.gEnd, this.timeZone)}`,
            TOOL_TIP.width
          )
        ),
        TOOL_TIP.maxWidth
      );
      this.coordinateMap.set(key, {
        start: { x: startX, y: positionY },
        end: { x: endX, y: positionY + this.taskConstants.getBarHeight() },
        instructions: this.drawTaskBar(
          startX,
          positionY,
          endX - startX,
          this.taskConstants.getBarHeight(),
          `${item.pName} | ${timeLine.gName}`
        ),
        data: {
          key: key,
          pId: item.pId,
          gId: timeLine.gId,
          title: item.pName,
          description: timeLine.gName,
          startDate: momentString(timeLine.gStart, this.timeZone),
          endDate: momentString(timeLine.gEnd, this.timeZone),
          percentage: `${timeLine.gPercentage || 0} %`,
          toolTipWidth: toolTipWidth,
        },
      });
      positionY += this.taskConstants.getBarHeight() + yResidue * 2;
    }
    return { positionY, taskDrawn: taskDrawn };
  }

  /**
   * 1. Create instructions to draw task bars
   * 2. Get text wrt to width of task bar
   * 3. Fill text in task bar
   */
  private drawTaskBar(
    positionX: number,
    positionY: number,
    barWidth: number,
    barHeight: number,
    text: string
  ) {
    const instructions: IInstruction[] = [];
    instructions.push({
      instruction: Instruction.BEGIN_PATH,
      data: [],
    });
    instructions.push({
      instruction: Instruction.MOVE_TO,
      data: [positionX + this.taskConstants.getRadius(), positionY],
    });
    instructions.push({
      instruction: Instruction.BOX,
      data: [
        positionX,
        positionY,
        barWidth,
        barHeight,
        this.taskConstants.getRadius(),
      ],
    });
    instructions.push({
      instruction: Instruction.CLOSE_PATH,
      data: [],
    });
    instructions.push({
      instruction: Instruction.FILL,
      data: [],
    });
    instructions.push({
      instruction: Instruction.STROKE,
      data: [],
    });

    const textX = positionX + this.taskConstants.getHorizontalResidue(); // Default position with padding
    const textY = positionY + this.taskConstants.getBarHeight() / 2;
    const availableWidth =
      barWidth - this.taskConstants.getHorizontalResidue() * 2;
    const chartText = getFittedText(this._canvasCtx, availableWidth, text);
    instructions.push({
      instruction: Instruction.FILL_TEXT,
      data: [chartText, textX, textY],
    });
    return instructions;
  }

  private drawSingleRelation(
    source: TaskCoordinates,
    target: TaskCoordinates,
    relationType: PType,
    boundaries: { min: number; max: number },
    RELATION_GAP: number
  ) {
    const [sourceType, targetType] = relationType.split("") as [
      RelationType,
      RelationType
    ];
    const goingDown = source.end.y < target.end.y;
    const direction = getDirectionMultiplier(goingDown);
    const instructions: IInstruction[] = [];

    instructions.push({
      instruction: Instruction.BEGIN_PATH,
      data: [],
    });

    // Draw source segment
    let state = this.drawSourceSegment(
      sourceType,
      source,
      boundaries,
      goingDown,
      RELATION_GAP,
      instructions
    );

    // Draw cross-type segment if source and target types differ
    if (sourceType !== targetType) {
      state = this.drawCrossTypeSegment(
        state,
        targetType,
        target,
        boundaries,
        direction,
        instructions
      );
    }

    // Draw target segment
    this.drawTargetSegment(
      state,
      targetType,
      target,
      direction,
      RELATION_GAP,
      instructions
    );

    // Draw final Arrows

    this.drawFinalArrows(targetType, target, RELATION_GAP, instructions);

    return instructions;
  }

  private drawSourceSegment(
    sourceType: RelationType,
    source: TaskCoordinates,
    boundaries: { min: number; max: number },
    goingDown: boolean,
    RELATION_GAP: number,
    instructions: IInstruction[]
  ): RelationDrawingState {
    const isStartPoint = sourceType === "S";

    // Determine starting point and boundary
    const startPoint = isStartPoint ? source.start : source.end;
    const boundaryX = isStartPoint
      ? boundaries.min + this.taskConstants.getRadius()
      : boundaries.max - this.taskConstants.getRadius();
    const startY = startPoint.y - RELATION_GAP;

    // Move to starting point and draw horizontal line to boundary
    instructions.push({
      instruction: Instruction.MOVE_TO,
      data: [startPoint.x, startY],
    });
    instructions.push({
      instruction: Instruction.LINE_TO,
      data: [boundaryX, startY],
    });

    // Calculate position after the arc
    const arcCenterX = isStartPoint
      ? boundaryX - this.taskConstants.getRadius()
      : boundaryX + this.taskConstants.getRadius();
    const currentY =
      startPoint.y +
      (goingDown
        ? this.taskConstants.getRadius()
        : -this.taskConstants.getRadius()) -
      RELATION_GAP;

    // Draw the arc from horizontal to vertical
    instructions.push({
      instruction: Instruction.ARC_TO,
      data: [
        arcCenterX,
        startY,
        arcCenterX,
        currentY,
        this.taskConstants.getRadius(),
      ],
    });

    return {
      currentX: arcCenterX,
      currentY,
    };
  }

  private drawCrossTypeSegment(
    state: RelationDrawingState,
    targetType: RelationType,
    target: TaskCoordinates,
    boundaries: { min: number; max: number },
    direction: Direction,
    instructions: IInstruction[]
  ): RelationDrawingState {
    const verticalOffset =
      this.taskConstants.getVerticalResidue() *
      RELATION_VERTICAL_OFFSET_MULTIPLIER;
    const isFinishPoint = targetType === "F";
    // Target ends at RELATION_GAP below center
    const targetEndY = getVerticalOffset(
      target.start.y,
      isFinishPoint ? 1 : -1,
      RELATION_MINIMUM_GAP
    );

    // Draw vertical line to the cross-over point
    const crossY = getVerticalOffset(
      targetEndY,
      direction,
      verticalOffset + this.taskConstants.getRadius()
    );
    instructions.push({
      instruction: Instruction.LINE_TO,
      data: [state.currentX, crossY],
    });

    // Determine target boundary based on target type
    const targetPoint = isFinishPoint ? target.end : target.start;
    const finalX = isFinishPoint
      ? boundaries.max - this.taskConstants.getRadius()
      : boundaries.min + this.taskConstants.getRadius();

    // Draw first arc: vertical to horizontal
    const cornerY = getVerticalOffset(targetEndY, direction, verticalOffset);
    instructions.push({
      instruction: Instruction.ARC_TO,
      data: [
        state.currentX,
        cornerY,
        targetPoint.x,
        cornerY,
        this.taskConstants.getRadius(),
      ],
    });

    // Draw horizontal line before final turn
    const beforeCornerX = isFinishPoint
      ? finalX - this.taskConstants.getRadius()
      : finalX + this.taskConstants.getRadius();
    instructions.push({
      instruction: Instruction.LINE_TO,
      data: [beforeCornerX, cornerY],
    });

    // Draw second arc: horizontal to vertical
    const midpointY = getVerticalOffset(
      targetEndY,
      direction,
      verticalOffset / RELATION_MIDPOINT_DIVISOR
    );
    instructions.push({
      instruction: Instruction.ARC_TO,
      data: [
        finalX,
        cornerY,
        finalX,
        midpointY,
        this.taskConstants.getRadius(),
      ],
    });

    // Update position to continue from - approaching target (will end RELATION_GAP below center)
    return {
      currentX: finalX,
      currentY: getVerticalOffset(
        targetEndY,
        direction,
        this.taskConstants.getRadius()
      ),
    };
  }

  private drawTargetSegment(
    state: RelationDrawingState,
    targetType: RelationType,
    target: TaskCoordinates,
    direction: Direction,
    RELATION_GAP: number,
    instructions: IInstruction[]
  ): void {
    // Determine final target point (ends RELATION_GAP below center)
    const targetPoint = targetType === "F" ? target.end : target.start;
    const targetEndY = targetPoint.y + RELATION_GAP;

    // Calculate where to stop vertical line before the arc
    const approachY = getVerticalOffset(
      targetEndY,
      direction,
      this.taskConstants.getRadius()
    );

    // Draw vertical line approaching target
    instructions.push({
      instruction: Instruction.LINE_TO,
      data: [state.currentX, approachY],
    });

    // Draw final arc from vertical to horizontal
    instructions.push({
      instruction: Instruction.ARC_TO,
      data: [
        state.currentX,
        targetEndY,
        targetPoint.x,
        targetEndY,
        this.taskConstants.getRadius(),
      ],
    });

    // Complete the horizontal connection to target
    instructions.push({
      instruction: Instruction.LINE_TO,
      data: [targetPoint.x, targetEndY],
    });
  }

  private drawFinalArrows(
    targetType: RelationType,
    target: TaskCoordinates,
    RELATION_GAP: number,
    instructions: IInstruction[]
  ): void {
    // Draw final arrows
    const isFinishPoint = targetType === "F";
    const targetEndX = isFinishPoint ? target.end.x : target.start.x;
    const targetEndY =
      (isFinishPoint ? target.end.y : target.start.y) + RELATION_GAP;
    const startX = getVerticalOffset(
      targetEndX,
      isFinishPoint ? 1 : -1,
      RELATION_MINIMUM_GAP
    );
    const startY = getVerticalOffset(targetEndY, -1, RELATION_MINIMUM_GAP);
    instructions.push({
      instruction: Instruction.TRIANGLE,
      data: [
        startX,
        startY,
        targetEndX,
        targetEndY,
        startX,
        targetEndY + RELATION_MINIMUM_GAP,
      ],
    });
  }
}
