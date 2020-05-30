const CSS_CLASS_COLUMNS_LOADER = '.columns__loader';
const CSS_CLASS_COLUMNS_COLUMN_POSITIVE = '.columns__column_positive';
const CSS_CLASS_COLUMNS_COLUMN_NEGATIVE = '.columns__column_negative';
const CSS_CLASS_COMMENT = '.comment';
const CSS_CLASS_COMMENT_HEADER = '.comment__header';
const CSS_CLASS_COMMENT_AUTHOR = '.comment__author';
const CSS_CLASS_COMMENT_DATE = '.comment__date';
const CSS_CLASS_COMMENT_TEXT = '.comment__text';

class Comments {
    /**
     * @param {Dialog} dialog
     * @param {StatusRow} statusRow
     */
    constructor(dialog, statusRow) {
        /** @type {number} */ this.dateRefresherInterval;
        /** @type {number} */ this.commentRefresherInterval;

        this.shownCommentIds = {};

        this.dialog = dialog;
        this.statusRow = statusRow;

        this._positiveColEl = $(CSS_CLASS_COLUMNS_COLUMN_POSITIVE);
        this._negativeColEl = $(CSS_CLASS_COLUMNS_COLUMN_NEGATIVE);

        this.loadComments();
        this.startDateRefresher();
        this.startCommentRefresher();
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
        }, 5000);
    }

    refreshDate(node) {
        const date = node.t;
        const now = new Date;
        const at = '#lang#format_time_at#';
        const today = '#lang#format_time_today#';

        let value = '';

        const y = date.getFullYear();
        const m = date.getMonth();
        const d = date.getDate();
        const hh = date.getHours();
        const mm = date.getMinutes();

        if (y != now.getFullYear()) {
            value = `${d} ${monthName(m)} ${y} ${at} ${hh}:${mm}`;
        } else if (m != now.getMonth() || d != now.getDate()) {
            value = `${d} ${monthName(m)} ${at} ${hh}:${mm}`;
        } else if (hh != now.getHours() || mm != now.getMinutes()) {
            value = `${today} ${at} ${hh}:${mm}`;
        } else {
            value = '#lang#format_time_right_now#';
        }

        node.innerText = value;
    }

    appendComments(commentsListFromApi) {
        commentsListFromApi.forEach(commentFromApi => {
            const id = commentFromApi[API_PARAM_ID];

            if (this.shownCommentIds[id]) return;

            const comment = createNode('div', CSS_CLASS_COMMENT.substr(1));
            const header = createNode('div', CSS_CLASS_COMMENT_HEADER.substr(1));
            const author = createNode('div', CSS_CLASS_COMMENT_AUTHOR.substr(1));
            const date = createNode('div', CSS_CLASS_COMMENT_DATE.substr(1));
            const text = createNode('div', CSS_CLASS_COMMENT_TEXT.substr(1));

            this.shownCommentIds[id] = comment;

            author.innerText = commentFromApi[API_PARAM_NAME] || '#lang#comment_anonymous_name#';
            text.innerText = commentFromApi[API_PARAM_TEXT];

            date.t = new Date(commentFromApi[API_PARAM_CREATED_AT]);
            this.refreshDate(date);

            push(header, author);
            push(header, date);
            push(comment, header);
            push(comment, text);

            const parent = (commentFromApi[API_PARAM_SIDE] === API_SIDE_POSITIVE) ?
                this._positiveColEl :
                this._negativeColEl;

            unshift(parent, comment);
        });
    }

    hideLoaders() {
        $$(CSS_CLASS_COLUMNS_LOADER).forEach(node =>
            node.parentNode.removeChild(node));
    }

    loadComments() {
        ajax(API_METHOD_GET, API_BASE_URL + API_METHOD_GET_COMMENTS, {
            [API_PARAM_COMMENTATOR_ID]: '#lang#api_commentator_id#',
            [API_PARAM_LANG]: '#lang#language#',
        }, json => {
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
            } else {
                this.statusRow.setSide(
                    API_SIDE_POSITIVE,
                    json[API_PARAM_POSITIVE_COMMENTS_TOTAL_COUNT]);

                this.statusRow.setSide(
                    API_SIDE_NEGATIVE,
                    json[API_PARAM_NEGATIVE_COMMENTS_TOTAL_COUNT]);

                this.hideLoaders();

                this.appendComments(
                    json[API_PARAM_POSITIVE_COMMENTS]
                        .concat(json[API_PARAM_NEGATIVE_COMMENTS])
                        .reverse());
            }
        });
    }
}
