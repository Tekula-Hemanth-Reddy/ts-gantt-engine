import moment from "moment-timezone";
import { PFormat, GanttHeader, GanttTask } from "../../engine/model";
import {
  TaskOperation,
  GanttDateHeader,
  ICoordinateData,
  IInstruction,
  ganttUnitWidth,
  BOX_HEIGHT,
  PARENT_KEY,
  isBefore,
  isAfter,
  generateGanttHeader,
  BAR_RESIDUE,
  getExactPosition,
  BAR_HEIGHT,
  momentString,
  RELATION_BOUNDARY_PADDING,
  getRelationShipGap,
  RelationType,
  Instruction,
  BAR_RADIUS,
  BAR_TEXT_PADDING,
  getFittedText,
  TaskCoordinates,
  getDirectionMultiplier,
  RelationDrawingState,
  Direction,
  RELATION_VERTICAL_OFFSET_MULTIPLIER,
  getVerticalOffset,
  RELATION_MINIMUM_GAP,
  RELATION_MIDPOINT_DIVISOR,
} from "../common";

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
  private datesHeader: GanttDateHeader = { totalUnits: 0, labels: [] };

  // Task map
  private max_min_map: { max: number; min: number } = {
    max: Number.MIN_SAFE_INTEGER,
    min: Number.MAX_SAFE_INTEGER,
  };
  private coordinateMap: Map<string, ICoordinateData> = new Map();
  private relationShipInstructions: Map<string, IInstruction[]> = new Map();

  constructor(
    canvasCtx: CanvasRenderingContext2D,
    format: PFormat,
    headers: GanttHeader[],
    data: GanttTask[],
    operations: Map<string, TaskOperation>
  ) {
    this._canvasCtx = canvasCtx;
    this.format = format;
    this.headers = headers;
    this.originalTaskData = data;
    this.operations = operations;
    this.unitWidth = ganttUnitWidth(this.format);
    this.setUpTasks();
  }

  //#region.......... Getters ..................
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
  getCoordinatesPItem(pId: string) {
    return this.getCoordinatesMap().get(pId) || null;
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
    return operation?.symbol || "";
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

  closeItem(pId: string) {
    const operation = this.operations.get(pId);
    if (operation && operation.children.length) {
      operation.open = false;
      operation.symbol = "+";
      for (const item of operation.children) {
        this.closeItem(item);
      }
    }
  }

  expandOrClose(x: number, y: number, width: number) {
    if (x < width) {
      const index = Math.floor(y / BOX_HEIGHT);
      const chart = this.taskData[index];
      if (chart) {
        const operation = this.operations.get(chart.pId);
        if (operation && operation.children.length) {
          if (!operation.open) {
            operation.open = true;
            operation.symbol = "-";
          } else {
            this.closeItem(chart.pId);
          }
          this.setUpTasks();
        }
      }
    }
  }
  //#endregion.......... Getters ..................

  /**
   * so root nodes have Paren key as default parent
   * as we have tasks in sorted order according to parent child
   * iterate through every task if any task is open(taken from operations) push task into task items
   */
  private setUpTasks() {
    const chartData: GanttTask[] = [];
    let minimumDate = new Date();
    let maximumDate = new Date();
    for (const item of this.originalTaskData) {
      const operation = this.operations.get(item.pParent || PARENT_KEY);
      if (operation?.open || false) {
        if (
          item.pDurations.gStart &&
          isBefore(item.pDurations.gStart, minimumDate)
        ) {
          minimumDate = item.pDurations.gStart;
        }
        if (
          item.pDurations.gEnd &&
          isAfter(item.pDurations.gEnd, maximumDate)
        ) {
          maximumDate = item.pDurations.gEnd;
        }
        chartData.push(item);
      }
    }
    this.taskData = chartData;
    this.max_min_map = {
      max: Number.MIN_SAFE_INTEGER,
      min: Number.MAX_SAFE_INTEGER,
    };
    this.coordinateMap.clear();
    this.relationShipInstructions.clear();
    this.setUpChartData(minimumDate, maximumDate);
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
    // set Minimum and Maximum Dates
    this.minDate = new Date(
      moment(minimumDate).subtract(10, this.format).toDate()
    );
    this.maxDate = new Date(moment(maximumDate).add(2, this.format).toDate());
    // Get Date Headers
    this.datesHeader = generateGanttHeader(
      this.format,
      this.minDate,
      this.maxDate
    );

    this.max_min_map = {
      max: Number.MIN_SAFE_INTEGER,
      min: Number.MAX_SAFE_INTEGER,
    };
    const yResidue = BAR_RESIDUE / 2;
    let positionY = yResidue;
    for (const item of this.taskData) {
      const duration = item.pDurations;
      if (duration.gStart && duration.gEnd) {
        let startX = getExactPosition(
          this.minDate,
          duration.gStart,
          this.format,
          true
        );
        let endX = getExactPosition(
          this.minDate,
          duration.gEnd,
          this.format,
          false
        );
        if (this.format === "day") {
          endX = endX + ganttUnitWidth(this.format);
        }
        if (endX < startX) {
          const a = startX;
          startX = endX;
          endX = a;
        } else if (endX - startX < BAR_RESIDUE) {
          endX = startX + BAR_RESIDUE;
        }
        this.max_min_map.max = Math.max(this.max_min_map.max, endX);
        this.max_min_map.min = Math.min(this.max_min_map.min, startX);
        this.coordinateMap.set(item.pId, {
          start: { x: startX, y: positionY },
          end: { x: endX, y: positionY + BAR_HEIGHT },
          instructions: this.drawTaskBar(
            startX,
            positionY,
            endX - startX,
            BAR_HEIGHT,
            item.pName
          ),
          data: {
            pId: item.pId,
            title: item.pName,
            startDate: momentString(item.pDurations.gStart),
            endDate: momentString(item.pDurations.gEnd),
            percentage: `${item.pDurations.gPercentage} %`,
          },
        });
      }
      positionY += BAR_HEIGHT + yResidue * 2;
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
      for (const relation of task.pRelation) {
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

        // Draw the relation and update boundaries if needed
        const instructions: IInstruction[] = this.drawSingleRelation(
          {
            start: {
              x: source.start.x,
              y: source.start.y + BAR_HEIGHT / 2,
            },
            end: {
              x: source.end.x,
              y: source.start.y + BAR_HEIGHT / 2,
            },
          },
          {
            start: {
              x: target.start.x,
              y: target.start.y + BAR_HEIGHT / 2,
            },
            end: {
              x: target.end.x,
              y: target.start.y + BAR_HEIGHT / 2,
            },
          },
          relation.pType,
          boundaries,
          RELATION_GAP
        );
        this.relationShipInstructions.set(
          `${task.pId}#_#${relation.pTarget}#_#${relation.pType}`,
          instructions
        );

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
      data: [positionX + BAR_RADIUS, positionY],
    });
    instructions.push({
      instruction: Instruction.LINE_TO,
      data: [positionX + barWidth - BAR_RADIUS, positionY],
    });
    instructions.push({
      instruction: Instruction.QUADRATIC_CURVE_TO,
      data: [
        positionX + barWidth,
        positionY,
        positionX + barWidth,
        positionY + BAR_RADIUS,
      ],
    });
    instructions.push({
      instruction: Instruction.LINE_TO,
      data: [positionX + barWidth, positionY + barHeight - BAR_RADIUS],
    });
    instructions.push({
      instruction: Instruction.QUADRATIC_CURVE_TO,
      data: [
        positionX + barWidth,
        positionY + barHeight,
        positionX + barWidth - BAR_RADIUS,
        positionY + barHeight,
      ],
    });
    instructions.push({
      instruction: Instruction.LINE_TO,
      data: [positionX + BAR_RADIUS, positionY + barHeight],
    });
    instructions.push({
      instruction: Instruction.QUADRATIC_CURVE_TO,
      data: [
        positionX,
        positionY + barHeight,
        positionX,
        positionY + barHeight - BAR_RADIUS,
      ],
    });
    instructions.push({
      instruction: Instruction.LINE_TO,
      data: [positionX, positionY + BAR_RADIUS],
    });
    instructions.push({
      instruction: Instruction.QUADRATIC_CURVE_TO,
      data: [positionX, positionY, positionX + BAR_RADIUS, positionY],
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

    const textX = positionX + BAR_TEXT_PADDING; // Default position with padding
    const textY = positionY + BAR_HEIGHT / 2;
    const availableWidth = barWidth - BAR_TEXT_PADDING * 2;
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
    relationType: string,
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
      ? boundaries.min + BAR_RADIUS
      : boundaries.max - BAR_RADIUS;
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
      ? boundaryX - BAR_RADIUS
      : boundaryX + BAR_RADIUS;
    const currentY =
      startPoint.y + (goingDown ? BAR_RADIUS : -BAR_RADIUS) - RELATION_GAP;

    // Draw the arc from horizontal to vertical
    instructions.push({
      instruction: Instruction.ARC_TO,
      data: [arcCenterX, startY, arcCenterX, currentY, BAR_RADIUS],
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
    const verticalOffset = BAR_RESIDUE * RELATION_VERTICAL_OFFSET_MULTIPLIER;
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
      verticalOffset + BAR_RADIUS
    );
    instructions.push({
      instruction: Instruction.LINE_TO,
      data: [state.currentX, crossY],
    });

    // Determine target boundary based on target type
    const targetPoint = isFinishPoint ? target.end : target.start;
    const finalX = isFinishPoint
      ? boundaries.max - BAR_RADIUS
      : boundaries.min + BAR_RADIUS;

    // Draw first arc: vertical to horizontal
    const cornerY = getVerticalOffset(targetEndY, direction, verticalOffset);
    instructions.push({
      instruction: Instruction.ARC_TO,
      data: [state.currentX, cornerY, targetPoint.x, cornerY, BAR_RADIUS],
    });

    // Draw horizontal line before final turn
    const beforeCornerX = isFinishPoint
      ? finalX - BAR_RADIUS
      : finalX + BAR_RADIUS;
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
      data: [finalX, cornerY, finalX, midpointY, BAR_RADIUS],
    });

    // Update position to continue from - approaching target (will end RELATION_GAP below center)
    return {
      currentX: finalX,
      currentY: getVerticalOffset(targetEndY, direction, BAR_RADIUS),
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
    const approachY = getVerticalOffset(targetEndY, direction, BAR_RADIUS);

    // Draw vertical line approaching target
    instructions.push({
      instruction: Instruction.LINE_TO,
      data: [state.currentX, approachY],
    });

    // Draw final arc from vertical to horizontal
    instructions.push({
      instruction: Instruction.ARC_TO,
      data: [state.currentX, targetEndY, targetPoint.x, targetEndY, BAR_RADIUS],
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
