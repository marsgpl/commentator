const CSS_CLASS_COLUMNS_COLUMN_POSITIVE = '.columns__column_positive';
const CSS_CLASS_COLUMNS_COLUMN_NEGATIVE = '.columns__column_negative';

class CommentsDual extends Comments {
    constructor(dialog, statusRow) {
        super(dialog, statusRow);

        /** @type {string} */ this.newestPositiveId;
        /** @type {string} */ this.newestNegativeId;
        /** @type {string} */ this.oldestPositiveId;
        /** @type {string} */ this.oldestNegativeId;
        /** @type {number} */ this.positiveColHeight;
        /** @type {number} */ this.negativeColHeight;

        this.hasPositiveComments = false;
        this.hasNegativeComments = false;

        this._positiveColEl = $(CSS_CLASS_COLUMNS_COLUMN_POSITIVE);
        this._negativeColEl = $(CSS_CLASS_COLUMNS_COLUMN_NEGATIVE);
        this._positiveNoMsgsEl = $(CSS_CLASS_COLUMNS_NO_MSGS, this._positiveColEl);
        this._negativeNoMsgsEl = $(CSS_CLASS_COLUMNS_NO_MSGS, this._negativeColEl);

        this.onWindowResize();
    }

    areColsDisplayed() {
        return isDisplayed(this._positiveColEl)
            && isDisplayed(this._negativeColEl);
    }

    recalcColsHeights() {
        this.positiveColHeight = 126 + 78; // @see columns.css .columns__column padding

        $$(CSS_CLASS_COMMENT, this._positiveColEl).forEach(comment => {
            this.positiveColHeight += comment.offsetHeight + 5 + 10; // @see comment.css .comment margin
        });

        this.negativeColHeight = 126 + 78; // @see columns.css .columns__column padding

        $$(CSS_CLASS_COMMENT, this._negativeColEl).forEach(comment => {
            this.negativeColHeight += comment.offsetHeight + 5 + 10; // @see comment.css .comment margin
        });
    }

    getMinContentHeight() {
        return Math.min(this.positiveColHeight, this.negativeColHeight);
    }

    refreshDates() {
        if (!this.isVisible) return;

        $$(CSS_CLASS_COMMENT_DATE, this._positiveColEl).forEach(date => {
            this.refreshDate(date);
        });

        $$(CSS_CLASS_COMMENT_DATE, this._negativeColEl).forEach(date => {
            this.refreshDate(date);
        });
    }

    addPaginationLoaders() {
        push(this._positiveColEl, this.createPaginationLoader());
        push(this._negativeColEl, this.createPaginationLoader());
    }

    removeLoaders() {
        remove($$(CSS_CLASS_LOADER, this._positiveColEl));
        remove($$(CSS_CLASS_LOADER, this._negativeColEl));
    }

    getParamsForLoadComments(isPagination) {
        const params = {
            [API_PARAM_COMMENTATOR_ID]: API_COMMENTATOR_ID,
            [API_PARAM_LANG]: API_LANG,
        };

        if (isPagination) {
            if (this.oldestPositiveId) {
                params[API_PARAM_OLDEST_POSITIVE_ID] = this.oldestPositiveId;
            }
            if (this.oldestNegativeId) {
                params[API_PARAM_OLDEST_NEGATIVE_ID] = this.oldestNegativeId;
            }
        } else {
            if (this.newestPositiveId) {
                params[API_PARAM_NEWEST_POSITIVE_ID] = this.newestPositiveId;
            }
            if (this.newestNegativeId) {
                params[API_PARAM_NEWEST_NEGATIVE_ID] = this.newestNegativeId;
            }
        }

        return params;
    }

    getUrlForLoadComments() {
        return API_BASE_URL + API_METHOD_GET_COMMENTS_DUAL;
    }

    getCommentsListFromLoadCommentsAnswer(json) {
        return json[API_PARAM_POSITIVE_COMMENTS]
            .concat(json[API_PARAM_NEGATIVE_COMMENTS]);
    }

    toggleNoMsgsNotice() {
        if (this.hasPositiveComments) {
            if (this._positiveNoMsgsEl) {
                remove(this._positiveNoMsgsEl);
                this._positiveNoMsgsEl = null;
            }
        } else {
            show(this._positiveNoMsgsEl);
        }

        if (this.hasNegativeComments) {
            if (this._negativeNoMsgsEl) {
                remove(this._negativeNoMsgsEl);
                this._negativeNoMsgsEl = null;
            }
        } else {
            show(this._negativeNoMsgsEl);
        }
    }

    recalcIdsIndexAndPresence(id, isPositive) {
        if (isPositive) {
            this.hasPositiveComments = true;

            if (!this.newestPositiveId || id > this.newestPositiveId) this.newestPositiveId = id;
            if (!this.oldestPositiveId || id < this.oldestPositiveId) this.oldestPositiveId = id;
        } else {
            this.hasNegativeComments = true;

            if (!this.newestNegativeId || id > this.newestNegativeId) this.newestNegativeId = id;
            if (!this.oldestNegativeId || id < this.oldestNegativeId) this.oldestNegativeId = id;
        }
    }

    getParentContainerForComment(isPositive) {
        return isPositive ?
            this._positiveColEl :
            this._negativeColEl;
    }

    wrapComment(comment) {
        // wrap is not needed for dual col view
        return comment;
    }
}
