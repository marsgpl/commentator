const CSS_CLASS_MODAL_POPUP = '.modal-popup';
const CSS_CLASS_MODAL_POPUP_SHOWN = '.modal-popup_shown';
const CSS_CLASS_MODAL_POPUP_HIDDEN = '.modal-popup_hidden';
const CSS_CLASS_MODAL_POPUP_CONTENT = '.modal-popup__content';
const CSS_CLASS_MODAL_POPUP_CLOSE = '.modal-popup__close';
const CSS_CLASS_MODAL_POPUP_TITLE = '.modal-popup__title';
const CSS_CLASS_MODAL_POPUP_BODY = '.modal-popup__body';
const CSS_CLASS_MODAL_POPUP_BUTTONS = '.modal-popup__buttons';

class ModalPopup {
    constructor(cssSelector) {
        /** @type {number} */ this.x;
        /** @type {number} */ this.y;
        /** @type {Object} */ this._titleEl;
        /** @type {Object} */ this._bodyEl;
        /** @type {Object} */ this._buttonsEl;

        this._el = $(cssSelector);

        this.hide = this.hide.bind(this);
        this.hideByKey = this.hideByKey.bind(this);

        bind($(CSS_CLASS_MODAL_POPUP_CLOSE, this._el), 'click', this.hide);
        bind(this._el, 'click', this.hideByParanjaClick.bind(this));
        bind(this._el, 'mousedown touchstart', this.rememberClickCoordinates.bind(this));
    }

    rememberClickCoordinates(event) {
        this.x = x(event);
        this.y = y(event);
    }

    show() {
        this._el.style.zIndex = ModalPopup.nextZ++;
        show(this._el);

        this._el.classList.remove(CSS_CLASS_MODAL_POPUP_HIDDEN.substr(1));
        this._el.classList.add(CSS_CLASS_MODAL_POPUP_SHOWN.substr(1));

        bind(window, 'keydown', this.hideByKey);
    }

    hide() {
        setTimeout(() => hide(this._el), 300);

        this._el.classList.remove(CSS_CLASS_MODAL_POPUP_SHOWN.substr(1));
        this._el.classList.add(CSS_CLASS_MODAL_POPUP_HIDDEN.substr(1));

        unbind(window, 'keydown', this.hideByKey);
    }

    hideByParanjaClick(event) {
        const target = event && event.target;

        if (
            target &&
            target.classList.contains(CSS_CLASS_MODAL_POPUP.substr(1)) &&
            Math.abs(this.x - x(event)) < 50 &&
            Math.abs(this.y - y(event)) < 50
        ) {
            this.hide();
        }
    }

    hideByKey(event) {
        if (event && event.keyCode === KEY_CODE_ESC) {
            this.hide();
        }
    }

    getTitleEl() {
        if (!this._titleEl) {
            this._titleEl = $(CSS_CLASS_MODAL_POPUP_TITLE, this._el);
        }

        return this._titleEl;
    }

    getBodyEl() {
        if (!this._bodyEl) {
            this._bodyEl = $(CSS_CLASS_MODAL_POPUP_BODY, this._el);
        }

        return this._bodyEl;
    }

    getButtonsEl() {
        if (!this._buttonsEl) {
            this._buttonsEl = $(CSS_CLASS_MODAL_POPUP_BUTTONS, this._el);
        }

        return this._buttonsEl;
    }

    setTitle(newTextValue) {
        this.getTitleEl().innerText = newTextValue;
    }

    setBody(newHtmlValue) {
        this.getBodyEl().innerHTML = newHtmlValue;
    }

    hideBody() {
        hide(this.getBodyEl());
    }

    showBody() {
        show(this.getBodyEl());
    }

    hideButtons() {
        hide(this.getButtonsEl());
    }

    showButtons() {
        show(this.getButtonsEl());
    }
}

ModalPopup.nextZ = 9001;
