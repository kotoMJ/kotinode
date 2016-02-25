var fs = require('fs');
var path = require('path');
var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
var mongoose   = require('mongoose');
var KotoEvent     = require('../models/kotoEventModel');
var KotoGalleryItem = require('../models/kotoGalleryItemModel')
var KotoGallerySummary = require('../models/kotoGallerySummaryModel')
var logger = require('../utils/logger.js');
var fileUtils = require('../utils/fileUtils.js');

exports.reset_gallery_real = function(req,res){
    var apiKey = req.headers['apikey'];
    var rid = req.headers['rid'];

    logger.log(req,"expected key:"+kotiConfig.api_key+", obtained key:"+apiKey+", match:"+(kotiConfig.api_key===apiKey));
    if (kotiConfig.api_key===apiKey) {
        KotoGallerySummary.remove({},function(err, result) {
            KotoGalleryItem.remove({}, function (err, result) {
                if (err == null) {
                    logger.log(req, 'Event model cleaned! Ready to re-insert model...');
                    var gSummary = 0;
                    fileUtils.walkDirs('public/gallery', function (dirPath, stat) {
                        logger.log(req, "filePath:" + dirPath + ", stat:" + stat);
                        var currentDir = path.basename(dirPath);
                        var digestPhotoUrl = null;
                        var gItem = 0;
                        fileUtils.walkFiles('public/gallery/' + currentDir, function (filePath, stat) {

                            var photoUrl = req.headers['host'] + "/" + filePath;
                            mongoose.model('KotoGalleryItem', KotoGalleryItem).collection.insert({
                                "id": gItem++,
                                "galleryName": currentDir,
                                "galleryDate": null,
                                "url": photoUrl
                            }, onInsertItem);

                            function onInsertItem(err, docs) {
                                if (err) {
                                    logger.err(req,err);
                                } else {
                                    var photo = docs.ops[0];
                                    logger.log(req, photo.galleryName+"id="+photo.id);
                                    if ((digestPhotoUrl == null)||(photo.id == '0')){
                                        logger.log(req,"digestPhoto:"+JSON.stringify(photo));
                                        digestPhotoUrl = docs;
                                    }
                                    logger.log(req,docs)
                                }
                            };
                        });

                        mongoose.model('KotoGallerySummary', KotoGallerySummary).collection.insert({
                            "id": gSummary++,
                            "galleryName": currentDir,
                            "galleryTitle" : "TODO set Title via property file",//https://www.npmjs.com/package/properties-reader, https://github.com/steveukx/properties
                            "galleryDescription" : "TODO set Description via property file",//https://www.npmjs.com/package/properties-reader, https://github.com/steveukx/properties
                            "galleryDate" : null,
                            "galleryUrl" : req.headers['host'] + "/" + currentDir,
                            "digestPhotoUrl" : digestPhotoUrl
                        }, onInsertSummary);

                        function onInsertSummary(err, docs) {
                            if (err) {
                                logger.err(req,err);
                            } else {
                                logger.log(req,docs)
                            }
                        };

                    });
                    logger.log(req, 'Event model re-insert done!' + err);
                } else {
                    logger.log(req, 'Event model clean failed!' + err);
                }

                res.json({message: 'Insert real done'});
            });
        });
    }else{
        res.json({message: 'admin'});
    }
}

exports.drop = function(req,res){
    var apiKey = req.headers['apikey'];
    var rid = req.headers['rid'];
    logger.log(req,"expected key:"+kotiConfig.api_key+", obtained key:"+apiKey+", match:"+(kotiConfig.api_key===apiKey));
    if (kotiConfig.api_key===apiKey) {

        //EVENT
        logger.log(req,"Ready to drop DB...")
        mongoose.connection.db.dropDatabase(function(err, result) {
            if (err == null){
                logger.log(req,'DB dropped!');
            }else{
                logger.log(req,'DB drop failed!'+err);
            }

            res.json({message: 'DB dropped and EVENT reinitialized'});
        });

    }else{
        res.json({message: 'admin'});
    }
}

exports.reset_event = function(req,res){
    var apiKey = req.headers['apikey'];
    var rid = req.headers['rid'];
    logger.log(req,"expected key:"+kotiConfig.api_key+", obtained key:"+apiKey+", match:"+(kotiConfig.api_key===apiKey));
    if (kotiConfig.api_key===apiKey) {

        //EVENT
        //var KotoEventList = mongoose.model('KotoEvent', KotoEvent);
        var fixedEvents = JSON.parse(fs.readFileSync('app/data/event.list.json', 'utf8'));
        logger.log(req,"Ready to drop DB...")
        KotoEvent.remove({},function(err, result) {
            if (err == null){
                logger.log(req,'Event model cleaned!');
            }else{
                logger.log(req,'Event model clean failed!'+err);
            }
            logger.log(req,"Ready to re-insert model...");
            mongoose.model('KotoEvent', KotoEvent).collection.insert(fixedEvents, function (err, r) {
            });


            /**
             * DUMMY data for DEVELOPMENT
             */

            for (i=9; i<101; i++) {
                mongoose.model('KotoEvent', KotoEvent).collection.insert({
                    "id": i,
                    "headline": Math.random().toString(36).substring(7),
                    "label": null,
                    "eventDate": "2015-10-11T00:00:00.000Z",
                    "eventLocation": [
                        Math.random().toString(36).substring(7)
                    ],
                    "textCapital": null,
                    "text": Math.random().toString(36).substring(7),
                    "imageResource": null
                }, onInsert);
            }

            function onInsert(err, docs){
                if(err){
                    console.error(err);
                }else{
                    console.log(docs)
                }
            };

            res.json({message: 'Event model reinitialized successfully.'});
        });


    }else{
        res.json({message: 'admin'});
    }
}

exports.reset_gallery_mock = function(req,res){
    var apiKey = req.headers['apikey'];
    var rid = req.headers['rid'];
    logger.log(req,"expected key:"+kotiConfig.api_key+", obtained key:"+apiKey+", match:"+(kotiConfig.api_key===apiKey));
    if (kotiConfig.api_key===apiKey) {

        //GALLERY
        //var KotoGalleryList = mongoose.model('KotoGalleryItem', KotoGalleryItem);
        logger.log(req,"Ready to drop DB...")
        //empty object will match all items to remove
        KotoGalleryItem.remove({},function(err, result) {
            if (err == null){
                logger.log(req,'Gallery model cleaned!');
            }else{
                logger.log(req,'Gallery model clean failed!'+err);
            }
            logger.log(req,"Ready to re-insert model...");

            /**
             * DUMMY data for DEVELOPMENT
             */

            for (i=0; i<101; i++) {
                mongoose.model('KotoGalleryItem', KotoGalleryItem).collection.insert({
                    "id": i,
                    "url": "http://"+Math.random().toString(36).substring(7)
                }, onInsert);
            }

            function onInsert(err, docs){
                if(err){
                    console.error(err);
                }else{
                    console.log(docs)
                }
            };

            res.json({message: 'Gallery model reinitialized successfully.'});

        });


    }else{
        res.json({message: 'admin'});
    }
}



//----------------------------------------------------
//  DEFAULT response
//----------------------------------------------------

exports.empty = function(req,res){
    logger.log(req,'Not implemented!');
    res.json({message: 'empty'});
}
