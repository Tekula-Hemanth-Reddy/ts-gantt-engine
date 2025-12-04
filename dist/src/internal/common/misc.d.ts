import { REGIONS, type Point, type Regions } from "./internal-types";
export declare const getRegion: (headerHeight: number, availableHeight: number, headerWidth: number, canvasWidth: number) => {
    header: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    dates: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    data: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    gantt: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
};
export declare const getFittedText: (canvasContext: CanvasRenderingContext2D, width: number, chartText: string) => string;
export declare const getMousePosition: (evt: MouseEvent, regions: Regions, canvas: Point, scroll: Point) => {
    point: {
        x: number;
        y: number;
    };
    region: REGIONS;
};
//# sourceMappingURL=misc.d.ts.map