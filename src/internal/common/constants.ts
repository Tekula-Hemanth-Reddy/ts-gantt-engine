export const PARENT_KEY = "#H@M@N^H#";

// canvas constants
export const GANTT_HEADER_WIDTH = 200;
export const GANTT_HEADER_HEIGHT = 50;
export const GANTT_HEADER_BG = "#fafafa";
export const GANTT_CANVAS_BG = "#fafafa";
export const GANTT_TEXT_COLOR = "#333";
export const GANTT_LINE_COLOR = "#e0e0e0";
export const GANTT_FONT = "14px Arial";
export const GANTT_CANVAS_CONSTANTS = {
  columnWidth: GANTT_HEADER_WIDTH,
  rowHeight: GANTT_HEADER_HEIGHT,
  headerBg: GANTT_HEADER_BG,
  canvasBg: GANTT_CANVAS_BG,
  lineColor: GANTT_LINE_COLOR,
  textColor: GANTT_TEXT_COLOR,
  font: GANTT_FONT,
};

// box and bar constants
export const BOX_HEIGHT = 60;
export const BAR_HEIGHT = 40;
export const BAR_RESIDUE = 20;
export const BAR_RADIUS = 5;

// paddings
export const COLUMN_PADDING = 10;
export const BAR_TEXT_PADDING = 10;
export const FIRST_COLUMN_PADDING = 20;

// Constants for relation drawing
export const RELATION_LINE_WIDTH = 2;
export const RELATION_MINIMUM_GAP = 5;
export const RELATION_MIDPOINT_DIVISOR = 2;
export const RELATION_BOUNDARY_PADDING = 10;
export const RELATION_VERTICAL_OFFSET_MULTIPLIER = 1.5;
export const RELATION_COLOR = {
  FF: "#FF8B3D",
  SF: "#FF3D3D",
  FS: "#3DCEFF",
  SS: "#23A118",
};

export const UNIT_WIDTH = {
  day: 100,
  week: 210,
  month: 300,
  quarter: 450,
  year: 600,
};

export const UNIT_RESIDUE = {
  day: 20,
  week: 15,
  month: 5,
  quarter: 0,
  year: 0,
};

export const DAY_CALCULATIONS = {
  day: UNIT_WIDTH["day"] / 100,
  week: UNIT_WIDTH["week"] / 7,
  month: UNIT_WIDTH["month"] / 30,
  quarter: UNIT_WIDTH["quarter"] / 90,
  year: UNIT_WIDTH["year"] / 365,
};

export const HEADER_FORMAT = {
  day: "DD/MM/YYYY",
  week: "YYYY [Week] WW",
  month: "MMM YYYY",
  quarter: "YYYY [Quarter] Q",
  year: "YYYY",
};

export const TOOL_TIP = {
  offsetX: 100,
  offsetY: 65,
  width: 200,
  height: 55,
  radius: 2,
  triangle: 5,
};
