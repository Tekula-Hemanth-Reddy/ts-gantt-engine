import { FIRST_COLUMN_PADDING, PARENT_KEY, } from "../common/index.js";
import { EngineContext } from "./engine-context.js";
export const getEngines = (_canvasCtx, headers, data, canvasConstants, taskConstants, expandCollapseSymbol, timeZone) => {
    const chartData = sortTasks(data, expandCollapseSymbol.getExpandCollapseSymbol());
    const dayContext = new EngineContext(_canvasCtx, "day", headers, chartData.data, new Map(chartData.operations), canvasConstants, taskConstants, expandCollapseSymbol, timeZone);
    const weekContext = new EngineContext(_canvasCtx, "week", headers, chartData.data, new Map(chartData.operations), canvasConstants, taskConstants, expandCollapseSymbol, timeZone);
    const monthContext = new EngineContext(_canvasCtx, "month", headers, chartData.data, new Map(chartData.operations), canvasConstants, taskConstants, expandCollapseSymbol, timeZone);
    const quarterContext = new EngineContext(_canvasCtx, "quarter", headers, chartData.data, new Map(chartData.operations), canvasConstants, taskConstants, expandCollapseSymbol, timeZone);
    const yearContext = new EngineContext(_canvasCtx, "year", headers, chartData.data, new Map(chartData.operations), canvasConstants, taskConstants, expandCollapseSymbol, timeZone);
    return [dayContext, weekContext, monthContext, quarterContext, yearContext];
};
const sortTasks = (data, expandCollapseSymbol) => {
    const operations = {
        open: false,
        symbol: expandCollapseSymbol.neutral,
        padding: FIRST_COLUMN_PADDING,
        children: [],
    };
    const dataMap = new Map();
    const operationsData = new Map();
    operationsData.set(PARENT_KEY, { ...operations, open: true });
    for (const item of data) {
        const key = item.pParent || PARENT_KEY;
        item.pParent = key;
        const previous = dataMap.get(key) || [];
        dataMap.set(key, previous.concat(item));
        if (operationsData.has(key)) {
            const op = operationsData.get(key);
            const children = [...(op?.children || []), item.pId];
            operationsData.set(key, {
                open: typeof op?.open == "boolean" ? op?.open : false,
                children: children,
                padding: op?.padding || 0,
                symbol: expandCollapseSymbol.expand,
            });
            operationsData.set(item.pId, {
                ...operations,
                padding: FIRST_COLUMN_PADDING + (op?.padding || 0),
            });
        }
    }
    const result = [];
    const getChildren = (parentKey) => {
        for (const item of dataMap.get(parentKey) || []) {
            result.push(item);
            getChildren(item.pId);
        }
    };
    getChildren(PARENT_KEY);
    return { data: result, operations: operationsData };
};
//# sourceMappingURL=helper.js.map