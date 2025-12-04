import {
  ICanvasConstants,
  GANTT_CANVAS_CONSTANTS,
  Region,
  IInstruction,
  Instruction,
} from "../common";

export class CanvasEngine {
  private _canvasCtx: CanvasRenderingContext2D;
  private canvasConstants: ICanvasConstants = GANTT_CANVAS_CONSTANTS;

  constructor(
    canvasCtx: CanvasRenderingContext2D,
    canvasConstants: ICanvasConstants
  ) {
    this._canvasCtx = canvasCtx;
    this.canvasConstants = canvasConstants;
  }

  getCanvasContext() {
    return this._canvasCtx;
  }

  getCanvasConstants() {
    return this.canvasConstants;
  }

  setUpCanvasStyles(canvasConstants: ICanvasConstants) {
    this.canvasConstants = canvasConstants;
    this._canvasCtx.fillStyle = canvasConstants.canvasBg;
    this._canvasCtx.strokeStyle = canvasConstants.lineColor;
    this._canvasCtx.font = canvasConstants.font;
    this._canvasCtx.textBaseline = "middle";
    this._canvasCtx.textAlign = "left";
  }

  setFont(font: string) {
    this._canvasCtx.font = font;
  }
  setFillStyle(fillStyle: string) {
    this._canvasCtx.fillStyle = fillStyle;
  }
  setStrokeColor(strokeColor: string) {
    this._canvasCtx.strokeStyle = strokeColor;
  }

  setTextAlign(position: CanvasTextAlign) {
    this._canvasCtx.textAlign = position;
  }

  setLineWidth(width: number) {
    this._canvasCtx.lineWidth = width;
  }

  drawRegion(region: Region, drawFn: () => void): void {
    this._canvasCtx.save();

    // Clip to region bounds
    this._canvasCtx.beginPath();
    this._canvasCtx.rect(region.x, region.y, region.width, region.height);
    this._canvasCtx.clip();

    // Translate to region origin
    this._canvasCtx.translate(region.x, region.y);

    // Execute drawing
    drawFn();

    this._canvasCtx.restore();
  }

  beginPath() {
    this._canvasCtx.beginPath();
  }

  closePath() {
    this._canvasCtx.closePath();
  }

  fill() {
    this._canvasCtx.fill();
  }

  stroke() {
    this._canvasCtx.stroke();
  }

  moveTo(x: number, y: number) {
    this._canvasCtx.moveTo(x, y);
  }

  lineTo(x: number, y: number) {
    this._canvasCtx.lineTo(x, y);
  }

  arcTo(
    a: { x: number; y: number },
    b: { x: number; y: number },
    radius: number
  ) {
    this._canvasCtx.arcTo(a.x, a.y, b.x, b.y, radius);
  }

  quadraticCurveTo(a: { x: number; y: number }, b: { x: number; y: number }) {
    this._canvasCtx.quadraticCurveTo(a.x, a.y, b.x, b.y);
  }

  fillText(text: string, position: { x: number; y: number }) {
    this.setFillStyle(this.canvasConstants.textColor);
    this._canvasCtx.fillText(text, position.x, position.y);
    this.setFillStyle(this.canvasConstants.canvasBg);
  }

  writeText(text: string, position: { x: number; y: number }) {
    this._canvasCtx.fillText(text, position.x, position.y);
  }

  triangle(
    a: { x: number; y: number },
    b: { x: number; y: number },
    c: { x: number; y: number }
  ) {
    this.moveTo(a.x, a.y);
    this.lineTo(b.x, b.y);
    this.lineTo(c.x, c.y);
    this.closePath();
    this.stroke();
  }

  box(
    point: { x: number; y: number },
    width: number,
    height: number,
    radius: number
  ) {
    this.beginPath();
    this.moveTo(point.x + radius, point.y);
    this.lineTo(point.x + width - radius, point.y);
    this.quadraticCurveTo(
      { x: point.x + width, y: point.y },
      { x: point.x + width, y: point.y + radius }
    );
    this.lineTo(point.x + width, point.y + height - radius);
    this.quadraticCurveTo(
      { x: point.x + width, y: point.y + height },
      { x: point.x + width - radius, y: point.y + height }
    );
    this.lineTo(point.x + radius, point.y + height);
    this.quadraticCurveTo(
      { x: point.x, y: point.y + height },
      {
        x: point.x,
        y: point.y + height - radius,
      }
    );
    this.lineTo(point.x, point.y + radius);
    this.quadraticCurveTo(
      { x: point.x, y: point.y },
      { x: point.x + radius, y: point.y }
    );
    this.closePath();
    this.fill();
    this.stroke();
  }

  rect(point: { x: number; y: number }, width: number, height: number) {
    this._canvasCtx.beginPath();
    this._canvasCtx.rect(point.x, point.y, width, height);
    this._canvasCtx.stroke();
  }

  fillRect(point: { x: number; y: number }, width: number, height: number) {
    this._canvasCtx.fillRect(point.x, point.y, width, height);
  }

  followInstructions(instructions: IInstruction[]) {
    for (const instruction of instructions) {
      this.followInstruction(instruction);
    }
  }

  followInstruction(instruction: IInstruction) {
    switch (instruction.instruction) {
      case Instruction.BEGIN_PATH:
        this.beginPath();
        break;
      case Instruction.CLOSE_PATH:
        this.closePath();
        break;
      case Instruction.FILL:
        this.fill();
        break;
      case Instruction.STROKE:
        this.stroke();
        break;
      case Instruction.MOVE_TO: {
        const [x, y] = instruction.data;
        if (typeof x == "number" && typeof y == "number") this.moveTo(x, y);
        break;
      }
      case Instruction.LINE_TO: {
        const [x, y] = instruction.data;
        if (typeof x == "number" && typeof y == "number") this.lineTo(x, y);
        break;
      }
      case Instruction.ARC_TO: {
        const [x1, y1, x2, y2, radius] = instruction.data;
        if (
          typeof x1 == "number" &&
          typeof y1 == "number" &&
          typeof x2 == "number" &&
          typeof y2 == "number" &&
          typeof radius == "number"
        )
          this.arcTo({ x: x1, y: y1 }, { x: x2, y: y2 }, radius);
        break;
      }
      case Instruction.QUADRATIC_CURVE_TO: {
        const [x1, y1, x2, y2] = instruction.data;
        if (
          typeof x1 == "number" &&
          typeof y1 == "number" &&
          typeof x2 == "number" &&
          typeof y2 == "number"
        )
          this.quadraticCurveTo({ x: x1, y: y1 }, { x: x2, y: y2 });
        break;
      }
      case Instruction.FILL_TEXT: {
        const [text, x, y] = instruction.data;
        if (
          typeof x == "number" &&
          typeof y == "number" &&
          typeof text == "string"
        )
          this.fillText(text, { x: x, y: y });
        break;
      }
      case Instruction.TRIANGLE: {
        const [x1, y1, x2, y2, x3, y3] = instruction.data;
        if (
          typeof x1 == "number" &&
          typeof y1 == "number" &&
          typeof x2 == "number" &&
          typeof y2 == "number" &&
          typeof x3 == "number" &&
          typeof y3 == "number"
        )
          this.triangle({ x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 });
        break;
      }
      case Instruction.BOX: {
        const [x, y, width, height, radius] = instruction.data;
        if (
          typeof x == "number" &&
          typeof y == "number" &&
          typeof width == "number" &&
          typeof height == "number" &&
          typeof radius == "number"
        )
          this.box({ x: x, y: y }, width, height, radius);
        break;
      }
      default:
        break;
    }
  }
}
