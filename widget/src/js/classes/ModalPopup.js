class ModalPopup {
    constructor(cssSelector, onShowModal = null) {
        /** @type {number} */ this.x;
        /** @type {number} */ this.y;
        /** @type {Object} */ this._titleEl;
        /** @type {Object} */ this._bodyEl;
        /** @type {Object} */ this._buttonsEl;
        /** @type {number} */ this.myZ;
        /** @type {number} */ this.minContentHeight;
        /** @type {Function} */ this.onWindowResize;

        this.onShowModal = onShowModal;

        this.shown = false;
        this._el = $(cssSelector);
        this._contentEl = $(CSS_CLASS_MODAL_POPUP_CONTENT, this._el);

        this.hide = this.hide.bind(this);
        this.hideByKey = this.hideByKey.bind(this);

        bind($(CSS_CLASS_MODAL_POPUP_CLOSE, this._el), 'click', this.hide);
        bind(this._el, 'click', this.hideByParanjaClick.bind(this));
        bind(this._el, 'mousedown touchstart', this.rememberClickCoordinates.bind(this));

        if (this._el.classList.contains(CSS_CLASS_MODAL_POPUP_WITH_FORM.substr(1))) {
            this.onWindowResize = this.onWindowResizeForModalWithForm;
        }
    }

    rememberClickCoordinates(event) {
        this.x = x(event);
        this.y = y(event);
    }

    show() {
        if (this.shown) return;
        this.shown = true;

        ModalPopup.shownRightNowChange(+1);

        this.myZ = ++ModalPopup.lastZ;
        this._el.style.zIndex = this.myZ;

        show(this._el);

        this._el.classList.remove(CSS_CLASS_MODAL_POPUP_HIDDEN.substr(1));
        this._el.classList.add(CSS_CLASS_MODAL_POPUP_SHOWN.substr(1));

        bind(window, 'keydown', this.hideByKey);

        if (this.onWindowResize) {
            bind(window, 'resize', this.onWindowResize);
            this.onWindowResize();
        }

        this.onShowModal && this.onShowModal();
    }

    hide() {
        if (!this.shown) return;
        this.shown = false;

        ModalPopup.shownRightNowChange(-1);

        setTimeout(() => hide(this._el), 200);

        this._el.classList.remove(CSS_CLASS_MODAL_POPUP_SHOWN.substr(1));
        this._el.classList.add(CSS_CLASS_MODAL_POPUP_HIDDEN.substr(1));

        unbind(window, 'keydown', this.hideByKey);

        if (this.onWindowResize) {
            unbind(window, 'resize', this.onWindowResize);
        }

        if (this.myZ === ModalPopup.lastZ) {
            ModalPopup.lastZ--;
        }
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
        if (event && event.keyCode === KEY_CODE_ESC && this.myZ === ModalPopup.lastZ) {
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

    onWindowResizeForModalWithForm() {
        if (window.innerWidth <= 509) { // modal-popup@media.css
            const newValue = window.innerHeight;

            if (this.minContentHeight !== newValue) {
                this.minContentHeight = newValue;
                this.setContentMinHeight(newValue + 'px');
            }
        } else if (this.minContentHeight) {
            this.minContentHeight = 0;
            this.setContentMinHeight('initial');
        }
    }

    setContentMinHeight(newValue) {
        this._contentEl.style.minHeight = newValue;
    }
}

ModalPopup.lastZ = 9000;
ModalPopup.shownRightNow = 0;

ModalPopup.shownRightNowChange = function(delta) {
    const oldValue = ModalPopup.shownRightNow;
    const newValue = oldValue + delta;

    ModalPopup.shownRightNow = newValue;

    if (oldValue === 0 && newValue === 1) { // shown
        $('html').classList.add(CSS_CLASS_WINDOW_HAS_MODALS_SHOWN.substr(1));
    } else if (oldValue === 1 && newValue === 0) { // hidden
        $('html').classList.remove(CSS_CLASS_WINDOW_HAS_MODALS_SHOWN.substr(1));
    }
};
