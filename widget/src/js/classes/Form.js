class Form {
    constructor(cssSelector, checkFormBeforeSubmit, submitForm) {
        this.submitting = false;

        this._el = $(cssSelector);
        this.checkFormBeforeSubmit = checkFormBeforeSubmit;
        this.submitForm = submitForm;
        this.stopSubmitting = this.stopSubmitting.bind(this);

        bind(this._el, 'submit', this.onSubmit.bind(this));
    }

    onSubmit(event) {
        event.preventDefault();

        if (this.submitting) return;

        const canSubmit = this.checkFormBeforeSubmit ?
            this.checkFormBeforeSubmit() :
            true;

        if (!canSubmit) return;

        this.startSubmitting();

        if (this.submitForm) {
            this.submitForm(this.stopSubmitting);
        }
    }

    startSubmitting() {
        this._el.classList.add(CSS_CLASS_FORM_STATE_BUSY.substr(1));
        this.submitting = true;
    }

    stopSubmitting() {
        this._el.classList.remove(CSS_CLASS_FORM_STATE_BUSY.substr(1));
        this.submitting = false;
    }
}
