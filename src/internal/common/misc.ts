import { REGIONS, type Point, type Regions } from "./internal-types";

export const getRegion = (
  headerHeight: number,
  availableHeight: number,
  headerWidth: number,
  canvasWidth: number
) => ({
  header: {
    x: 0,
    y: 0,
    width: headerWidth,
    height: headerHeight,
  },
  dates: {
    x: headerWidth,
    y: 0,
    width: canvasWidth - headerWidth,
    height: headerHeight,
  },
  data: {
    x: 0,
    y: headerHeight,
    width: headerWidth,
    height: availableHeight,
  },
  gantt: {
    x: headerWidth,
    y: headerHeight,
    width: canvasWidth - headerWidth,
    height: availableHeight,
  },
});

export const getFittedText = (
  canvasContext: CanvasRenderingContext2D,
  width: number,
  chartText: string
) => {
  const ellipsis = "...";
  const availableWidth = width;
  let i = 0;
  while (
    chartText.length > i &&
    canvasContext.measureText(chartText.slice(0, i) + ellipsis).width <
      availableWidth
  ) {
    i++;
  }

  if (i === 0) {
    if (canvasContext.measureText(".").width < availableWidth) {
      chartText = ".";
    } else {
      chartText = "";
    }
  } else if (chartText.length > i) {
    chartText = chartText.slice(0, i) + ellipsis;
  }
  return chartText;
};

export const getMousePosition = (
  evt: MouseEvent,
  regions: Regions,
  canvas: Point,
  scroll: Point
) => {
  const point: Point = {
    x: evt.clientX - canvas.x,
    y: evt.clientY - canvas.y,
  };
  let scrollX = scroll.x;
  let scrollY = scroll.y;
  let region = regions.gantt;
  let instance = REGIONS.GANTT;
  if (point.x < regions.dates.x && point.y < regions.data.y) {
    scrollX = 0;
    scrollY = 0;
    region = regions.header;
    instance = REGIONS.HEADER;
  } else if (point.x > regions.dates.x && point.y < regions.data.y) {
    scrollY = 0;
    region = regions.dates;
    instance = REGIONS.DATE_HEADER;
  } else if (point.x < regions.dates.x && point.y > regions.header.y) {
    scrollX = 0;
    region = regions.data;
    instance = REGIONS.DATA;
  } else {
    region = regions.gantt;
    instance = REGIONS.GANTT;
  }
  const cssX = point.x - region.x + scrollX;
  const cssY = point.y - region.y + scrollY;
  return { point: { x: cssX, y: cssY }, region: instance };
};
