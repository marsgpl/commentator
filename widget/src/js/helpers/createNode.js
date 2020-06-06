const createNode = function(tagName, classNames) {
    const node = document.createElement(tagName);

    if (classNames) {
        if (typeof classNames === 'string') {
            node.className = createNode.normalizeCssClassName(classNames);
        } else { // hope it's array
            node.className = classNames
                .map(createNode.normalizeCssClassName)
                .join(' ');
        }
    }

    return node;
};

createNode.normalizeCssClassName = function(className) {
    return className.replace(/^\./, '');
};
