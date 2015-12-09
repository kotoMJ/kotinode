var fs = require('fs');
var KotoEvent     = require('../models/kotoevent');
var moment      = require('moment');
var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
var tagEnv = kotiConfig.tagEnv;
var mongoose   = require('mongoose');
// ----------------------------------------------------
// CRUD FOR LIST of EVENTS
// http://url:port/api/kotinode/event
// ----------------------------------------------------

// create kotievent accessed at POST http://url:port/api/kotinode/event
exports.postEvents = function(req, res) {
    console.log("/kotinode/event/ event post");
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

// get all the kotinode items (accessed at GET http://url:port/api/kotinode/event
exports.getEventsFixed = function(req,res) {
        var fixedEvents = JSON.parse(fs.readFileSync('app/data/event.list.json', 'utf8'));
        // follow date format with ISO-8601
        res.json(fixedEvents)
};

//// get all the kotinode items (accessed at GET http://url:port/api/kotinode/event
exports.getEvents = function(req,res) {
    var offset= parseInt(req.query.offset);
    var limit = parseInt(req.query.limit);
    KotoEvent.find().
        where('id').gt(offset).limit(limit).exec(function (err,event){
        res.json(event);
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

exports.refill = function(req,res){
    var apiKey = req.headers['api_key'];
    if (kotiConfig.api_key===apiKey) {
        var KotoEventList = mongoose.model('KotoEvent', KotoEvent);
        var fixedEvents = JSON.parse(fs.readFileSync('app/data/event.list.json', 'utf8'));

        mongoose.connection.db.dropDatabase(function(err, result) {
                console.log(result);
                if (err == null){
                    console.log('DB dropped!');
                }else{
                    console.log('DB drop failed!'+err);
                }

            var KotoEventCollection = mongoose.model('KotoEvent', KotoEvent).collection;
            //console.log(KotoEventCollection);
            mongoose.model('KotoEvent', KotoEvent).collection.insert(fixedEvents, function (err, r) {

            });
            res.json({message: 'refilled'});
        });
        //mongoose.connection.db.dropCollection('KotoEvent', function(err, result) {
        //    console.log(result);
        //    if (err == null){
        //        console.log('KotoEventCollection cleaned up!');
        //    }else{
        //        console.log('KotoEventCollection clean FAILED:'+err);
        //    }
        //});
    }else{
        res.json({message: 'admin'});
    }
}


exports.empty = function(req,res){
    console.log('request {} not implemented',req.code);
    res.json({message: 'empty'});
}