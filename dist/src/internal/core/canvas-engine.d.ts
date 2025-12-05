import { ICanvasConstants, Region, IInstruction } from "../common/index.js";
export declare class CanvasEngine {
    private _canvasCtx;
    private canvasConstants;
    constructor(canvasCtx: CanvasRenderingContext2D, canvasConstants: ICanvasConstants);
    getCanvasContext(): CanvasRenderingContext2D;
    getCanvasConstants(): ICanvasConstants;
    setUpCanvasStyles(canvasConstants: ICanvasConstants): void;
    setFont(font: string): void;
    setFillStyle(fillStyle: string): void;
    setStrokeColor(strokeColor: string): void;
    setTextAlign(position: CanvasTextAlign): void;
    setLineWidth(width: number): void;
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