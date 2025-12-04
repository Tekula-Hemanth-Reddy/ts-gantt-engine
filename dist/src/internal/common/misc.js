"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMousePosition = exports.getFittedText = exports.getRegion = void 0;
const internal_types_1 = require("./internal-types");
const getRegion = (headerHeight, availableHeight, headerWidth, canvasWidth) => ({
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
exports.getRegion = getRegion;
const getFittedText = (canvasContext, width, chartText) => {
    const ellipsis = "...";
    const availableWidth = width;
    let i = 0;
    while (chartText.length > i &&
        canvasContext.measureText(chartText.slice(0, i) + ellipsis).width <
            availableWidth) {
        i++;
    }
    if (i === 0) {
        if (canvasContext.measureText(".").width < availableWidth) {
            chartText = ".";
        }
        else {
            chartText = "";
        }
    }
    else if (chartText.length > i) {
        chartText = chartText.slice(0, i) + ellipsis;
    }
    return chartText;
};
exports.getFittedText = getFittedText;
const getMousePosition = (evt, regions, canvas, scroll) => {
    const point = {
        x: evt.clientX - canvas.x,
        y: evt.clientY - canvas.y,
    };
    let scrollX = scroll.x;
    let scrollY = scroll.y;
    let region = regions.gantt;
    let instance = internal_types_1.REGIONS.GANTT;
    if (point.x < regions.dates.x && point.y < regions.data.y) {
        scrollX = 0;
        scrollY = 0;
        region = regions.header;
        instance = internal_types_1.REGIONS.HEADER;
    }
    else if (point.x > regions.dates.x && point.y < regions.data.y) {
        scrollY = 0;
        region = regions.dates;
        instance = internal_types_1.REGIONS.DATE_HEADER;
    }
    else if (point.x < regions.dates.x && point.y > regions.header.y) {
        scrollX = 0;
        region = regions.data;
        instance = internal_types_1.REGIONS.DATA;
    }
    else {
        region = regions.gantt;
        instance = internal_types_1.REGIONS.GANTT;
    }
    const cssX = point.x - region.x + scrollX;
    const cssY = point.y - region.y + scrollY;
    return { point: { x: cssX, y: cssY }, region: instance };
};
exports.getMousePosition = getMousePosition;
//# sourceMappingURL=misc.js.map