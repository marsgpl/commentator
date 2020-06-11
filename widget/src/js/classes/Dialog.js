class Dialog {
    constructor() {
        this.modal = new ModalPopup(CSS_CLASS_DIALOG);
    }

    /**
     * @param {string} title
     * @param {string} message
     * @param {string} okButtonLabel
     */
    showModal(title, message, okButtonLabel = '', okButtonOnClick = null) {
        this.modal.setTitle(title);

        if (message) {
            this.modal.showBody();
            this.modal.setBody(message);
        } else {
            this.modal.hideBody();
        }

        if (okButtonLabel) {
            this.modal.showButtons();
            this.setButtons([
                {
                    labelText: okButtonLabel,
                    onClick: okButtonOnClick,
                },
            ]);
        } else {
            this.modal.hideButtons();
        }

        this.modal.show();
    }

    /**
     * @param {Array<{labelText:string}>} buttons
     */
    setButtons(buttons) {
        const buttonsEl = this.modal.getButtonsEl();

        buttonsEl.innerHTML = '';

        buttons.forEach(buttonConf => {
            const button = createNode('button', [
                CSS_CLASS_BUTTON,
                CSS_CLASS_BUTTON_SIZE_BIG,
            ]);

            button.innerText = buttonConf.labelText;

            bind(button, 'click', () => {
                if (buttonConf.onClick) {
                    buttonConf.onClick();
                }

                this.modal.hide();
            });

            push(buttonsEl, button);
        });
    }
}
