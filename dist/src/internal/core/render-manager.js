import { COLUMN_PADDING, FIRST_COLUMN_PADDING, getFittedText, BOX_HEIGHT, BAR_RESIDUE, BAR_HEIGHT, RELATION_LINE_WIDTH, relationLineColor, TOOL_TIP, GANTT_LINE_COLOR, } from "../common/index.js";
export class RenderManager {
    canvasEngine;
    constructor(chartCanvas) {
        this.canvasEngine = chartCanvas;
    }
    drawCanvasBox(point, width, height) {
        this.canvasEngine.rect(point, width, height);
    }
    drawHeaders(headers, regions) {
        const headerWidth = this.canvasEngine.getCanvasConstants().columnWidth;
        const headerHeight = this.canvasEngine.getCanvasConstants().headerHeight;
        // Example header drawing
        this.canvasEngine.setFillStyle(this.canvasEngine.getCanvasConstants().headerBg);
        this.canvasEngine.fillRect({ x: 0, y: 0 }, regions.header.width, headerHeight);
        this.canvasEngine.setFillStyle(this.canvasEngine.getCanvasConstants().canvasBg);
        let positionX = 0;
        for (const [index, header] of headers.entries()) {
            const columnWidth = headerWidth * (index == 0 ? 2 : 1);
            const rightPadding = COLUMN_PADDING;
            const leftPadding = COLUMN_PADDING + (index == 0 ? FIRST_COLUMN_PADDING : 0);
            // draw rectangle
            this.canvasEngine.rect({ x: positionX, y: 0 }, columnWidth, headerHeight);
            // get text
            const text = getFittedText(this.canvasEngine.getCanvasContext(), columnWidth - (leftPadding + rightPadding), header.hName);
            // fill text
            this.canvasEngine.fillText(text, {
                x: leftPadding + positionX,
                y: headerHeight / 2,
            });
            positionX += columnWidth;
        }
    }
    drawDateHeaders(header, unitWidth) {
        const headerHeight = this.canvasEngine.getCanvasConstants().headerHeight;
        this.canvasEngine.setFillStyle(this.canvasEngine.getCanvasConstants().headerBg);
        this.canvasEngine.fillRect({ x: 0, y: 0 }, header.totalUnits * unitWidth, headerHeight);
        this.canvasEngine.setFillStyle(this.canvasEngine.getCanvasConstants().canvasBg);
        this.canvasEngine.setTextAlign("center");
        const headerY = 0;
        let x = 0;
        // Draw header cells
        for (let i = 0; i < header.labels.length; i++) {
            const label = header.labels[i] || "";
            // Draw cell border
            this.canvasEngine.rect({ x: x, y: headerY }, unitWidth, headerHeight);
            this.canvasEngine.fillText(label, {
                x: x + unitWidth / 2,
                y: headerY + headerHeight / 2,
            });
            x += unitWidth;
        }
        this.canvasEngine.setTextAlign("left");
        return x;
    }
    drawTableData = (regions, chartData, headers, canvasHeight, symbolFun, paddingFun) => {
        const headerWidth = this.canvasEngine.getCanvasConstants().columnWidth;
        this.canvasEngine.fillRect({ x: 0, y: 0 }, regions.data.width, Math.max(chartData.length * BOX_HEIGHT, canvasHeight));
        // Draw task names
        for (const [index, task] of chartData.entries()) {
            const y = index * BOX_HEIGHT + BOX_HEIGHT / 2;
            let positionX = 0;
            for (const [i, header] of headers.entries()) {
                const rightPadding = COLUMN_PADDING;
                const extraPadding = paddingFun(task.pId);
                let columnWidth = headerWidth;
                let leftPadding = COLUMN_PADDING;
                let symbol = "";
                if (i == 0) {
                    columnWidth = headerWidth * 2;
                    leftPadding += extraPadding;
                    symbol = symbolFun(task.pId);
                }
                this.canvasEngine.rect({ x: positionX, y: index * BOX_HEIGHT }, columnWidth, BOX_HEIGHT);
                const text = getFittedText(this.canvasEngine.getCanvasContext(), columnWidth - (leftPadding + rightPadding), task.pData[header.hId] || "N/A");
                this.canvasEngine.fillText(symbol, {
                    x: leftPadding + positionX - 20,
                    y,
                });
                this.canvasEngine.fillText(text, { x: leftPadding + positionX, y });
                positionX += columnWidth;
            }
        }
        this.canvasEngine.rect({ x: 0, y: 0 }, regions.data.width, Math.max(chartData.length * BOX_HEIGHT, canvasHeight));
    };
    drawRegion(region, drawFn) {
        this.canvasEngine.drawRegion(region, drawFn);
    }
    drawTasks(chartData, totalUnits, unitWidth, height, getCoordinatesPItem) {
        this.canvasEngine.rect({ x: 0, y: 0 }, totalUnits * unitWidth, Math.max(chartData.length * BOX_HEIGHT, height));
        this.canvasEngine.fill();
        this.drawVerticalLines(Math.max(chartData.length * BOX_HEIGHT, height), totalUnits, unitWidth);
        const yResidue = BAR_RESIDUE / 2;
        let positionY = yResidue;
        chartData.forEach((item) => {
            const taskBar = getCoordinatesPItem(item.pId);
            if (taskBar) {
                this.canvasEngine.setFillStyle(item.pDurations.gClass);
                this.canvasEngine.followInstructions(taskBar.instructions);
                this.canvasEngine.setFillStyle(this.canvasEngine.getCanvasConstants().canvasBg);
            }
            positionY += BAR_HEIGHT + yResidue * 2;
            this.drawHorizontalLine(0, positionY - yResidue, totalUnits * unitWidth);
        });
    }
    drawRelations(chartData, relationShipInstructions) {
        this.canvasEngine.setLineWidth(RELATION_LINE_WIDTH);
        chartData.forEach((task) => {
            task.pRelation.forEach((relation) => {
                this.canvasEngine.setStrokeColor(relationLineColor(relation.pType));
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
            this.canvasEngine.box({ x: position.x - TOOL_TIP.offsetX, y: position.y - TOOL_TIP.offsetY }, TOOL_TIP.width, TOOL_TIP.height, TOOL_TIP.radius);
            this.canvasEngine.moveTo(position.x, position.y);
            this.canvasEngine.lineTo(position.x - TOOL_TIP.triangle, position.y - (TOOL_TIP.offsetY - TOOL_TIP.height));
            this.canvasEngine.lineTo(position.x + TOOL_TIP.triangle, position.y - (TOOL_TIP.offsetY - TOOL_TIP.height));
            this.canvasEngine.closePath();
            this.canvasEngine.fill();
            this.canvasEngine.setFillStyle(GANTT_LINE_COLOR);
            this.canvasEngine.setFont("10px Arial");
            this.canvasEngine.writeText(`${data.data.title} ${data.data.percentage}`, {
                x: position.x - TOOL_TIP.offsetX + 10,
                y: position.y - TOOL_TIP.offsetY + 15,
            });
            this.canvasEngine.writeText(`Start Date: ${data.data.startDate}`, {
                x: position.x - TOOL_TIP.offsetX + 10,
                y: position.y - TOOL_TIP.offsetY + 30,
            });
            this.canvasEngine.writeText(`End Date:  ${data.data.endDate}`, {
                x: position.x - TOOL_TIP.offsetX + 10,
                y: position.y - TOOL_TIP.offsetY + 45,
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
//# sourceMappingURL=render-manager.js.map