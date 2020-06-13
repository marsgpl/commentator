const icaseLang = function(number, line0, line1, line2) {
    const icaseValue = icase(number);

    return (
        icaseValue === 0 ? line0 :
        icaseValue === 1 ? line1 :
        line2
    ).replace('%n', number);
};
