class CreateCommentModal {
    /**
     * @param {Dialog} dialog
     * @param {StatusRow} statusRow
     */
    constructor(dialog, statusRow) {
        /** @type {string} */ this.commentText;
        /** @type {string} */ this.commentSide;
        /** @type {string} */ this.authorName;
        /** @type {string} */ this.authorNameFromMemory;
        /** @type {boolean} */ this.isAnonFromMemory;
        /** @type {Array<Comments>} */ this.commentsColumns;

        this.dialog = dialog;
        this.statusRow = statusRow;

        this.modal = new ModalPopup(
            CSS_CLASS_CREATE_COMMENT_MODAL,
            this.initMemory.bind(this),
        );

        this.form = new Form(
            CSS_CLASS_CREATE_COMMENT_MODAL_FORM,
            this.checkFormBeforeSubmit.bind(this),
            this.submitForm.bind(this),
        );

        this._sidePositiveEl = $(CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_SIDE_POSITIVE);
        this._sideNegativeEl = $(CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_SIDE_NEGATIVE);
        this._anonEl = $(CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_ANON);
        this._rememberNameEl = $(CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_REMEMBER_NAME);
        this._textEl = $(CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_TEXT);
        this._nameEl = $(CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_NAME);

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
        this._sidePositiveEl.checked = false;
        this._sideNegativeEl.checked = false;

        this.initMemory();
    }

    checkFormBeforeSubmit() {
        const text = this._textEl.value.trim();
        const sidePositive = this._sidePositiveEl.checked;
        const sideNegative = this._sideNegativeEl.checked;
        const name = this._nameEl.value.trim();
        const isAnon = this._anonEl.checked;

        this.toggleMemory();

        if (text.length < 2) {
            this.dialog.showModal(
                '#lang#create_comment_error_empty_text_title#',
                '#lang#create_comment_error_empty_text_message#',
                '#lang#create_comment_error_empty_text_button#'
            );

            return false;
        }

        if (!sidePositive && !sideNegative) {
            this.dialog.showModal(
                '#lang#create_comment_error_no_side_title#',
                '#lang#create_comment_error_no_side_message#',
                '#lang#create_comment_error_no_side_button#'
            );

            return false;
        }

        this.commentText = text;
        this.commentSide = sidePositive ?
            API_VALUE_COMMENT_SIDE_POSITIVE :
            API_VALUE_COMMENT_SIDE_NEGATIVE;
        this.authorName = isAnon ? '' : name;

        return true;
    }

    submitForm(then) {
        ajax(API_HTTP_METHOD_POST, API_BASE_URL + API_METHOD_CREATE_COMMENT, {
            [API_PARAM_COMMENTATOR_ID]: API_COMMENTATOR_ID,
            [API_PARAM_LANG]: API_LANG,
            [API_PARAM_TEXT]: this.commentText,
            [API_PARAM_SIDE]: this.commentSide,
            [API_PARAM_NAME]: this.authorName,
            [API_PARAM_APP_USER_TOKEN]: APP_USER_TOKEN,
        }, json => {
            if (apiRequestFailed(json)) {
                const error = apiExtractError(json);

                this.dialog.showModal(
                    '#lang#create_comment_error_failed_title#',
                    `#lang#create_comment_error_failed_message#<br><br>${error}`,
                    '#lang#create_comment_error_failed_button#'
                );
            } else {
                this.modal.hide();
                this.resetForm();
                window.scrollTo(0, 0);
                this.statusRow.incrementSide(this.commentSide);
                this.commentsColumns.forEach(comments => comments.loadComments());
            }

            then();
        });
    }
}
