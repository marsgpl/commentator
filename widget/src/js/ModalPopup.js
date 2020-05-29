class ModalPopup {
    constructor(cssSelector) {
        this.x = 0;
        this.y = 0;

        this.cssSelector = $(cssSelector);

        this.hideByKey = this.hideByKey.bind(this);

        bind($(CSS_CLASS_MODAL_POPUP_CLOSE, this.cssSelector), 'click', this.hide.bind(this));
        bind(this.cssSelector, 'click', this.hideByParanjaClick.bind(this));
        bind(this.cssSelector, 'mousedown touchstart', this.rememberClickCoordinates.bind(this));
    }

    rememberClickCoordinates(event) {
        this.x = x(event);
        this.y = y(event);
    }

    show() {
        show(this.cssSelector);

        this.cssSelector.classList.remove(CSS_CLASS_MODAL_POPUP_HIDDEN.substr(1));
        this.cssSelector.classList.add(CSS_CLASS_MODAL_POPUP_SHOWN.substr(1));

        bind(window, 'keydown', this.hideByKey);
    }

    hide() {
        setTimeout(() => hide(this.cssSelector), 300);

        this.cssSelector.classList.remove(CSS_CLASS_MODAL_POPUP_SHOWN.substr(1));
        this.cssSelector.classList.add(CSS_CLASS_MODAL_POPUP_HIDDEN.substr(1));

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
}
