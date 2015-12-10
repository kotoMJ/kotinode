var fs = require('fs');
var KotoEvent     = require('../models/kotoevent');
var moment      = require('moment');
var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
var tagEnv = kotiConfig.tagEnv;
var mongoose   = require('mongoose');
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
exports.getEventsFixed = function(req,res) {
    var fixedEvents = JSON.parse(fs.readFileSync('app/data/event.list.json', 'utf8'));
    // follow date format with ISO-8601
    res.json(fixedEvents)
};

// GET http://localhost:8080/api/kotinode/event/?offset=1&limit=1
exports.getEvents = function(req,res) {
    var offset = isNaN(parseInt(req.query.offset))?0:parseInt(req.query.offset);
    var limit = isNaN(parseInt(req.query.limit))?0:parseInt(req.query.limit);
    KotoEvent.find().
        where('id').gt(offset).limit(limit).exec(function (err,event){
            res.json(event);
        });
};

// create kotievent accessed at POST http://url:port/api/kotinode/event
exports.postEvents = function(req, res) {
    var rid = req.headers['rid'];
    logger.log(req,"/kotinode/event/ event post");
    var kotoevent = new KotoEvent();      // create a new instance of the KotoEvent model
    kotoevent.name = req.body.name;  // set the kotinode name (comes from the request)
    kotoevent.date = moment(req.body.date, "DD.MM.YYYY:ssZ").toDate();
    kotoevent.note = req.body.note;
    kotoevent.description = req.body.descriptioncc;


    // save the bear and check for errors
    kotoevent.save(function(err) {
        if (err)
            res.send(err);

        res.json({ message: 'KotoEvent created!' });
    });
};

// delete all kotinode (accessed at DELETE http://url:port/api/kotinode/event)
exports.deleteEvents = function(req, res) {
    KotoEvent.remove({}, function(err, bear) {
        if (err)
            res.send(err);

        res.json({ message: 'All KotoEvents deleted' });
    });
};

exports.refill = function(req,res){
    var apiKey = req.headers['api_key'];
    if (kotiConfig.api_key===apiKey) {
        var KotoEventList = mongoose.model('KotoEvent', KotoEvent);
        var fixedEvents = JSON.parse(fs.readFileSync('app/data/event.list.json', 'utf8'));

        res.json({message: 'Disabled!'})
        //mongoose.connection.db.dropCollection('KotoEvent', function(err, result) {
        //    logger.log(req,result);
        //    if (err == null){
        //        logger.log(req,'KotoEventCollection cleaned up!');
        //    }else{
        //        logger.log(req,'KotoEventCollection clean FAILED:'+err);
        //    }
        //});
    }else{
        res.json({message: 'admin'});
    }
}

// ----------------------------------------------------
// CRUD for ONE EVENT
// http://url:port/api/kotinode/event/:kotoevent_id
// ----------------------------------------------------

exports.putEvenet = function(req,res){
    // use our bear model to find the bear we want
    KotoEvent.findById(req.params.kotoevent_id, function(err, kotoevent) {

        if (err)
            res.send(err);

        kotoevent.name = req.body.name;  // update the kotinode info
        kotoevent.date = req.body.date;
        kotoevent.note = req.body.note;
        kotoevent.description = req.body.description;

        // save the bear
        kotoevent.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'KotoEvent updated!' });
        });

    });
};

exports.deleteEvent = function(req,res){
    KotoEvent.remove({
        _id: req.params.kotoevent_id
    }, function(err, bear) {
        if (err)
            res.send(err);

        res.json({ message: 'KotoEvent deleted' });
    });
};
