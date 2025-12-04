"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderManager = void 0;
const common_1 = require("../common");
class RenderManager {
    canvasEngine;
    constructor(chartCanvas) {
        this.canvasEngine = chartCanvas;
    }
    drawHeaders(headers, regions) {
        const headerWidth = this.canvasEngine.getCanvasConstants().columnWidth;
        // Example header drawing
        this.canvasEngine.setFillStyle(this.canvasEngine.getCanvasConstants().headerBg);
        this.canvasEngine.fillRect({ x: 0, y: 0 }, regions.header.width, regions.header.height);
        this.canvasEngine.setFillStyle(this.canvasEngine.getCanvasConstants().canvasBg);
        let positionX = 0;
        for (const [index, header] of headers.entries()) {
            const columnWidth = headerWidth * (index == 0 ? 2 : 1);
            const rightPadding = common_1.COLUMN_PADDING;
            const leftPadding = common_1.COLUMN_PADDING + (index == 0 ? common_1.FIRST_COLUMN_PADDING : 0);
            // draw rectangle
            this.canvasEngine.rect({ x: positionX, y: 0 }, columnWidth, regions.header.height);
            // get text
            const text = (0, common_1.getFittedText)(this.canvasEngine.getCanvasContext(), columnWidth - (leftPadding + rightPadding), header.hName);
            // fill text
            this.canvasEngine.fillText(text, {
                x: leftPadding + positionX,
                y: regions.header.height / 2,
            });
            positionX += columnWidth;
        }
    }
    drawDateHeaders(header, unitWidth) {
        this.canvasEngine.setFillStyle(this.canvasEngine.getCanvasConstants().headerBg);
        this.canvasEngine.fillRect({ x: 0, y: 0 }, header.totalUnits * unitWidth, common_1.GANTT_HEADER_HEIGHT);
        this.canvasEngine.setFillStyle(this.canvasEngine.getCanvasConstants().canvasBg);
        this.canvasEngine.setTextAlign("center");
        const headerY = 0;
        let x = 0;
        // Draw header cells
        for (let i = 0; i < header.labels.length; i++) {
            const label = header.labels[i] || "";
            // Draw cell border
            this.canvasEngine.rect({ x: x, y: headerY }, unitWidth, common_1.GANTT_HEADER_HEIGHT);
            this.canvasEngine.fillText(label, {
                x: x + unitWidth / 2,
                y: headerY + common_1.GANTT_HEADER_HEIGHT / 2,
            });
            x += unitWidth;
        }
        this.canvasEngine.setTextAlign("left");
        return x;
    }
    drawTableData = (regions, chartData, headers, canvasHeight, symbolFun, paddingFun) => {
        const headerWidth = this.canvasEngine.getCanvasConstants().columnWidth;
        this.canvasEngine.fillRect({ x: 0, y: 0 }, regions.data.width, Math.max(chartData.length * common_1.BOX_HEIGHT, canvasHeight));
        // Draw task names
        for (const [index, task] of chartData.entries()) {
            const y = index * common_1.BOX_HEIGHT + common_1.BOX_HEIGHT / 2;
            let positionX = 0;
            for (const [i, header] of headers.entries()) {
                const rightPadding = common_1.COLUMN_PADDING;
                const extraPadding = paddingFun(task.pId);
                let columnWidth = headerWidth;
                let leftPadding = common_1.COLUMN_PADDING;
                let symbol = "";
                if (i == 0) {
                    columnWidth = headerWidth * 2;
                    leftPadding += extraPadding;
                    symbol = symbolFun(task.pId);
                }
                this.canvasEngine.rect({ x: positionX, y: index * common_1.BOX_HEIGHT }, columnWidth, common_1.BOX_HEIGHT);
                const text = (0, common_1.getFittedText)(this.canvasEngine.getCanvasContext(), columnWidth - (leftPadding + rightPadding), task.pData[header.hId] || "N/A");
                this.canvasEngine.fillText(symbol, {
                    x: leftPadding + positionX - 20,
                    y,
                });
                this.canvasEngine.fillText(text, { x: leftPadding + positionX, y });
                positionX += columnWidth;
            }
        }
    };
    drawRegion(region, drawFn) {
        this.canvasEngine.drawRegion(region, drawFn);
    }
    drawTasks(chartData, totalUnits, unitWidth, height, getCoordinatesPItem) {
        this.canvasEngine.fillRect({ x: 0, y: 0 }, totalUnits * unitWidth, Math.max(chartData.length * common_1.BOX_HEIGHT, height));
        this.drawVerticalLines(Math.max(chartData.length * common_1.BOX_HEIGHT, height), totalUnits, unitWidth);
        const yResidue = common_1.BAR_RESIDUE / 2;
        let positionY = yResidue;
        chartData.forEach((item) => {
            const taskBar = getCoordinatesPItem(item.pId);
            if (taskBar) {
                this.canvasEngine.setFillStyle(item.pDurations.gClass);
                this.canvasEngine.followInstructions(taskBar.instructions);
                this.canvasEngine.setFillStyle(this.canvasEngine.getCanvasConstants().canvasBg);
            }
            positionY += common_1.BAR_HEIGHT + yResidue * 2;
            this.drawHorizontalLine(0, positionY - yResidue, totalUnits * unitWidth);
        });
    }
    drawRelations(chartData, relationShipInstructions) {
        this.canvasEngine.setLineWidth(common_1.RELATION_LINE_WIDTH);
        chartData.forEach((task) => {
            task.pRelation.forEach((relation) => {
                this.canvasEngine.setStrokeColor((0, common_1.relationLineColor)(relation.pType));
                const key = `${task.pId}#_#${relation.pTarget}#_#${relation.pType}`;
                const instructions = relationShipInstructions(key);
                this.canvasEngine.followInstructions(instructions);
                // follow instructions
            });
        });
        this.canvasEngine.setStrokeColor(this.canvasEngine.getCanvasConstants().lineColor);
        this.canvasEngine.setLineWidth(1);
    }
    drawToolTip(position, data) {
        if (position && data) {
            this.canvasEngine.setFillStyle("#000");
            this.canvasEngine.box({ x: position.x - common_1.TOOL_TIP.offsetX, y: position.y - common_1.TOOL_TIP.offsetY }, common_1.TOOL_TIP.width, common_1.TOOL_TIP.height, common_1.TOOL_TIP.radius);
            this.canvasEngine.moveTo(position.x, position.y);
            this.canvasEngine.lineTo(position.x - common_1.TOOL_TIP.triangle, position.y - (common_1.TOOL_TIP.offsetY - common_1.TOOL_TIP.height));
            this.canvasEngine.lineTo(position.x + common_1.TOOL_TIP.triangle, position.y - (common_1.TOOL_TIP.offsetY - common_1.TOOL_TIP.height));
            this.canvasEngine.closePath();
            this.canvasEngine.fill();
            this.canvasEngine.setFillStyle(common_1.GANTT_LINE_COLOR);
            this.canvasEngine.setFont("10px Arial");
            this.canvasEngine.writeText(`${data.data.title} ${data.data.percentage}`, {
                x: position.x - common_1.TOOL_TIP.offsetX + 10,
                y: position.y - common_1.TOOL_TIP.offsetY + 15,
            });
            this.canvasEngine.writeText(`Start Date: ${data.data.startDate}`, {
                x: position.x - common_1.TOOL_TIP.offsetX + 10,
                y: position.y - common_1.TOOL_TIP.offsetY + 30,
            });
            this.canvasEngine.writeText(`End Date:  ${data.data.endDate}`, {
                x: position.x - common_1.TOOL_TIP.offsetX + 10,
                y: position.y - common_1.TOOL_TIP.offsetY + 45,
            });
            this.canvasEngine.setFillStyle(this.canvasEngine.getCanvasConstants().canvasBg);
            this.canvasEngine.setFont(this.canvasEngine.getCanvasConstants().font);
        }
    }
    drawVerticalLines(chartHeight, totalUnits, unitWidth) {
        this.canvasEngine.setLineWidth(1.5);
        for (let i = 0; i <= totalUnits; i++) {
            const x = i * unitWidth;
            this.canvasEngine.beginPath();
            this.canvasEngine.moveTo(x, 0);
            this.canvasEngine.lineTo(x, chartHeight);
            this.canvasEngine.stroke();
        }
        this.canvasEngine.setLineWidth(1);
    }
    drawHorizontalLine = (positionX, positionY, width) => {
        this.canvasEngine.setLineWidth(1.5);
        this.canvasEngine.beginPath();
        this.canvasEngine.moveTo(positionX, positionY);
        this.canvasEngine.lineTo(positionX + width, positionY);
        this.canvasEngine.stroke();
        this.canvasEngine.setLineWidth(1);
    };
}
exports.RenderManager = RenderManager;
//# sourceMappingURL=render-manager.js.map