const y = function(event) {
    const touch = event.touches && event.touches[0];
    return touch ? touch.clientY : event.clientY;
};
