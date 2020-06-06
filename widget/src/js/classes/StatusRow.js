const CSS_CLASS_STATUS_COLUMN_LEFT = '.status__column_left';
const CSS_CLASS_STATUS_COLUMN_RIGHT = '.status__column_right';
const CSS_CLASS_STATUS_COUNTER = '.status__counter';
const CSS_CLASS_STATUS_LIBRA = '.status__libra';
const CSS_CLASS_LIBRA_LEFT = '.libra_left';
const CSS_CLASS_LIBRA_RIGHT = '.libra_right';

class StatusRow {
    constructor() {
        this._libraEl = $(CSS_CLASS_STATUS_LIBRA);
        this._positiveSideCounterEl = $(CSS_CLASS_STATUS_COUNTER, CSS_CLASS_STATUS_COLUMN_LEFT);
        this._negativeSideCounterEl = $(CSS_CLASS_STATUS_COUNTER, CSS_CLASS_STATUS_COLUMN_RIGHT);
    }

    setSide(side, value) {
        const oldValue = side === API_COMMENT_SIDE_POSITIVE ?
            this.getPositiveSideCounterValue() :
            this.getNegativeSideCounterValue();

        if (value < oldValue) return;

        const node = side === API_COMMENT_SIDE_POSITIVE ?
            this._positiveSideCounterEl :
            this._negativeSideCounterEl;

        node.innerText = value;

        this.rebalanceLibra();
    }

    incrementSide(side, amount = 1) {
        const oldValue = side === API_COMMENT_SIDE_POSITIVE ?
            this.getPositiveSideCounterValue() :
            this.getNegativeSideCounterValue();

        this.setSide(side, oldValue + amount);
    }

    getPositiveSideCounterValue() {
        return parseInt(this._positiveSideCounterEl.innerText, 10) || 0;
    }

    getNegativeSideCounterValue() {
        return parseInt(this._negativeSideCounterEl.innerText, 10) || 0;
    }

    rebalanceLibra() {
        const leftValue = this.getPositiveSideCounterValue();
        const rightValue = this.getNegativeSideCounterValue();

        const classList = this._libraEl.classList;
        const leftCl = CSS_CLASS_LIBRA_LEFT.substr(1);
        const rightCl = CSS_CLASS_LIBRA_RIGHT.substr(1);

        classList.remove(leftCl);
        classList.remove(rightCl);

        if (leftValue > rightValue) {
            classList.add(leftCl);
        } else if (rightValue > leftValue) {
            classList.add(rightCl);
        }
    }
}
