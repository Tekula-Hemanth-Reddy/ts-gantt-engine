import { type ITaskConstants } from "../../common/index.js";
export declare class TaskConstants {
    private boxHeight;
    private barHeight;
    private horizontalResidue;
    private verticalResidue;
    private radius;
    constructor(taskConstants: ITaskConstants);
    getBoxHeight(): number;
    getBarHeight(): number;
    getHorizontalResidue(): number;
    getVerticalResidue(): number;
    getRadius(): number;
    getTaskConstants(): {
        boxHeight: number;
        barHeight: number;
        horizontalResidue: number;
        verticalResidue: number;
        radius: number;
    };
}
//# sourceMappingURL=task-constants.d.ts.map