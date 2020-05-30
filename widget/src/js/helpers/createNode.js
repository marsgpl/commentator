const createNode = function(tagName, className) {
    const node = document.createElement(tagName);

    if (className) {
        node.className = className;
    }

    return node;
};
