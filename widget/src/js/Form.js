class Form {
    constructor(cssSelector) {
        this.cssSelector = $(cssSelector);

        bind(this.cssSelector, 'submit', this.onSubmit.bind(this));
    }

    onSubmit(event) {
        event.preventDefault();
    }
}
