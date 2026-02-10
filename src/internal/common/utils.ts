import moment, { type Moment } from "moment-timezone";
import { type PFormat, type PType } from "../../engine/model.js";
import { type Direction } from "./internal-types.js";
import {
  HEADER_FORMAT,
  UNIT_RESIDUE,
  DAY_CALCULATIONS,
  UNIT_WIDTH,
  RELATION_COLOR,
  RELATION_MINIMUM_GAP,
  FORMAT_BUFFER,
  FORMAT_BUFFER_ENLARGEMENT,
  RELATION_GAP_RESIDUE,
} from "./constants.js";

// Generate the header of the Gantt chart
// step 1: calculate units between maximum date and minimum date according to the format
// step 2: initialize the current date to the minimum date according to the format
// step 3: add label and increase 1 unit to the current date according to the format
// step 4: return the total units and the labels
export const generateGanttHeader = (
  format: PFormat,
  minimumDate: Date,
  maximumDate: Date,
  timeZone?: string
) => {
  const date1 = timeZone ? moment(minimumDate).tz(timeZone) : moment(minimumDate);
  const date2 = timeZone ? moment(maximumDate).tz(timeZone) : moment(maximumDate);
  // step 1: calculate units between maximum date and minimum date according to the format
  const totalUnits = Math.ceil(
    ganttUnitsAccordingToFormat(
      date1,
      date2,
      format,
      FORMAT_BUFFER_ENLARGEMENT
    )
  );
  const labels: string[] = [];
  // step 2: initialize the current date to the minimum date according to the format
  const current = date1.startOf(format);

  for (let i = 0; i < totalUnits; i++) {
    // step 3: add label and increase 1 unit to the current date according to the format
    labels.push(current.format(headerFormat(format)));
    current.add(1, format);
  }
  // step 4: return the total units and the labels
  return {
    totalUnits,
    labels,
  };
};

// Calculate the exact position of the date in the Gantt chart
// step 1: initialize the date moment and the minimum date moment according to the format
// step 2: initialize the residue and the chart residue according to the start
// step 3: calculate the complete units from the minimum date according to the format
// step 4: calculate the base position
// step 5: calculate the partial unit position
// step 6: return the base position + partial unit position + chart residue
export const getExactPosition = (
  minimumDate: Date,
  date: Date,
  format: PFormat,
  start = true,
  timeZone?: string
) => {
  // step 1: initialize the date moment and the minimum date moment according to the format
  const dateMoment = timeZone ? moment(date).tz(timeZone).startOf(format) : moment(date).startOf(format);
  const minMoment = timeZone ? moment(minimumDate).tz(timeZone).startOf(format) : moment(minimumDate).startOf(format);
  // step 2: initialize the residue and the chart residue according to the start
  const residue = start ? 0 : 1;
  const chartResidue = start
    ? ganttUnitResidue(format)
    : -1 * ganttUnitResidue(format);

  // step 3: calculate the complete units from the minimum date according to the format
  const completeUnits = ganttUnitsAccordingToFormat(
    minMoment,
    dateMoment,
    format,
    0
  );
  // step 4: calculate the base position
  const basePosition = ganttUnitWidth(format) * completeUnits;
  const dayMoment = timeZone ? moment(date).tz(timeZone).startOf("day") : moment(date).startOf("day");
  // step 5: calculate the partial unit position
  const partialUnit = Math.floor(
    ganttUnitsAccordingToFormat(
      dateMoment,
      dayMoment,
      "day",
      residue
    )
  );
  const partialUnitPosition = partialUnit * dayCalculations(format);

  // step 6: return the base position + partial unit position + chart residue
  return basePosition + partialUnitPosition + chartResidue;
};

// return the units between two dates according to the format and the residue
const ganttUnitsAccordingToFormat = (
  d1: Moment,
  d2: Moment,
  format: PFormat,
  residue: number
) => {
  return d2.diff(d1, format, true) + residue;
};

export const headerFormat = (format: PFormat): string => {
  return HEADER_FORMAT[format as keyof typeof HEADER_FORMAT];
};

export const dayCalculations = (format: PFormat): number => {
  return DAY_CALCULATIONS[format as keyof typeof DAY_CALCULATIONS];
};

export const ganttUnitWidth = (format: PFormat): number => {
  return UNIT_WIDTH[format as keyof typeof UNIT_WIDTH];
};

export const ganttUnitResidue = (format: PFormat): number => {
  return UNIT_RESIDUE[format as keyof typeof UNIT_RESIDUE];
};

export const formatBuffer = (format: PFormat): number => {
  return FORMAT_BUFFER[format as keyof typeof FORMAT_BUFFER];
};

export const relationLineColor = (pType: string): string => {
  return RELATION_COLOR[pType as keyof typeof RELATION_COLOR];
};

export const getDirectionMultiplier = (goingDown: boolean): Direction =>
  goingDown ? -1 : 1;

export const getVerticalOffset = (
  baseY: number,
  direction: Direction,
  offset: number
): number => {
  return baseY + direction * offset;
};

export const getRelationShipGap = (relation: PType): number => {
  switch (relation) {
    case "FF":
      return RELATION_MINIMUM_GAP + RELATION_GAP_RESIDUE.FF;
    case "SF":
      return RELATION_MINIMUM_GAP + RELATION_GAP_RESIDUE.SF;
    case "FS":
      return RELATION_MINIMUM_GAP + RELATION_GAP_RESIDUE.FS;
    case "SS":
    default:
      return RELATION_MINIMUM_GAP + RELATION_GAP_RESIDUE.SS;
  }
};

export const momentString = (date: Date | undefined, timeZone?: string): string => {
  if (timeZone) {
    return moment(date).tz(timeZone).format("ddd DD MMMM YYYY");
  }
  if (!date) return "";
  return moment(date).format("ddd DD MMMM YYYY");
};

export const isAfter = (date: Date, compareDate: Date, timeZone?: string) => {
  if (timeZone) {
    return moment(date).tz(timeZone).isAfter(compareDate);
  }
  return moment(date).isAfter(compareDate);
};

export const isBefore = (date: Date, compareDate: Date, timeZone?: string) => {
  if (timeZone) {
    return moment(date).tz(timeZone).isBefore(compareDate);
  }
  return moment(date).isBefore(compareDate);
};
