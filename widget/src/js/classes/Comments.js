const CSS_CLASS_COLUMNS_LOADER = '.columns__loader';
const CSS_CLASS_COLUMNS_COLUMN = '.columns__column';
const CSS_CLASS_COLUMNS_COLUMN_POSITIVE = '.columns__column_positive';
const CSS_CLASS_COLUMNS_COLUMN_NEGATIVE = '.columns__column_negative';
const CSS_CLASS_COLUMNS_NO_MSGS = '.columns__no-msgs';
const CSS_CLASS_COMMENT = '.comment';
const CSS_CLASS_COMMENT_HEADER = '.comment__header';
const CSS_CLASS_COMMENT_AUTHOR = '.comment__author';
const CSS_CLASS_COMMENT_DATE = '.comment__date';
const CSS_CLASS_COMMENT_TEXT = '.comment__text';
const CSS_CLASS_COMMENT_TEXT_BIG = '.comment__text_big';
const CSS_CLASS_COMMENT_TEXT_WRAP = '.comment__text-wrap';
const CSS_CLASS_COMMENT_TEXT_WRAP_LOOSE = '.comment__text-wrap_loose';
const CSS_CLASS_COMMENT_SHOW_FULL = '.comment__show-full';

class Comments {
    /**
     * @param {Dialog} dialog
     * @param {StatusRow} statusRow
     */
    constructor(dialog, statusRow) {
        /** @type {number} */ this.dateRefresherInterval;
        /** @type {number} */ this.commentRefresherInterval;
        /** @type {string} */ this.newestPositiveId;
        /** @type {string} */ this.oldestPositiveId;
        /** @type {string} */ this.newestNegativeId;
        /** @type {string} */ this.oldestNegativeId;
        /** @type {number} */ this.positiveColHeight;
        /** @type {number} */ this.negativeColHeight;

        this.canPaginate = true;
        this.paginationInProcess = false;
        this.canAutoRefresh = true;
        this.hasPositiveComments = false;
        this.hasNegativeComments = false;
        this.commentsEverLoaded = false;

        this.shownCommentIds = {};

        this.dialog = dialog;
        this.statusRow = statusRow;

        this._positiveColEl = $(CSS_CLASS_COLUMNS_COLUMN_POSITIVE);
        this._negativeColEl = $(CSS_CLASS_COLUMNS_COLUMN_NEGATIVE);

        this.recalcPositiveColHeight();
        this.recalcNegativeColHeight();

        this.loadComments();
        this.startDateRefresher();
        this.startCommentRefresher();

        bind(window, 'scroll', this.onScroll.bind(this));
        bind(document, 'visibilitychange', this.onVisibilityChange.bind(this));
    }

    onVisibilityChange() {
        this.canAutoRefresh = document.visibilityState === 'visible';

        if (this.canAutoRefresh) {
            this.refreshDates();
            this.loadComments();
        }
    }

    onScroll() {
        if (!this.canPaginate) return;
        if (this.paginationInProcess) return;

        const minContentHeight = Math.min(this.positiveColHeight, this.negativeColHeight);
        const windowHeight = window.innerHeight;
        const scrolledHeight = window.pageYOffset;

        if (minContentHeight - scrolledHeight - windowHeight <= windowHeight * .8) {
            this.paginationInProcess = true;

            this.loadComments(true, () => {
                this.paginationInProcess = false;
            });
        }
    }

    startDateRefresher() {
        this.dateRefresherInterval = setInterval(() => {
            if (!this.canAutoRefresh) return;
            this.refreshDates();
        }, 60000);
    }

    refreshDates() {
        $$(CSS_CLASS_COMMENT_DATE).forEach(date => {
            this.refreshDate(date);
        });
    }

    startCommentRefresher() {
        this.commentRefresherInterval = setInterval(() => {
            if (!this.canAutoRefresh) return;
            this.loadComments();
        }, 10000);
    }

    refreshDate(node) {
        const date = node.t;
        const now = new Date;

        let value = '';

        const y = date.getFullYear();
        const m = date.getMonth();
        const d = date.getDate();
        const hh = date.getHours();
        const mm = date.getMinutes();

        if (y != now.getFullYear()) {
            value = `${d} ${monthName(m)} ${y}`;
        } else if (m != now.getMonth() || d != now.getDate()) {
            value = `${d} ${monthName(m)}`;
        } else if (hh != now.getHours() || mm != now.getMinutes()) {
            value = `${addz(hh)}:${addz(mm)}`;
        } else {
            value = '#lang#format_time_right_now#';
        }

        node.innerText = value;
    }

