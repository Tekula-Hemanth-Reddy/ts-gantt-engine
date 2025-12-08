import { type RelationColors } from "../../engine/model.js";
import { type Region, type IInstruction } from "../common/index.js";
import { CanvasConstants } from "./base/canvas-constants.js";
export declare class CanvasEngine {
    private _canvasCtx;
    private canvasConstants;
    private relationColors;
    constructor(canvasCtx: CanvasRenderingContext2D, relationColors: RelationColors);
    getCanvasContext(): CanvasRenderingContext2D;
    getCanvasConstants(): CanvasConstants;
    setUpCanvasStyles(canvasConstants: CanvasConstants): void;
    setUpRelationColors(relationColors: RelationColors): void;
    setFont(font: string): void;
    setFillStyle(fillStyle: string): void;
    setStrokeColor(strokeColor: string): void;
    setTextAlign(position: CanvasTextAlign): void;
    setLineWidth(width: number): void;
    getRelationColor(relationType: string): string;
    drawRegion(region: Region, drawFn: () => void): void;
    beginPath(): void;
    closePath(): void;
    fill(): void;
    stroke(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    arcTo(a: {
        x: number;
        y: number;
    }, b: {
        x: number;
        y: number;
    }, radius: number): void;
    quadraticCurveTo(a: {
        x: number;
        y: number;
    }, b: {
        x: number;
        y: number;
    }): void;
    fillText(text: string, position: {
        x: number;
        y: number;
    }): void;
    writeText(text: string, position: {
        x: number;
        y: number;
    }): void;
    triangle(a: {
        x: number;
        y: number;
    }, b: {
        x: number;
        y: number;
    }, c: {
        x: number;
        y: number;
    }): void;
    box(point: {
        x: number;
        y: number;
    }, width: number, height: number, radius: number): void;
    rect(point: {
        x: number;
        y: number;
    }, width: number, height: number): void;
    fillRect(point: {
        x: number;
        y: number;
    }, width: number, height: number): void;
    followInstructions(instructions: IInstruction[]): void;
    followInstruction(instruction: IInstruction): void;
}
//# sourceMappingURL=canvas-engine.d.ts.map