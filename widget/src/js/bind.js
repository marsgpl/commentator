const bind = function(cssSelector, eventNames, callback) {
    eventNames.split(' ').forEach((eventName) => {
        $(cssSelector).addEventListener(eventName, callback);
    });
};
