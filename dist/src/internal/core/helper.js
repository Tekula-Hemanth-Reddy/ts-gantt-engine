"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEngines = void 0;
const common_1 = require("../common");
const engine_context_1 = require("./engine-context");
const getEngines = (_canvasCtx, headers, data) => {
    const chartData = sortTasks(data);
    const dayContext = new engine_context_1.EngineContext(_canvasCtx, "day", headers, chartData.data, new Map(chartData.operations));
    const weekContext = new engine_context_1.EngineContext(_canvasCtx, "week", headers, chartData.data, new Map(chartData.operations));
    const monthContext = new engine_context_1.EngineContext(_canvasCtx, "month", headers, chartData.data, new Map(chartData.operations));
    const quarterContext = new engine_context_1.EngineContext(_canvasCtx, "quarter", headers, chartData.data, new Map(chartData.operations));
    const yearContext = new engine_context_1.EngineContext(_canvasCtx, "year", headers, chartData.data, new Map(chartData.operations));
    return [dayContext, weekContext, monthContext, quarterContext, yearContext];
};
exports.getEngines = getEngines;
const sortTasks = (data) => {
    const operations = {
        open: false,
        symbol: "",
        padding: common_1.FIRST_COLUMN_PADDING,
        children: [],
    };
    const dataMap = new Map();
    const operationsData = new Map();
    operationsData.set(common_1.PARENT_KEY, {
        open: true,
        symbol: "",
        padding: 0,
        children: [],
    });
    for (const item of data) {
        const key = item.pParent || common_1.PARENT_KEY;
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
                padding: common_1.FIRST_COLUMN_PADDING + (op?.padding || 0),
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
    getChildren(common_1.PARENT_KEY);
    return { data: result, operations: operationsData };
};
//# sourceMappingURL=helper.js.map