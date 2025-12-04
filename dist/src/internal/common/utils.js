"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBefore = exports.isAfter = exports.momentString = exports.getRelationShipGap = exports.getVerticalOffset = exports.getDirectionMultiplier = exports.relationLineColor = exports.ganttUnitResidue = exports.ganttUnitWidth = exports.dayCalculations = exports.headerFormat = exports.getExactPosition = exports.generateGanttHeader = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const constants_1 = require("./constants");
// Generate the header of the Gantt chart
// step 1: calculate units between maximum date and minimum date according to the format
// step 2: initialize the current date to the minimum date according to the format
// step 3: add label and increase 1 unit to the current date according to the format
// step 4: return the total units and the labels
const generateGanttHeader = (format, minimumDate, maximumDate) => {
    // step 1: calculate units between maximum date and minimum date according to the format
    const totalUnits = Math.ceil(ganttUnitsAccordingToFormat((0, moment_timezone_1.default)(minimumDate), (0, moment_timezone_1.default)(maximumDate), format, 10));
    const labels = [];
    // step 2: initialize the current date to the minimum date according to the format
    const current = (0, moment_timezone_1.default)(minimumDate).startOf(format);
    for (let i = 0; i < totalUnits; i++) {
        // step 3: add label and increase 1 unit to the current date according to the format
        labels.push(current.format((0, exports.headerFormat)(format)));
        current.add(1, format);
    }
    // step 4: return the total units and the labels
    return {
        totalUnits,
        labels,
    };
};
exports.generateGanttHeader = generateGanttHeader;
// Calculate the exact position of the date in the Gantt chart
// step 1: initialize the date moment and the minimum date moment according to the format
// step 2: initialize the residue and the chart residue according to the start
// step 3: calculate the complete units from the minimum date according to the format
// step 4: calculate the base position
// step 5: calculate the partial unit position
// step 6: return the base position + partial unit position + chart residue
const getExactPosition = (minimumDate, date, format, start = true) => {
    // step 1: initialize the date moment and the minimum date moment according to the format
    const dateMoment = (0, moment_timezone_1.default)(date).startOf(format);
    const minMoment = (0, moment_timezone_1.default)(minimumDate).startOf(format);
    // step 2: initialize the residue and the chart residue according to the start
    const residue = start ? 0 : 1;
    const chartResidue = start
        ? (0, exports.ganttUnitResidue)(format)
        : -1 * (0, exports.ganttUnitResidue)(format);
    // step 3: calculate the complete units from the minimum date according to the format
    const completeUnits = ganttUnitsAccordingToFormat(minMoment, dateMoment, format, 0);
    // step 4: calculate the base position
    const basePosition = (0, exports.ganttUnitWidth)(format) * completeUnits;
    // step 5: calculate the partial unit position
    const partialUnit = Math.floor(ganttUnitsAccordingToFormat(dateMoment, (0, moment_timezone_1.default)(date).startOf("day"), "day", residue));
    const partialUnitPosition = partialUnit * (0, exports.dayCalculations)(format);
    // step 6: return the base position + partial unit position + chart residue
    return basePosition + partialUnitPosition + chartResidue;
};
exports.getExactPosition = getExactPosition;
// return the units between two dates according to the format and the residue
const ganttUnitsAccordingToFormat = (d1, d2, format, residue) => {
    return d2.diff(d1, format, true) + residue;
};
const headerFormat = (format) => {
    return constants_1.HEADER_FORMAT[format];
};
exports.headerFormat = headerFormat;
const dayCalculations = (format) => {
    return constants_1.DAY_CALCULATIONS[format];
};
exports.dayCalculations = dayCalculations;
const ganttUnitWidth = (format) => {
    return constants_1.UNIT_WIDTH[format];
};
exports.ganttUnitWidth = ganttUnitWidth;
const ganttUnitResidue = (format) => {
    return constants_1.UNIT_RESIDUE[format];
};
exports.ganttUnitResidue = ganttUnitResidue;
const relationLineColor = (pType) => {
    return constants_1.RELATION_COLOR[pType];
};
exports.relationLineColor = relationLineColor;
const getDirectionMultiplier = (goingDown) => goingDown ? -1 : 1;
exports.getDirectionMultiplier = getDirectionMultiplier;
const getVerticalOffset = (baseY, direction, offset) => {
    return baseY + direction * offset;
};
exports.getVerticalOffset = getVerticalOffset;
const getRelationShipGap = (relation) => {
    switch (relation) {
        case "FF":
            return constants_1.RELATION_MINIMUM_GAP + 2;
        case "SF":
            return constants_1.RELATION_MINIMUM_GAP + 4;
        case "FS":
            return constants_1.RELATION_MINIMUM_GAP + 6;
        case "SS":
        default:
            return constants_1.RELATION_MINIMUM_GAP;
    }
};
exports.getRelationShipGap = getRelationShipGap;
const momentString = (date) => {
    if (!date)
        return "";
    return (0, moment_timezone_1.default)(date).format("ddd DD MMMM YYYY");
};
exports.momentString = momentString;
const isAfter = (date, compareDate) => {
    return (0, moment_timezone_1.default)(date).isAfter(compareDate);
};
exports.isAfter = isAfter;
const isBefore = (date, compareDate) => {
    return (0, moment_timezone_1.default)(date).isBefore(compareDate);
};
exports.isBefore = isBefore;
//# sourceMappingURL=utils.js.map