    addComments(commentsListFromApi, isPagination = false) {
        if (commentsListFromApi.length === 0) {
            if (isPagination) {
                this.canPaginate = false;
            }

            return;
        }

        if (!isPagination) {
            commentsListFromApi = commentsListFromApi.reverse();
        }

        commentsListFromApi.forEach(commentFromApi => {
            const id = commentFromApi[API_PARAM_ID];

            if (this.shownCommentIds[id]) return;

            const comment = createNode('div', CSS_CLASS_COMMENT.substr(1));
            const header = createNode('div', CSS_CLASS_COMMENT_HEADER.substr(1));
            const author = createNode('div', CSS_CLASS_COMMENT_AUTHOR.substr(1));
            const date = createNode('div', CSS_CLASS_COMMENT_DATE.substr(1));
            const text = createNode('div', CSS_CLASS_COMMENT_TEXT.substr(1));
            const textWrap = createNode('div', CSS_CLASS_COMMENT_TEXT_WRAP.substr(1));

            this.shownCommentIds[id] = [comment, commentFromApi];

            author.innerText = commentFromApi[API_PARAM_NAME] || '#lang#comment_anonymous_name#';
            text.innerText = commentFromApi[API_PARAM_TEXT];

            date.t = new Date(commentFromApi[API_PARAM_CREATED_AT]);
            this.refreshDate(date);

            bind(date, 'click', () => {
                this.dialog.showModal(
                    '#lang#comment_popup_creation_time_title#',
                    date.t,
                    // '#lang#comment_popup_creation_time_button#',
                );
            });

            push(textWrap, text);
            push(header, author);
            push(header, date);
            push(comment, header);
            push(comment, textWrap);

            const isPositive = commentFromApi[API_PARAM_SIDE] === API_SIDE_POSITIVE;

            if (isPositive) {
                this.hasPositiveComments = true;

                if (!this.newestPositiveId || id > this.newestPositiveId) this.newestPositiveId = id;
                if (!this.oldestPositiveId || id < this.oldestPositiveId) this.oldestPositiveId = id;
            } else {
                this.hasNegativeComments = true;

                if (!this.newestNegativeId || id > this.newestNegativeId) this.newestNegativeId = id;
                if (!this.oldestNegativeId || id < this.oldestNegativeId) this.oldestNegativeId = id;
            }

            const parent = isPositive ?
                this._positiveColEl :
                this._negativeColEl;

            (isPagination ? push : unshift)(parent, comment);

            this.foldText(comment, textWrap, text, id, isPositive);
        });
    }

    foldText(comment, textWrap, text, id, isPositive) {
        const wrapHeight = textWrap.offsetHeight;

        if (text.offsetHeight <= wrapHeight) {
            return;
        }

        text.classList.add(CSS_CLASS_COMMENT_TEXT_BIG.substr(1));

        const showFull = createNode('a', CSS_CLASS_COMMENT_SHOW_FULL.substr(1));

        showFull.href = `#comment:${id}`;
        showFull.innerText = '#lang#show_full_comment#';

        bind(showFull, 'click', event => {
            event.preventDefault();

            remove(showFull);

            text.classList.remove(CSS_CLASS_COMMENT_TEXT_BIG.substr(1));
            textWrap.classList.add(CSS_CLASS_COMMENT_TEXT_WRAP_LOOSE.substr(1));

            if (isPositive) {
                this.recalcPositiveColHeight();
            } else {
                this.recalcNegativeColHeight();
            }
        });

        push(comment, showFull);
    }

    hideLoaders() {
        $$(CSS_CLASS_COLUMNS_LOADER).forEach(remove);
    }

    loadComments(isPagination = false, then = null) {
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

        ajax(API_METHOD_GET, API_BASE_URL + API_METHOD_GET_COMMENTS, params, json => {
            if (apiRequestFailed(json)) {
                const error = apiExtractError(json);

                if (!this.commentsEverLoaded) {
                    this.dialog.showModal(
                        '#lang#init_comments_failed_title#',
                        `#lang#init_comments_failed_message#<br><br>${error}`,
                        '#lang#init_comments_failed_button#',
                        () => {
                            window.location.reload();
                        },
                    );
                }

                return then && then();
            }

            if (!this.commentsEverLoaded) {
                this.commentsEverLoaded = true;
                this.hideLoaders();
            }

            this.statusRow.setSide(
                API_SIDE_POSITIVE,
                json[API_PARAM_POSITIVE_COMMENTS_TOTAL_COUNT]);

            this.statusRow.setSide(
                API_SIDE_NEGATIVE,
                json[API_PARAM_NEGATIVE_COMMENTS_TOTAL_COUNT]);

            this.addComments(
                json[API_PARAM_POSITIVE_COMMENTS]
                    .concat(json[API_PARAM_NEGATIVE_COMMENTS]),
                isPagination);

            if (this.hasPositiveComments) {
                hide($(CSS_CLASS_COLUMNS_NO_MSGS, CSS_CLASS_COLUMNS_COLUMN_POSITIVE));
            } else {
                show($(CSS_CLASS_COLUMNS_NO_MSGS, CSS_CLASS_COLUMNS_COLUMN_POSITIVE));
            }

            if (this.hasNegativeComments) {
                hide($(CSS_CLASS_COLUMNS_NO_MSGS, CSS_CLASS_COLUMNS_COLUMN_NEGATIVE));
            } else {
                show($(CSS_CLASS_COLUMNS_NO_MSGS, CSS_CLASS_COLUMNS_COLUMN_NEGATIVE));
            }

            this.recalcPositiveColHeight();
            this.recalcNegativeColHeight();

            then && then();
        });
    }

    recalcPositiveColHeight() {
        this.positiveColHeight = 126 + 78; // @see columns.css .columns__column padding

        $$(CSS_CLASS_COMMENT, CSS_CLASS_COLUMNS_COLUMN_POSITIVE).forEach(comment => {
            this.positiveColHeight += comment.offsetHeight + 5 + 10; // @see comment.css .comment margin
        });
    }

    recalcNegativeColHeight() {
        this.negativeColHeight = 126 + 78; // @see columns.css .columns__column padding

        $$(CSS_CLASS_COMMENT, CSS_CLASS_COLUMNS_COLUMN_NEGATIVE).forEach(comment => {
            this.negativeColHeight += comment.offsetHeight + 5 + 10; // @see comment.css .comment margin
        });
    }
}
