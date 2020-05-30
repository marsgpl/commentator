const $$ = function(cssSelector, hostNodeCssSelector = document) {
    if (typeof cssSelector === 'string') {
        return $(hostNodeCssSelector).querySelectorAll(cssSelector);
    } else {
        return cssSelector;
    }
}
