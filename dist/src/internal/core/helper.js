import { FIRST_COLUMN_PADDING, PARENT_KEY, } from "../common/index.js";
import { EngineContext } from "./engine-context.js";
export const getEngines = (_canvasCtx, headers, data) => {
    const chartData = sortTasks(data);
    const dayContext = new EngineContext(_canvasCtx, "day", headers, chartData.data, new Map(chartData.operations));
    const weekContext = new EngineContext(_canvasCtx, "week", headers, chartData.data, new Map(chartData.operations));
    const monthContext = new EngineContext(_canvasCtx, "month", headers, chartData.data, new Map(chartData.operations));
    const quarterContext = new EngineContext(_canvasCtx, "quarter", headers, chartData.data, new Map(chartData.operations));
    const yearContext = new EngineContext(_canvasCtx, "year", headers, chartData.data, new Map(chartData.operations));
    return [dayContext, weekContext, monthContext, quarterContext, yearContext];
};
const sortTasks = (data) => {
    const operations = {
        open: false,
        symbol: "",
        padding: FIRST_COLUMN_PADDING,
        children: [],
    };
    const dataMap = new Map();
    const operationsData = new Map();
    operationsData.set(PARENT_KEY, {
        open: true,
        symbol: "",
        padding: 0,
        children: [],
    });
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
                symbol: "+",
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