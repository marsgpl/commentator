const $ = function(cssSelector, hostNodeCssSelector = document) {
    if (typeof cssSelector === 'string') {
        return $(hostNodeCssSelector).querySelector(cssSelector);
    } else {
        return cssSelector;
    }
};
