class ReplyToCommentModal {
    /**
     * @param {Dialog} dialog
     */
    constructor(dialog) {
        /** @type {string} */ this.replyText;
        /** @type {string} */ this.authorName;
        /** @type {string} */ this.authorNameFromMemory;
        /** @type {boolean} */ this.isAnonFromMemory;
        /** @type {Array<Comments>} */ this.commentsColumns;
        /** @type {!Element} */ this.targetComment;

        this.dialog = dialog;

        this.modal = new ModalPopup(
            CSS_CLASS_REPLY_TO_COMMENT_MODAL,
            this.initMemory.bind(this),
        );

        this.form = new Form(
            CSS_CLASS_REPLY_TO_COMMENT_MODAL_FORM,
            this.checkFormBeforeSubmit.bind(this),
            this.submitForm.bind(this),
        );

        this._anonEl = $(CSS_CLASS_REPLY_TO_COMMENT_MODAL_INPUT_ANON);
        this._rememberNameEl = $(CSS_CLASS_REPLY_TO_COMMENT_MODAL_INPUT_REMEMBER_NAME);
        this._textEl = $(CSS_CLASS_REPLY_TO_COMMENT_MODAL_INPUT_TEXT);
        this._nameEl = $(CSS_CLASS_REPLY_TO_COMMENT_MODAL_INPUT_NAME);

        this.toggleMemory = this.toggleMemory.bind(this);

        bind(this._anonEl, 'change', this.toggleMemory);
        bind(this._nameEl, 'change', this.toggleMemory);
        bind(this._rememberNameEl, 'change', this.toggleMemory);
    }

    toggleMemory() {
        if (this._rememberNameEl.checked) {
            const name = this._nameEl.value.trim();
            const isAnon = this._anonEl.checked;

            storageWrite(STORAGE_KEY_AUTHOR_NAME, name);
            storageWrite(STORAGE_KEY_IS_ANON, isAnon ? 1 : 0);

            this.initMemory();
        } else {
            storageDelete(STORAGE_KEY_AUTHOR_NAME);
            storageDelete(STORAGE_KEY_IS_ANON);
        }
    }

    initMemory() {
        this.authorNameFromMemory = storageRead(STORAGE_KEY_AUTHOR_NAME);
        this.isAnonFromMemory = Boolean(Number(storageRead(STORAGE_KEY_IS_ANON)));

        this._anonEl.checked = this.isAnonFromMemory;
        this._nameEl.value = this.authorNameFromMemory || '';
        this._nameEl.disabled = this._anonEl.checked;
        this._rememberNameEl.checked = (typeof this.authorNameFromMemory === 'string');
    }

    resetForm() {
        this._textEl.value = '';

        this.initMemory();
    }

    setTargetComment(comment) {
        this.targetComment = comment;

        const targetCommentTextRefNode = $(CSS_CLASS_REPLY_TO_COMMENT_MODAL_ORIGINAL_COMMENT_TEXT);
        const titleNode = $(CSS_CLASS_REPLY_TO_COMMENT_MODAL_TITLE);

        const commentText = $(CSS_CLASS_COMMENT_TEXT, comment).innerText;
        const commentAuthorName = $(CSS_CLASS_COMMENT_AUTHOR, comment).innerText;

        targetCommentTextRefNode.innerText = commentText;
        titleNode.innerText = commentAuthorName;
    }

    checkFormBeforeSubmit() {
        const text = this._textEl.value.trim();
        const name = this._nameEl.value.trim();
        const isAnon = this._anonEl.checked;

        this.toggleMemory();

        if (text.length < 2) {
            this.dialog.showModal(
                '#lang#comment_reply_error_empty_text_title#',
                '#lang#comment_reply_error_empty_text_message#',
                '#lang#comment_reply_error_empty_text_button#'
            );

            return false;
        }

        this.replyText = text;
        this.authorName = isAnon ? '' : name;

        return true;
    }

    submitForm(then) {
        ajax(API_HTTP_METHOD_POST, API_BASE_URL + API_METHOD_REPLY_TO_COMMENT, {
            [API_PARAM_COMMENTATOR_ID]: API_COMMENTATOR_ID,
            [API_PARAM_LANG]: API_LANG,
            [API_PARAM_TEXT]: this.replyText,
            [API_PARAM_NAME]: this.authorName,
            [API_PARAM_APP_USER_TOKEN]: APP_USER_TOKEN,
            [API_PARAM_COMMENT_ID]: this.targetComment[HTML_NODE_FIELD_COMMENT_ID],
        }, json => {
            if (apiRequestFailed(json)) {
                const error = apiExtractError(json);

                this.dialog.showModal(
                    '#lang#comment_reply_error_failed_title#',
                    `#lang#comment_reply_error_failed_message#<br><br>${error}`,
                    '#lang#comment_reply_error_failed_button#'
                );
            } else {
                this.resetForm();
                this.modal.hide();
                this.commentsColumns.forEach(comments => comments.updateVisibleComments());
            }

            then();
        });
    }
}
