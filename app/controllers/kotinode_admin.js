var fs = require('fs');
var moment      = require('moment');
var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
var tagEnv = kotiConfig.tagEnv;
var mongoose   = require('mongoose');
var KotoEvent     = require('../models/kotoevent');
var logger = require('../utils/logger.js');


exports.reset = function(req,res){
    var apiKey = req.headers['apikey'];
    var rid = req.headers['rid'];
    logger.log(req,"expected key:"+kotiConfig.api_key+", obtained key:"+apiKey+", match:"+(kotiConfig.api_key===apiKey))
    if (kotiConfig.api_key===apiKey) {
        var KotoEventList = mongoose.model('KotoEvent', KotoEvent);
        var fixedEvents = JSON.parse(fs.readFileSync('app/data/event.list.json', 'utf8'));
        logger.log(req,"Ready to drop DB...")
        mongoose.connection.db.dropDatabase(function(err, result) {
            if (err == null){
                logger.log(req,'DB dropped!');
            }else{
                logger.log(req,'DB drop failed!'+err);
            }
            logger.log(req,"Ready to insert model...");
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





            res.json({message: 'DB dropped and reinitialized'});
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
