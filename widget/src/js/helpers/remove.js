const remove = function(nodesToRemove) {
    if (nodesToRemove.length !== undefined) {
        nodesToRemove.forEach(node =>
            node.parentNode.removeChild(node));
    } else {
        nodesToRemove.parentNode.removeChild(nodesToRemove);
    }
};
