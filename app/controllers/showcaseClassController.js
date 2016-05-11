var fs = require('fs');
var logger = require('../utils/logger.js');


//----------------------------------------------------
//  DEFAULT response
//----------------------------------------------------

exports.empty = function(req,res){
    logger.log(req,'Not implemented!');
    res.json({message: 'empty'});
}

// ----------------------------------------------------
// CRUD FOR LIST of EVENTS
// http://url:port/api/kotinode/event
// ----------------------------------------------------

// get all the kotinode items (accessed at GET http://url:port/api/kotinode/event
exports.getShowcaseClassFixed = function(req,res) {
    var fixedEvents = JSON.parse(fs.readFileSync('app/data/dbshowcase.class.json', 'utf8'));
    // follow date format with ISO-8601
    res.json(fixedEvents)
};
