const unshift = function(nodeToInsert, parentNode) {
    $(parentNode).insertBefore(nodeToInsert, parentNode.firstChild);
};
