import { type PFormat, type PType } from "../../engine/model.js";
import { type Direction } from "./internal-types.js";
export declare const generateGanttHeader: (format: PFormat, minimumDate: Date, maximumDate: Date, timeZone?: string) => {
    totalUnits: number;
    labels: string[];
};
export declare const getExactPosition: (minimumDate: Date, date: Date, format: PFormat, start?: boolean, timeZone?: string) => number;
export declare const headerFormat: (format: PFormat) => string;
export declare const dayCalculations: (format: PFormat) => number;
export declare const ganttUnitWidth: (format: PFormat) => number;
export declare const ganttUnitResidue: (format: PFormat) => number;
export declare const formatBuffer: (format: PFormat) => number;
export declare const relationLineColor: (pType: string) => string;
export declare const getDirectionMultiplier: (goingDown: boolean) => Direction;
export declare const getVerticalOffset: (baseY: number, direction: Direction, offset: number) => number;
export declare const getRelationShipGap: (relation: PType) => number;
export declare const momentString: (date: Date | undefined, timeZone?: string) => string;
export declare const isAfter: (date: Date, compareDate: Date, timeZone?: string) => boolean;
export declare const isBefore: (date: Date, compareDate: Date, timeZone?: string) => boolean;
//# sourceMappingURL=utils.d.ts.map