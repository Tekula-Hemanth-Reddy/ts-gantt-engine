import { type ITaskConstants, TASK_CONSTANTS } from "../../common";

export class TaskConstants {
    private boxHeight: number = TASK_CONSTANTS.boxHeight;
    private barHeight: number = TASK_CONSTANTS.barHeight;
    private horizontalResidue: number = TASK_CONSTANTS.horizontalResidue;
    private verticalResidue: number = TASK_CONSTANTS.verticalResidue;
    private radius: number = TASK_CONSTANTS.radius;

    constructor(taskConstants: ITaskConstants) {
        this.boxHeight = taskConstants.boxHeight;
        this.barHeight = taskConstants.barHeight;
        this.horizontalResidue = taskConstants.horizontalResidue;
        this.verticalResidue = taskConstants.verticalResidue;
        this.radius = taskConstants.radius;
    }

    getBoxHeight() {
        return this.boxHeight;
    }

    getBarHeight() {
        return this.barHeight;
    }

    getHorizontalResidue() {
        return this.horizontalResidue;
    }  

    getVerticalResidue() {
        return this.verticalResidue;
    }

    getRadius() {
        return this.radius;
    }

    getTaskConstants() {
        return {
            boxHeight: this.boxHeight,
            barHeight: this.barHeight,
            horizontalResidue: this.horizontalResidue,
            verticalResidue: this.verticalResidue,
            radius: this.radius,
        };
    }
}