var fs = require('fs');
var moment      = require('moment');
var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
var tagEnv = kotiConfig.tagEnv;
var mongoose   = require('mongoose');
var KotoEvent     = require('../models/kotoevent');
var logger = require('../utils/logger.js');


exports.reset = function(req,res){
    var apiKey = req.headers['api_key'];
    var rid = req.headers['rid'];
    if (kotiConfig.api_key===apiKey) {
        var KotoEventList = mongoose.model('KotoEvent', KotoEvent);
        var fixedEvents = JSON.parse(fs.readFileSync('app/data/event.list.json', 'utf8'));

        mongoose.connection.db.dropDatabase(function(err, result) {
            if (err == null){
                logger.log(req,'DB dropped!');
            }else{
                logger.log(req,'DB drop failed!'+err);
            }

            mongoose.model('KotoEvent', KotoEvent).collection.insert(fixedEvents, function (err, r) {

            });
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
