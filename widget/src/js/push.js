const push = function(hostNodeCssSelector) {
    const hostNode = $(hostNodeCssSelector);

    for (let i = 1; i < arguments.length; ++i) {
        const child = arguments[i];
        hostNode.appendChild($(child));
    }
};
