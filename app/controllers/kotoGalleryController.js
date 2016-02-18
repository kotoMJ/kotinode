var fs = require('fs');
var KotoGalleryModel     = require('../models/kotoGalleryModel');
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

// get all the kotinode items (accessed at GET http://url:port/api/gallery/event
exports.getGalleryFixed = function(req,res) {
    var fixedEvents = JSON.parse(fs.readFileSync('app/data/gallery.list.json', 'utf8'));
    // follow date format with ISO-8601
    res.json(fixedEvents)
};

// GET http://url:port/api/kotinode/gallery/?offset=1&limit=1&delay=2000
exports.getGallery = function(req,res) {
    logger.logMem(req,"Start exports.getGallery>>");
    var offset = isNaN(parseInt(req.query.offset))?0:parseInt(req.query.offset);
    var limit = isNaN(parseInt(req.query.limit))?0:parseInt(req.query.limit);
    var delay = isNaN(parseInt(req.query.delay))?0:parseInt(req.query.delay);
    var sortFlag = 1;
    if (req.query.sort ==='DESC') {
        sortFlag = -1;
    }
    setTimeout(function (){

        if (sortFlag>0) {
            KotoGalleryModel.find().
                where('id').gte(offset).limit(limit).sort({id: sortFlag}).exec(function (err, event) {
                    res.json(event);
                });
        }else{
            //TODO FIX DESC offset
            res.json({ message: 'DESC Not implemented yet!' });
        }
        logger.logMem(req,"Finish exports.getGallery>>");
    }, delay);// delay to simulate slow connection!

};
