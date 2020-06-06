function x(event) {
    const touch = event.touches && event.touches[0];
    return touch ? touch.clientX : event.clientX;
}
