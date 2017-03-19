var os = require('os');
var numberUtils = require('./numberUtils.js');

plainLog = function (req,msg){
    var rid = req.headers['rid'];
    var stamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    console.log('['+stamp+'|'+rid+'] '+msg);
}

plainErrorLog = function (req,msg){
    var rid = req.headers['rid'];
    var stamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    console.log('[' + stamp + '|' + rid + '] ERROR! ' + msg);
}

exports.log = plainLog;
exports.err = plainErrorLog;

memLog = function (req,msg){
    var rid = req.headers['rid'];
    var freeMem = os.freemem();
    var freeMemPrint = numberUtils.formatNumberA3(freeMem,",");
    var totalMem = os.totalmem();
    var totalMemPrint = numberUtils.formatNumberA3(totalMem,",");

    var percent = parseFloat(((1 - (freeMem / totalMem)) * 100).toFixed(2))
    plainLog(req,msg + 'percent=['+percent+']'+'freeMem=['+freeMemPrint+']' + 'totalMem=['+totalMemPrint+']');
}
exports.logMem = memLog;