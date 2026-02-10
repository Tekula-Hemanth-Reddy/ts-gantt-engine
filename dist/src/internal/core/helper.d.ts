import { type GanttHeader, type GanttTask } from "../../engine/model.js";
import { CanvasConstants, ExpandCollapse, TaskConstants } from "./base/index.js";
import { EngineContext } from "./engine-context.js";
export declare const getEngines: (_canvasCtx: CanvasRenderingContext2D, headers: GanttHeader[], data: GanttTask[], canvasConstants: CanvasConstants, taskConstants: TaskConstants, expandCollapseSymbol: ExpandCollapse, timeZone?: string) => [EngineContext, EngineContext, EngineContext, EngineContext, EngineContext];
//# sourceMappingURL=helper.d.ts.map