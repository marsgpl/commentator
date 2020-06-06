const CSS_CLASS_COLUMNS_LOADER = '.columns__loader';
const CSS_CLASS_COLUMNS_PAGINATION_LOADER = '.columns__pagination-loader';
const CSS_CLASS_COLUMNS_COLUMN = '.columns__column';
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

        /** @type {Function} */ this.recalcColsHeights;
        /** @type {Function} */ this.getMinContentHeight;
        /** @type {Function} */ this.refreshDates;
        /** @type {Function} */ this.removeLoaders;
        /** @type {Function} */ this.addPaginationLoaders;
        /** @type {Function} */ this.getParamsForLoadComments;
        /** @type {Function} */ this.getUrlForLoadComments;
        /** @type {Function} */ this.getCommentsListFromLoadCommentsAnswer;
        /** @type {Function} */ this.toggleNoMsgsNotice;
        /** @type {Function} */ this.recalcIdsIndexAndPresence;
        /** @type {Function} */ this.getParentContainerForComment;
        /** @type {Function} */ this.areColsDisplayed;
        /** @type {Function} */ this.wrapComment;

        this.isVisible = false;
        this.dialog = dialog;
        this.statusRow = statusRow;

        this.canPaginate = true;
        this.paginationInProcess = false;
        this.canAutoRefresh = true;
        this.commentsEverLoaded = false;
        this.shownCommentIds = {};

        bind(window, 'scroll', this.onScroll.bind(this));
        bind(document, 'visibilitychange', this.onVisibilityChange.bind(this));
        bind(window, 'resize', this.onWindowResize.bind(this));

        this.startDateRefresher();
        this.startCommentRefresher();
    }

    onScroll() {
        if (!this.isVisible) return;
        if (!this.canPaginate) return;
        if (this.paginationInProcess) return;

        const windowHeight = window.innerHeight;
        const scrolledHeight = window.pageYOffset;

        if (this.getMinContentHeight() - scrolledHeight - windowHeight <= windowHeight * .7) {
            this.paginationInProcess = true;

            this.loadComments(true, () => {
                this.paginationInProcess = false;
            });
        }
    }

    onVisibilityChange() {
        this.canAutoRefresh = document.visibilityState === 'visible';

        if (this.canAutoRefresh) {
            this.refreshDates();
            this.loadComments();
        }
    }

    onWindowResize() {
        const oldValue = this.isVisible;
        const newValue = this.areColsDisplayed();

        this.isVisible = newValue;

        if (newValue && !oldValue) {
            this.onBecomeVisible();
        }
    }

    onBecomeVisible() {
        this.recalcColsHeights();
        this.loadComments();
    }

    startDateRefresher() {
        this.dateRefresherInterval = setInterval(() => {
            if (!this.canAutoRefresh) return;
            this.refreshDates();
        }, 60000);
    }

    startCommentRefresher() {
        this.commentRefresherInterval = setInterval(() => {
            if (!this.canAutoRefresh) return;
            this.loadComments();
        }, 10000);
    }

    createPaginationLoader() {
        return createNode('div', [
            CSS_CLASS_LOADER,
            CSS_CLASS_COLUMNS_PAGINATION_LOADER,
        ]);
    }

    loadComments(isPagination = false, then = null) {
        if (!this.isVisible) return;

        const url = this.getUrlForLoadComments();
        const params = this.getParamsForLoadComments(isPagination);

        if (isPagination) {
            this.addPaginationLoaders();
        }

        ajax(API_METHOD_GET, url, params, json => {
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

            this.commentsEverLoaded = true;

            this.removeLoaders();

            this.statusRow.setSide(
                API_COMMENT_SIDE_POSITIVE,
                json[API_PARAM_POSITIVE_COMMENTS_TOTAL_COUNT]);

            this.statusRow.setSide(
                API_COMMENT_SIDE_NEGATIVE,
                json[API_PARAM_NEGATIVE_COMMENTS_TOTAL_COUNT]);

            this.addComments(
                isPagination,
                this.getCommentsListFromLoadCommentsAnswer(json),
            );

            this.toggleNoMsgsNotice();
            this.recalcColsHeights();

            then && then();
        });
    }

    addComments(isPagination, commentsListFromApi) {
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
            const isPositive = commentFromApi[API_PARAM_SIDE] === API_COMMENT_SIDE_POSITIVE;

            if (this.shownCommentIds[id]) return;

            const comment = createNode('div', CSS_CLASS_COMMENT);
            const header = createNode('div', CSS_CLASS_COMMENT_HEADER);
            const author = createNode('div', CSS_CLASS_COMMENT_AUTHOR);
            const date = createNode('div', CSS_CLASS_COMMENT_DATE);
            const text = createNode('div', CSS_CLASS_COMMENT_TEXT);
            const textWrap = createNode('div', CSS_CLASS_COMMENT_TEXT_WRAP);

            this.shownCommentIds[id] = [comment, commentFromApi];

            author.innerText = commentFromApi[API_PARAM_NAME] || '#lang#comment_anonymous_name#';
            text.innerText = commentFromApi[API_PARAM_TEXT];

            date.t = new Date(commentFromApi[API_PARAM_CREATED_AT]);
            this.refreshDate(date);

            bind(date, 'click', () => {
                this.dialog.showModal(
                    '#lang#comment_popup_creation_time_title#',
                    date.t.toString().replace(' (', '<br>('),
                    // '#lang#comment_popup_creation_time_button#',
                );
            });

            push(textWrap, text);
            push(header, author);
            push(header, date);
            push(comment, header);
            push(comment, textWrap);

            this.recalcIdsIndexAndPresence(id, isPositive);

            const parent = this.getParentContainerForComment(isPositive);

            (isPagination ? push : unshift)(parent, this.wrapComment(comment, isPositive));

            this.foldText(comment, textWrap, text, id);
        });
    }

    foldText(comment, textWrap, text, id) {
        const wrapHeight = textWrap.offsetHeight;

        if (text.offsetHeight <= wrapHeight) {
            return;
        }

        text.classList.add(CSS_CLASS_COMMENT_TEXT_BIG.substr(1));

        const showFull = createNode('a', CSS_CLASS_COMMENT_SHOW_FULL);

        showFull.href = `#comment:${id}`;
        showFull.innerText = '#lang#show_full_comment#';

        bind(showFull, 'click', event => {
            event.preventDefault();

            remove(showFull);

            text.classList.remove(CSS_CLASS_COMMENT_TEXT_BIG.substr(1));
            textWrap.classList.add(CSS_CLASS_COMMENT_TEXT_WRAP_LOOSE.substr(1));
        });

        push(comment, showFull);
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
}
