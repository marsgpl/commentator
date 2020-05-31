const CSS_CLASS_COLUMNS_LOADER = '.columns__loader';
const CSS_CLASS_COLUMNS_COLUMN_POSITIVE = '.columns__column_positive';
const CSS_CLASS_COLUMNS_COLUMN_NEGATIVE = '.columns__column_negative';
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
        /** @type {string} */ this.newestId;
        /** @type {string} */ this.oldestId;

        this.totalCommentsCount = 0;
        this.totalCommentsShown = 0;
        this.canPaginate = true;
        this.paginationInProcess = false;

        this.shownCommentIds = {};

        this.dialog = dialog;
        this.statusRow = statusRow;

        this._positiveColEl = $(CSS_CLASS_COLUMNS_COLUMN_POSITIVE);
        this._negativeColEl = $(CSS_CLASS_COLUMNS_COLUMN_NEGATIVE);

        this.loadComments();
        this.startDateRefresher();
        this.startCommentRefresher();

        bind(window, 'scroll', this.onScroll.bind(this));
    }

    onScroll() {
        if (!this.canPaginate) return;
        if (this.paginationInProcess) return;

        const db = document.body;
        const de = document.documentElement;

        const contentHeight = Math.max(
            db.scrollHeight, de.scrollHeight,
            db.offsetHeight, de.offsetHeight,
            db.clientHeight, de.clientHeight,
        );
        const windowHeight = window.innerHeight;
        const scrolledHeight = window.pageYOffset;

        if (contentHeight - scrolledHeight - windowHeight <= windowHeight * .8) {
            this.paginationInProcess = true;

            this.loadComments(true, () => {
                this.paginationInProcess = false;
            });
        }
    }

    startDateRefresher() {
        this.dateRefresherInterval = setInterval(() => {
            $$(CSS_CLASS_COMMENT_DATE).forEach(date => {
                this.refreshDate(date);
            });
        }, 60000);
    }

    startCommentRefresher() {
        this.commentRefresherInterval = setInterval(() => {
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
            this.canPaginate = false;
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
            this.totalCommentsShown++;

            if (this.totalCommentsShown >= this.totalCommentsCount) {
                this.canPaginate = false;
            }

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

            const parent = (commentFromApi[API_PARAM_SIDE] === API_SIDE_POSITIVE) ?
                this._positiveColEl :
                this._negativeColEl;

            (isPagination ? push : unshift)(parent, comment);

            setTimeout(() => {
                this.foldText(textWrap, text, comment, id);
            }, 0);

            if (!this.newestId || id > this.newestId) this.newestId = id;
            if (!this.oldestId || id < this.oldestId) this.oldestId = id;
        });
    }

    foldText(textWrap, text, comment, id) {
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
            if (this.oldestId) {
                params[API_PARAM_OLDEST_ID] = this.oldestId;
            }
        } else {
            if (this.newestId) {
                params[API_PARAM_NEWEST_ID] = this.newestId;
            }
        }

        ajax(API_METHOD_GET, API_BASE_URL + API_METHOD_GET_COMMENTS, params, json => {
            if (apiRequestFailed(json)) {
                const error = apiExtractError(json);

                this.dialog.showModal(
                    '#lang#init_comments_failed_title#',
                    `#lang#init_comments_failed_message#<br><br>${error}`,
                    '#lang#init_comments_failed_button#',
                    () => {
                        window.location.reload();
                    },
                );

                return then && then();
            }

            this.totalCommentsCount =
                json[API_PARAM_POSITIVE_COMMENTS_TOTAL_COUNT] +
                json[API_PARAM_NEGATIVE_COMMENTS_TOTAL_COUNT];

            this.statusRow.setSide(
                API_SIDE_POSITIVE,
                json[API_PARAM_POSITIVE_COMMENTS_TOTAL_COUNT]);

            this.statusRow.setSide(
                API_SIDE_NEGATIVE,
                json[API_PARAM_NEGATIVE_COMMENTS_TOTAL_COUNT]);

            this.hideLoaders();

            this.addComments(
                json[API_PARAM_POSITIVE_COMMENTS]
                    .concat(json[API_PARAM_NEGATIVE_COMMENTS]),
                isPagination);

            then && then();
        });
    }
}
