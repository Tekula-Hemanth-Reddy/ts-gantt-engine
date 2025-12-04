"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasEngine = void 0;
const common_1 = require("../common");
class CanvasEngine {
    _canvasCtx;
    canvasConstants = common_1.GANTT_CANVAS_CONSTANTS;
    constructor(canvasCtx, canvasConstants) {
        this._canvasCtx = canvasCtx;
        this.canvasConstants = canvasConstants;
    }
    getCanvasContext() {
        return this._canvasCtx;
    }
    getCanvasConstants() {
        return this.canvasConstants;
    }
    setUpCanvasStyles(canvasConstants) {
        this.canvasConstants = canvasConstants;
        this._canvasCtx.fillStyle = canvasConstants.canvasBg;
        this._canvasCtx.strokeStyle = canvasConstants.lineColor;
        this._canvasCtx.font = canvasConstants.font;
        this._canvasCtx.textBaseline = "middle";
        this._canvasCtx.textAlign = "left";
    }
    setFont(font) {
        this._canvasCtx.font = font;
    }
    setFillStyle(fillStyle) {
        this._canvasCtx.fillStyle = fillStyle;
    }
    setStrokeColor(strokeColor) {
        this._canvasCtx.strokeStyle = strokeColor;
    }
    setTextAlign(position) {
        this._canvasCtx.textAlign = position;
    }
    setLineWidth(width) {
        this._canvasCtx.lineWidth = width;
    }
    drawRegion(region, drawFn) {
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
    moveTo(x, y) {
        this._canvasCtx.moveTo(x, y);
    }
    lineTo(x, y) {
        this._canvasCtx.lineTo(x, y);
    }
    arcTo(a, b, radius) {
        this._canvasCtx.arcTo(a.x, a.y, b.x, b.y, radius);
    }
    quadraticCurveTo(a, b) {
        this._canvasCtx.quadraticCurveTo(a.x, a.y, b.x, b.y);
    }
    fillText(text, position) {
        this.setFillStyle(this.canvasConstants.textColor);
        this._canvasCtx.fillText(text, position.x, position.y);
        this.setFillStyle(this.canvasConstants.canvasBg);
    }
    writeText(text, position) {
        this._canvasCtx.fillText(text, position.x, position.y);
    }
    triangle(a, b, c) {
        this.moveTo(a.x, a.y);
        this.lineTo(b.x, b.y);
        this.lineTo(c.x, c.y);
        this.closePath();
        this.stroke();
    }
    box(point, width, height, radius) {
        this.beginPath();
        this.moveTo(point.x + radius, point.y);
        this.lineTo(point.x + width - radius, point.y);
        this.quadraticCurveTo({ x: point.x + width, y: point.y }, { x: point.x + width, y: point.y + radius });
        this.lineTo(point.x + width, point.y + height - radius);
        this.quadraticCurveTo({ x: point.x + width, y: point.y + height }, { x: point.x + width - radius, y: point.y + height });
        this.lineTo(point.x + radius, point.y + height);
        this.quadraticCurveTo({ x: point.x, y: point.y + height }, {
            x: point.x,
            y: point.y + height - radius,
        });
        this.lineTo(point.x, point.y + radius);
        this.quadraticCurveTo({ x: point.x, y: point.y }, { x: point.x + radius, y: point.y });
        this.closePath();
        this.fill();
        this.stroke();
    }
    rect(point, width, height) {
        this._canvasCtx.beginPath();
        this._canvasCtx.rect(point.x, point.y, width, height);
        this._canvasCtx.stroke();
    }
    fillRect(point, width, height) {
        this._canvasCtx.fillRect(point.x, point.y, width, height);
    }
    followInstructions(instructions) {
        for (const instruction of instructions) {
            this.followInstruction(instruction);
        }
    }
    followInstruction(instruction) {
        switch (instruction.instruction) {
            case common_1.Instruction.BEGIN_PATH:
                this.beginPath();
                break;
            case common_1.Instruction.CLOSE_PATH:
                this.closePath();
                break;
            case common_1.Instruction.FILL:
                this.fill();
                break;
            case common_1.Instruction.STROKE:
                this.stroke();
                break;
            case common_1.Instruction.MOVE_TO: {
                const [x, y] = instruction.data;
                if (typeof x == "number" && typeof y == "number")
                    this.moveTo(x, y);
                break;
            }
            case common_1.Instruction.LINE_TO: {
                const [x, y] = instruction.data;
                if (typeof x == "number" && typeof y == "number")
                    this.lineTo(x, y);
                break;
            }
            case common_1.Instruction.ARC_TO: {
                const [x1, y1, x2, y2, radius] = instruction.data;
                if (typeof x1 == "number" &&
                    typeof y1 == "number" &&
                    typeof x2 == "number" &&
                    typeof y2 == "number" &&
                    typeof radius == "number")
                    this.arcTo({ x: x1, y: y1 }, { x: x2, y: y2 }, radius);
                break;
            }
            case common_1.Instruction.QUADRATIC_CURVE_TO: {
                const [x1, y1, x2, y2] = instruction.data;
                if (typeof x1 == "number" &&
                    typeof y1 == "number" &&
                    typeof x2 == "number" &&
                    typeof y2 == "number")
                    this.quadraticCurveTo({ x: x1, y: y1 }, { x: x2, y: y2 });
                break;
            }
            case common_1.Instruction.FILL_TEXT: {
                const [text, x, y] = instruction.data;
                if (typeof x == "number" &&
                    typeof y == "number" &&
                    typeof text == "string")
                    this.fillText(text, { x: x, y: y });
                break;
            }
            case common_1.Instruction.TRIANGLE: {
                const [x1, y1, x2, y2, x3, y3] = instruction.data;
                if (typeof x1 == "number" &&
                    typeof y1 == "number" &&
                    typeof x2 == "number" &&
                    typeof y2 == "number" &&
                    typeof x3 == "number" &&
                    typeof y3 == "number")
                    this.triangle({ x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 });
                break;
            }
            case common_1.Instruction.BOX: {
                const [x, y, width, height, radius] = instruction.data;
                if (typeof x == "number" &&
                    typeof y == "number" &&
                    typeof width == "number" &&
                    typeof height == "number" &&
                    typeof radius == "number")
                    this.box({ x: x, y: y }, width, height, radius);
                break;
            }
            default:
                break;
        }
    }
}
exports.CanvasEngine = CanvasEngine;
//# sourceMappingURL=canvas-engine.js.map