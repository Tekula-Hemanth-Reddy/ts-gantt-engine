import { EXPAND_COLLAPSE_SYMBOL, type IExpandCollapseSymbol } from "../../common";

export class ExpandCollapse {
    private expand: string = EXPAND_COLLAPSE_SYMBOL.expand;
    private collapse: string = EXPAND_COLLAPSE_SYMBOL.collapse;
    private neutral: string = EXPAND_COLLAPSE_SYMBOL.neutral;

    constructor(expandCollapse: IExpandCollapseSymbol) {
        this.expand = expandCollapse.expand;
        this.collapse = expandCollapse.collapse;
        this.neutral = expandCollapse.neutral;
    }

    getExpand() {
        return this.expand;
    }

    getCollapse() {
        return this.collapse;
    }

    getNeutral() {
        return this.neutral;
    }

    getExpandCollapseSymbol() {
        return {
            expand: this.expand,
            collapse: this.collapse,
            neutral: this.neutral,
        };
    }
}