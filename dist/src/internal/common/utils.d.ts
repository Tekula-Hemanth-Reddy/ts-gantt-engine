import { PFormat, PType } from "../../engine/model.js";
import { Direction } from "./internal-types.js";
export declare const generateGanttHeader: (format: PFormat, minimumDate: Date, maximumDate: Date) => {
    totalUnits: number;
    labels: string[];
};
export declare const getExactPosition: (minimumDate: Date, date: Date, format: PFormat, start?: boolean) => number;
export declare const headerFormat: (format: PFormat) => string;
export declare const dayCalculations: (format: PFormat) => number;
export declare const ganttUnitWidth: (format: PFormat) => number;
export declare const ganttUnitResidue: (format: PFormat) => number;
export declare const relationLineColor: (pType: string) => string;
export declare const getDirectionMultiplier: (goingDown: boolean) => Direction;
export declare const getVerticalOffset: (baseY: number, direction: Direction, offset: number) => number;
export declare const getRelationShipGap: (relation: PType) => number;
export declare const momentString: (date: Date | undefined) => string;
export declare const isAfter: (date: Date, compareDate: Date) => boolean;
export declare const isBefore: (date: Date, compareDate: Date) => boolean;
//# sourceMappingURL=utils.d.ts.map