import { type IExpandCollapseSymbol } from "../../common/index.js";
export declare class ExpandCollapse {
    private expand;
    private collapse;
    private neutral;
    constructor(expandCollapse: IExpandCollapseSymbol);
    getExpand(): string;
    getCollapse(): string;
    getNeutral(): string;
    getExpandCollapseSymbol(): {
        expand: string;
        collapse: string;
        neutral: string;
    };
}
//# sourceMappingURL=expand-collapse.d.ts.map