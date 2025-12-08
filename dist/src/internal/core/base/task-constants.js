import { TASK_CONSTANTS } from "../../common/index.js";
export class TaskConstants {
    boxHeight = TASK_CONSTANTS.boxHeight;
    barHeight = TASK_CONSTANTS.barHeight;
    horizontalResidue = TASK_CONSTANTS.horizontalResidue;
    verticalResidue = TASK_CONSTANTS.verticalResidue;
    radius = TASK_CONSTANTS.radius;
    constructor(taskConstants) {
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
//# sourceMappingURL=task-constants.js.map