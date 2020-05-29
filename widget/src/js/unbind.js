const unbind = function(cssSelector, eventNames, callback) {
    eventNames.split(' ').forEach((eventName) => {
        $(cssSelector).removeEventListener(eventName, callback);
    });
};
