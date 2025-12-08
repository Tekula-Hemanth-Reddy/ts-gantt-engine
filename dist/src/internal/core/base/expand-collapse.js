import { EXPAND_COLLAPSE_SYMBOL } from "../../common/index.js";
export class ExpandCollapse {
    expand = EXPAND_COLLAPSE_SYMBOL.expand;
    collapse = EXPAND_COLLAPSE_SYMBOL.collapse;
    neutral = EXPAND_COLLAPSE_SYMBOL.neutral;
    constructor(expandCollapse) {
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
//# sourceMappingURL=expand-collapse.js.map