"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_TIP = exports.HEADER_FORMAT = exports.DAY_CALCULATIONS = exports.UNIT_RESIDUE = exports.UNIT_WIDTH = exports.RELATION_COLOR = exports.RELATION_VERTICAL_OFFSET_MULTIPLIER = exports.RELATION_BOUNDARY_PADDING = exports.RELATION_MIDPOINT_DIVISOR = exports.RELATION_MINIMUM_GAP = exports.RELATION_LINE_WIDTH = exports.FIRST_COLUMN_PADDING = exports.BAR_TEXT_PADDING = exports.COLUMN_PADDING = exports.BAR_RADIUS = exports.BAR_RESIDUE = exports.BAR_HEIGHT = exports.BOX_HEIGHT = exports.GANTT_CANVAS_CONSTANTS = exports.GANTT_FONT = exports.GANTT_LINE_COLOR = exports.GANTT_TEXT_COLOR = exports.GANTT_CANVAS_BG = exports.GANTT_HEADER_BG = exports.GANTT_HEADER_HEIGHT = exports.GANTT_HEADER_WIDTH = exports.PARENT_KEY = void 0;
exports.PARENT_KEY = "#H@M@N^H#";
// canvas constants
exports.GANTT_HEADER_WIDTH = 200;
exports.GANTT_HEADER_HEIGHT = 50;
exports.GANTT_HEADER_BG = "#fafafa";
exports.GANTT_CANVAS_BG = "#fafafa";
exports.GANTT_TEXT_COLOR = "#333";
exports.GANTT_LINE_COLOR = "#e0e0e0";
exports.GANTT_FONT = "14px Arial";
exports.GANTT_CANVAS_CONSTANTS = {
    columnWidth: exports.GANTT_HEADER_WIDTH,
    rowHeight: exports.GANTT_HEADER_HEIGHT,
    headerBg: exports.GANTT_HEADER_BG,
    canvasBg: exports.GANTT_CANVAS_BG,
    lineColor: exports.GANTT_LINE_COLOR,
    textColor: exports.GANTT_TEXT_COLOR,
    font: exports.GANTT_FONT,
};
// box and bar constants
exports.BOX_HEIGHT = 60;
exports.BAR_HEIGHT = 40;
exports.BAR_RESIDUE = 20;
exports.BAR_RADIUS = 5;
// paddings
exports.COLUMN_PADDING = 10;
exports.BAR_TEXT_PADDING = 10;
exports.FIRST_COLUMN_PADDING = 20;
// Constants for relation drawing
exports.RELATION_LINE_WIDTH = 2;
exports.RELATION_MINIMUM_GAP = 5;
exports.RELATION_MIDPOINT_DIVISOR = 2;
exports.RELATION_BOUNDARY_PADDING = 10;
exports.RELATION_VERTICAL_OFFSET_MULTIPLIER = 1.5;
exports.RELATION_COLOR = {
    FF: "#FF8B3D",
    SF: "#FF3D3D",
    FS: "#3DCEFF",
    SS: "#23A118",
};
exports.UNIT_WIDTH = {
    day: 100,
    week: 210,
    month: 300,
    quarter: 450,
    year: 600,
};
exports.UNIT_RESIDUE = {
    day: 20,
    week: 15,
    month: 5,
    quarter: 0,
    year: 0,
};
exports.DAY_CALCULATIONS = {
    day: exports.UNIT_WIDTH["day"] / 100,
    week: exports.UNIT_WIDTH["week"] / 7,
    month: exports.UNIT_WIDTH["month"] / 30,
    quarter: exports.UNIT_WIDTH["quarter"] / 90,
    year: exports.UNIT_WIDTH["year"] / 365,
};
exports.HEADER_FORMAT = {
    day: "DD/MM/YYYY",
    week: "YYYY [Week] WW",
    month: "MMM YYYY",
    quarter: "YYYY [Quarter] Q",
    year: "YYYY",
};
exports.TOOL_TIP = {
    offsetX: 100,
    offsetY: 65,
    width: 200,
    height: 55,
    radius: 2,
    triangle: 5,
};
//# sourceMappingURL=constants.js.map