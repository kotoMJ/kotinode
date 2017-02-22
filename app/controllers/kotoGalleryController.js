var fs = require('fs');
var KotoGalleryItemModel     = require('../models/kotoGalleryItemModel');
var KotoGallerySummaryModel     = require('../models/kotoGallerySummaryModel');
var logger = require('../utils/logger.js');


// ----------------------------------------------------
// CRUD FOR LIST of EVENTS
// http://url:port/api/kotinode/event
// ----------------------------------------------------

// get all the kotinode items (accessed at GET http://url:port/api/gallery/event
exports.getGalleryFixed = function(req,res) {
    logger.logMem(req, "getGallery GALLERY FIXED");
    var fixedEvents = JSON.parse(fs.readFileSync('app/data/gallery.list.json', 'utf8'));
    // follow date format with ISO-8601
    res.json(fixedEvents)
};

// GET http://url:port/api/kotinode/gallery/?offset=1&limit=1&delay=2000
exports.getGallery = function(req,res) {
    logger.logMem(req, "getGallery GALLERY NAME");
    var offset = isNaN(parseInt(req.query.offset))?0:parseInt(req.query.offset);
    var limit = isNaN(parseInt(req.query.limit))?0:parseInt(req.query.limit);
    var delay = isNaN(parseInt(req.query.delay))?0:parseInt(req.query.delay);
    var debug = (req.query.debug)?JSON.parse(req.query.debug): false;
    logger.log(req,debug+''+req.query.debug);
    var sortFlag = 1;
    if (req.query.sort ==='DESC') {
        sortFlag = -1;
    }
    setTimeout(function (){

        if (sortFlag>0) {
            KotoGalleryItemModel.find().
                where('galleryName').equals(req.params.galleryName).
                where('id').gte(offset).limit(limit).sort({id: sortFlag}).exec(function (err, event) {
                    if (debug) {logger.log(req, "response="+event);}
                    res.json(event);
                });
        }else{
            //TODO FIX DESC offset
            res.json({ message: 'DESC Not implemented yet!' });
        }
        logger.logMem(req,"Finish exports.getGallery>>");
    }, delay);// delay to simulate slow connection!
};

exports.getGallerySummary = function(req,res) {
    logger.logMem(req,"Start exports.getGallerySummary>>");
    var offset = isNaN(parseInt(req.query.offset))?0:parseInt(req.query.offset);
    var limit = isNaN(parseInt(req.query.limit))?0:parseInt(req.query.limit);
    var delay = isNaN(parseInt(req.query.delay))?0:parseInt(req.query.delay);
    var debug = (req.query.debug)?JSON.parse(req.query.debug): false;
    logger.log(req,debug+''+req.query.debug);

    setTimeout(function (){
        // Currently the sorting is given by sortId order (kotoAdminController.sortGallerySummary()).
        KotoGallerySummaryModel.find().
            where('sortId').gte(offset).limit(limit).sort({sortId: 1}).exec(function (err, event) {
                if (debug) {logger.log(req, "response="+event);}
                res.json(event);
            });

        logger.logMem(req,"Finish exports.getGallerySummary>>");
    }, delay);// delay to simulate slow connection!
};
