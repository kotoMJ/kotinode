exports.log = function(req,msg){
    var rid = req.headers['rid'];
    console.log('['+rid+'] '+msg);
}