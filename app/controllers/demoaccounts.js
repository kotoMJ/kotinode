var fs = require('fs');
var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
var tagEnv = kotiConfig.tagEnv;
// ----------------------------------------------------
// CRUD FOR LIST of EVENTS
// http://url:port/api/kotinode/event
// ----------------------------------------------------

// get all the kotinode items (accessed at GET http://url:port/api/kotinode/account
exports.getAccounts = function(req,res) {
    var demoAccounts = JSON.parse(fs.readFileSync('app/data/account.list.json', 'utf8'));
    // follow date format with ISO-8601
    res.json(demoAccounts)
};
