const CSS_CLASS_CREATE_COMMENT_MODAL = '.create-comment-modal';
const CSS_CLASS_CREATE_COMMENT_MODAL_FORM = '.create-comment-modal__form';
const CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_TEXT = '.create-comment-modal__input-text';
const CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_SIDE_POSITIVE = '.create-comment-modal__input-side-positive';
const CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_SIDE_NEGATIVE = '.create-comment-modal__input-side-negative';
const CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_NAME = '.create-comment-modal__input-name';
const CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_ANON = '.create-comment-modal__input-anon';

class CreateCommentModal {
    /**
     * @param {Dialog} dialog
     * @param {StatusRow} statusRow
     * @param {Comments} comments
     */
    constructor(dialog, statusRow, comments) {
        /** @type {string} */ this.text;
        /** @type {string} */ this.side;
        /** @type {string} */ this.name;

        this.dialog = dialog;
        this.statusRow = statusRow;
        this.comments = comments;

        this.modal = new ModalPopup(CSS_CLASS_CREATE_COMMENT_MODAL);

        this.form = new Form(
            CSS_CLASS_CREATE_COMMENT_MODAL_FORM,
            this.checkFormBeforeSubmit.bind(this),
            this.submitForm.bind(this),
        );

        this._sidePositiveEl = $(CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_SIDE_POSITIVE);
        this._sideNegativeEl = $(CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_SIDE_NEGATIVE);
        this._anonEl = $(CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_ANON);
        this._textEl = $(CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_TEXT);
        this._nameEl = $(CSS_CLASS_CREATE_COMMENT_MODAL_INPUT_NAME);

        bind(this._anonEl, 'change', () => {
            this._nameEl.disabled = this._anonEl.checked;
        });
    }

    checkFormBeforeSubmit() {
        const text = this._textEl.value.trim();
        const sidePositive = this._sidePositiveEl.checked;
        const sideNegative = this._sideNegativeEl.checked;
        const name = this._nameEl.value.trim();
        const anon = this._anonEl.checked;

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

        this.text = text;
        this.side = sidePositive ? API_SIDE_POSITIVE : API_SIDE_NEGATIVE;
        this.name = anon ? '' : name;

        return true;
    }

    submitForm(then) {
        ajax(API_METHOD_POST, API_BASE_URL + API_METHOD_CREATE_COMMENT, {
            [API_PARAM_COMMENTATOR_ID]: API_COMMENTATOR_ID,
            [API_PARAM_LANG]: API_LANG,
            [API_PARAM_TEXT]: this.text,
            [API_PARAM_SIDE]: this.side,
            [API_PARAM_NAME]: this.name,
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
                this.statusRow.incrementSide(this.side);
                this.comments.loadComments();
            }

            then();
        });
    }

    resetForm() {
        this._sidePositiveEl.checked = false;
        this._sideNegativeEl.checked = false;
        this._anonEl.checked = false;
        this._textEl.value = '';
        this._nameEl.value = '';
    }
}
