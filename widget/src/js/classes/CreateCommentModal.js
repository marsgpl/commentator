const CSS_CLASS_CREATE_COMMENT_MODAL = '.create-comment-modal';
const CSS_CLASS_CREATE_COMMENT_MODAL_FORM = '.create-comment-modal__form';
const CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_TEXT = '.create-comment-modal__input-text';
const CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_SIDE_POSITIVE = '.create-comment-modal__input-side-positive';
const CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_SIDE_NEGATIVE = '.create-comment-modal__input-side-negative';
const CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_NAME = '.create-comment-modal__input-name';
const CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_ANON = '.create-comment-modal__input-anon';
const CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_REMEMBER_NAME = '.create-comment-modal__input-remember-name';

class CreateCommentModal {
    /**
     * @param {Dialog} dialog
     * @param {StatusRow} statusRow
     * @param {Array<Comments>} commentsClasses
     */
    constructor(dialog, statusRow, commentsClasses) {
        /** @type {string} */ this.commentText;
        /** @type {string} */ this.commentSide;
        /** @type {string} */ this.authorName;
        /** @type {number} */ this.minPopupContentHeight;
        /** @type {string} */ this.authorNameFromMemory;
        /** @type {boolean} */ this.isAnonFromMemory;

        this.dialog = dialog;
        this.statusRow = statusRow;
        this.commentsClasses = commentsClasses;

        this.modal = new ModalPopup(
            CSS_CLASS_CREATE_COMMENT_MODAL,
            this.onWindowResize.bind(this),
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

        this.initMemory();

        bind(this._anonEl, 'change', () => {
            this._nameEl.disabled = this._anonEl.checked;
        });
    }

    initMemory() {
        this.authorNameFromMemory = storageRead(STORAGE_KEY_AUTHOR_NAME);
        this.isAnonFromMemory = Boolean(Number(storageRead(STORAGE_KEY_IS_ANON)));

        this.resetForm();
    }

    resetForm() {
        this._sidePositiveEl.checked = false;
        this._sideNegativeEl.checked = false;
        this._anonEl.checked = this.isAnonFromMemory;
        this._textEl.value = '';
        this._nameEl.value = this.authorNameFromMemory || '';
        this._rememberNameEl.checked = (typeof this.authorNameFromMemory === 'string');
        this._nameEl.disabled = this._anonEl.checked;
    }

    onWindowResize() {
        if (window.innerWidth <= 509) { // src/css/create-comment-modal@media.css
            const newValue = window.innerHeight;

            if (this.minPopupContentHeight !== newValue) {
                this.minPopupContentHeight = newValue;
                this.modal.setContentMinHeight(newValue + 'px');
            }
        } else if (this.minPopupContentHeight) {
            this.minPopupContentHeight = 0;
            this.modal.setContentMinHeight('initial');
        }
    }

    toggleMemory(name, isAnon) {
        if (this._rememberNameEl.checked) {
            storageWrite(STORAGE_KEY_AUTHOR_NAME, name);
            storageWrite(STORAGE_KEY_IS_ANON, isAnon ? 1 : 0);
        } else {
            storageDelete(STORAGE_KEY_AUTHOR_NAME);
            storageDelete(STORAGE_KEY_IS_ANON);
        }
    }

    checkFormBeforeSubmit() {
        const text = this._textEl.value.trim();
        const sidePositive = this._sidePositiveEl.checked;
        const sideNegative = this._sideNegativeEl.checked;
        const name = this._nameEl.value.trim();
        const isAnon = this._anonEl.checked;

        this.toggleMemory(name, isAnon);

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
        this.commentSide = sidePositive ? API_COMMENT_SIDE_POSITIVE : API_COMMENT_SIDE_NEGATIVE;
        this.authorName = isAnon ? '' : name;

        return true;
    }

    submitForm(then) {
        ajax(API_METHOD_POST, API_BASE_URL + API_METHOD_CREATE_COMMENT, {
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
                this.resetForm();
                this.modal.hide();
                window.scrollTo(0, 0);
                this.statusRow.incrementSide(this.commentSide);
                this.commentsClasses.forEach(comments => comments.loadComments());
            }

            then();
        });
    }
}
