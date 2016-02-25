exports.strEndsWith = function strEndsWith(str, suffix) {
    return str.match(suffix+"$")==suffix;
}

exports.strStartsWith = function strStartsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
}