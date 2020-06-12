class CommentsMono extends Comments {
    constructor(dialog, statusRow, replyToCommentModal) {
        super(dialog, statusRow, replyToCommentModal);

        /** @type {string} */ this.newestId;
        /** @type {string} */ this.oldestId;
        /** @type {number} */ this.colHeight;

        this.hasComments = false;

        this._colEl = $(CSS_CLASS_COLUMNS_COLUMN_MONO);
        this._moMsgsEl = $(CSS_CLASS_COLUMNS_NO_MSGS, this._colEl);

        this.onWindowResize();
    }

    areColsDisplayed() {
        return isDisplayed(this._colEl);
    }

    recalcColsHeights() {
        this.colHeight = 99 + 78; // @see columns.css .columns__column padding

        $$(CSS_CLASS_COMMENT, this._colEl).forEach(comment => {
            this.colHeight += comment.offsetHeight + 0 + 10; // @see comment.css .comment margin
        });
    }

    getMinContentHeight() {
        return this.colHeight;
    }

    refreshDates() {
        if (!this.isColumnVisible) return;

        $$(CSS_CLASS_COMMENT_DATE, this._colEl).forEach(date => {
            this.refreshDate(date);
        });
    }

    addPaginationLoaders() {
        push(this._colEl, this.createPaginationLoader());
    }

    removeLoaders() {
        remove($$(CSS_CLASS_LOADER, this._colEl));
    }

    getParamsForLoadComments(isPagination) {
        const params = {
            [API_PARAM_COMMENTATOR_ID]: API_COMMENTATOR_ID,
            [API_PARAM_LANG]: API_LANG,
            [API_PARAM_APP_USER_TOKEN]: APP_USER_TOKEN,
        };

        if (isPagination) {
            if (this.oldestId) {
                params[API_PARAM_OLDEST_ID] = this.oldestId;
            }
        } else {
            if (this.newestId) {
                params[API_PARAM_NEWEST_ID] = this.newestId;
            }
        }

        return params;
    }

    getUrlForLoadComments() {
        return API_BASE_URL + API_METHOD_GET_COMMENTS_MONO;
    }

    getCommentsListFromLoadCommentsAnswer(json) {
        return json[API_PARAM_COMMENTS];
    }

    checkCanPaginateFurther(json) {
        if (json[API_PARAM_COMMENTS].length < Comments.commentsPerQuery) {
            this.canPaginate = false;
        }
    }

    toggleNoMsgsNotice() {
        if (this.hasComments) {
            if (this._moMsgsEl) {
                remove(this._moMsgsEl);
                this._moMsgsEl = null;
            }
        } else {
            show(this._moMsgsEl);
        }
    }

    recalcIdsIndexAndPresence(id) {
        this.hasComments = true;

        if (!this.newestId || id > this.newestId) this.newestId = id;
        if (!this.oldestId || id < this.oldestId) this.oldestId = id;
    }

    getParentContainerForComment() {
        return this._colEl;
    }

    wrapComment(comment, isPositive) {
        const wrap = createNode('div', [
            CSS_CLASS_COMMENT_WRAP,
            isPositive ?
                CSS_CLASS_COMMENT_WRAP_POSITIVE :
                CSS_CLASS_COMMENT_WRAP_NEGATIVE,
        ]);

        push(wrap, comment);

        return wrap;
    }
}
