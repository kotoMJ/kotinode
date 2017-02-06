var fs = require('fs');
var path = require('path');
var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
var mongoose   = require('mongoose');
var KotoEventModel     = require('../models/kotoEventModel');
var KotoGalleryItemModel = require('../models/kotoGalleryItemModel')
var KotoGallerySummaryModel = require('../models/kotoGallerySummaryModel')
var PropertiesReader = require('properties-reader')
var logger = require('../utils/logger.js');
var fileUtils = require('../utils/fileUtils.js');
var stringUtils = require('../utils/stringUtils.js');
var moment = require('moment');

exports.reset_gallery = function(req,res){
    var apiKey = req.headers['apikey'];
    var rid = req.headers['rid'];
    var resolutionType = req.headers['resolutionType'];
    if(typeof variable === 'undefined'){resolutionType = 'low'}
    var galleryPath = 'public/gallery/'+resolutionType+'/'

    logger.log(req,"expected key:"+kotiConfig.api_key+", obtained key:"+apiKey+", match:"+(kotiConfig.api_key===apiKey));
    if (kotiConfig.api_key===apiKey) {
        KotoGallerySummaryModel.remove({},function(err, result) {
            KotoGalleryItemModel.remove({}, function (err, result) {
                if (err == null) {
                    logger.log(req, 'Event model cleaned! Ready to re-insert model...');
                    var gSummary = 0;
                    fileUtils.walkDirs(galleryPath, function (dirPath, stat) {
                        var currentDir = path.basename(dirPath);
                        var gItem = 0;
                        //https://www.npmjs.com/package/properties-reader
                        var galleryProperties = PropertiesReader(galleryPath+currentDir+'/description.properties');
                        var galleryTitle = galleryProperties.get('title');
                        var galleryDescription = galleryProperties.get('description');
                        var galleryDate = moment(galleryProperties.get('date'), "DD.MM.YYYY:ssZ").toDate();
                        fileUtils.walkFiles(galleryPath + currentDir, function (filePath, stat) {
                            var photoUrl = req.headers['host'] + "/" + filePath;

                            if (stringUtils.strEndsWith(photoUrl, "webp")) {
                                logger.log(req,"Inserting url:"+photoUrl);
                                mongoose.model('KotoGalleryItem', KotoGalleryItemModel).collection.insert({
                                    "id": gItem++,
                                    "galleryName": currentDir,
                                    "galleryDate": galleryDate,
                                    "url": photoUrl
                                }, onInsertItem);
                            } else if (!stringUtils.strEndsWith(photoUrl, "properties")){
                                logger.err(req, "Gallery "+currentDir+" contains unsupported files: "+photoUrl);
                            }

                        });

                        function onInsertItem(err, docs) {
                            if (err) {
                                logger.err(req,err);
                            } else {
                                var photo = docs.ops[0];
                                if (photo.id == '0'){
                                    //For every first photoItem in gallery insert summary record of this gallery.
                                    mongoose.model('KotoGallerySummary', KotoGallerySummaryModel).collection.insert({
                                        "sortId": gSummary++,
                                        "galleryName": currentDir,
                                        "galleryTitle" : galleryTitle,
                                        "galleryDescription" : galleryDescription,
                                        "galleryDate" : galleryDate,
                                        "galleryUrl" : req.headers['host'] + "/" + currentDir,
                                        "digestPhotoUrl" : photo.url
                                    }, onInsertSummary);
                                }
                            }
                        };

                        function onInsertSummary(err, docs) {
                            if (err) {
                                logger.err(req,err);
                            } else {
                                //logger.log(req,"onInsertSummary:"+JSON.stringify(docs));
                            }
                        };

                    });
                    logger.log(req, 'Gallery model re-insert done!');

                } else {
                    logger.log(req, 'Gallery model clean failed! '+err);
                }

                res.json({message: 'Insert real done'});
            });
        });
    }else{
        res.json({message: 'admin'});
    }
}

exports.sortGallerySummary = function(req,res){

    KotoGallerySummaryModel.find()
        .sort({galleryDate: -1}).exec(function (err, eventList) {
            var i=0;
            eventList.forEach(function(record){
                console.log("ToUpdate:"+record);
                mongoose.model('KotoGallerySummary', KotoGallerySummaryModel).collection.findAndModify(
                   {sortId:record.sortId},//query
                   [['galleryDate','asc']],//sort order
                   {$set: {sortId:i++}},//replacement, replaces only the field "id"
                   {new:true},//options
                   onUpdateSummary);
            });
        });

    function onUpdateSummary(err, object) {
        if (err) {
            logger.err(req,err.message);
        } else {
            console.log("Updated:"+JSON.stringify(object));
            //console.dir(object);
            //logger.log(req,"onUpdateSummary:"+JSON.stringify(object));
        }
    };

    res.json({message: 'sort done!'});
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
        var fixedEvents = JSON.parse(fs.readFileSync('app/data/event-new.list.json', 'utf8'));
        logger.log(req,"Ready to drop DB...")
        KotoEventModel.remove({},function(err, result) {
            if (err == null){
                logger.log(req,'Event model cleaned!');
            }else{
                logger.log(req,'Event model clean failed!'+err);
            }
            logger.log(req,"Ready to re-insert model...");


            /**
             * Read data from local json file.
             */
            mongoose.model('KotoEventBatch', KotoEventModel).collection.insert(fixedEvents, function (err, r) {
            });


            /**
             * Generate additional dummy data for development purpose.
             */
            var dummyCount = isNaN(parseInt(req.query.dummyCount))?0:parseInt(req.query.dummyCount);
            if (dummyCount >0) {

            var startIndex = 0;
                KotoEventModel.find()
                    .sort({eventDate: -1}).exec(function (err, eventList) {
                         if (eventList){
                             startIndex = eventList.length;
                         }
                    });

                for (i = startIndex; i < (startIndex+dummyCount); i++) {
                    mongoose.model('KotoEventBatch', KotoEventModel).collection.insert({
                        "headline": Math.random().toString(36).substring(7),
                        "label": null,
                        "eventDate": "2015-01-01T00:00:00.000Z",
                        "eventLocation": [
                            Math.random().toString(36).substring(7)
                        ],
                        "textCapital": null,
                        "text": Math.random().toString(36).substring(7),
                        "imageResource": null
                    }, onInsert);
                }
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

exports.sortEvent = function(req,res){

    KotoEventModel.find()
        .sort({eventDate: -1}).exec(function (err, eventList) {
            var index=0;
            eventList.forEach(function(record){
                console.log("ToUpdate:"+record);
                mongoose.model('KotoEventBatch', KotoEventModel).collection.findAndModify(
                    {sortId:record.sortId},//query
                    [['eventDate','asc']],//sort order
                    {$set: {sortId:index++}},//replacement, replaces only the field "id"
                    {new:true},//options
                    onUpdateEvent);
            });
        });

    function onUpdateEvent(err, object) {
        if (err) {
            logger.err(req,err.message);
        } else {
            console.log("Updated:"+JSON.stringify(object));
            //console.dir(object);
            //logger.log(req,"onUpdateSummary:"+JSON.stringify(object));
        }
    };

    res.json({message: 'sort done!'});
}
