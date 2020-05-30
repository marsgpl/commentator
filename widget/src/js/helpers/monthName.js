const MONTHS = [
    '#lang#month_jan#',
    '#lang#month_feb#',
    '#lang#month_mar#',
    '#lang#month_apr#',
    '#lang#month_may#',
    '#lang#month_jun#',
    '#lang#month_jul#',
    '#lang#month_aug#',
    '#lang#month_sep#',
    '#lang#month_oct#',
    '#lang#month_nov#',
    '#lang#month_dec#',
];

const monthName = function(monthIndexFrom0) {
    return MONTHS[monthIndexFrom0] || '';
}
