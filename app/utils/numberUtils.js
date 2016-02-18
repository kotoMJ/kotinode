exports.formatNumberA3  = function(number,separator) {
    //return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    var parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join(".");
}