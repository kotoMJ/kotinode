var fs = require('fs');
var KotoEventModel = require('../models/kotoEventModel');
var moment = require('moment');
var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
var logger = require('../utils/logger.js');


// ----------------------------------------------------
// CRUD FOR LIST of EVENTS
// http://url:port/api/kotinode/event
// ----------------------------------------------------

// get all the kotinode items (accessed at GET http://url:port/api/kotinode/event
exports.getEventFixed = function (req, res) {
    var fixedEvents = JSON.parse(fs.readFileSync('app/data/event-new.list.json', 'utf8'));
    // follow date format with ISO-8601
    res.jsonWrapped(fixedEvents)
};

// GET http://localhost:8080/api/kotinode/event/?offset=1&limit=1&delay=2000
exports.getEvent = function (req, res) {
    logger.logMem(req, "exports.getEvent")
    // var offset = isNaN(parseInt(req.query.offset))?0:parseInt(req.query.offset);
    // var limit = isNaN(parseInt(req.query.limit))?0:parseInt(req.query.limit);
    var delay = isNaN(parseInt(req.query.delay)) ? 0 : parseInt(req.query.delay);

    setTimeout(function () {
        // Currently the sorting is given by sortId order (kotoAdminController.sortEvent()).
        // KotoEventModel.find().
        //     where('sortId').gte(offset).limit(limit).sort({sortId: 1}).exec(function (err, event) {
        //         res.json(event);
        //     });
        KotoEventModel.find().exec(function (err, event) {
            res.jsonWrapped(event);
        });
    }, delay);// delay to simulate slow connection!

};

// create kotievent accessed at POST http://url:port/api/kotinode/event
exports.setEvent = function (req, res) {
    logger.log(req, "exports.setEvent");
    logger.log(req, JSON.stringify(req.body))
    var payload = JSON.parse(JSON.stringify(req.body))
    payload.date = moment(payload.date, "YYYY-MM-DDTHH:mm:ss.sssZ").toDate();
    var kotoevent = new KotoEventModel(payload);

    // save the bear and check for errors
    kotoevent.save(function (err) {
        if (err)
            res.send(err)
        else
            res.json({message: 'KotoEvent created!'});
    });
};

// delete all kotinode (accessed at DELETE http://url:port/api/kotinode/event)
exports.deleteEvent = function (req, res) {
    KotoEventModel.remove({}, function (err, bear) {
        if (err)
            res.send(err);
        else
            res.json({message: 'All KotoEvents deleted'});
    });
};


// ----------------------------------------------------
// CRUD for ONE EVENT
// http://url:port/api/kotinode/event/:batch_id
// ----------------------------------------------------

exports.putEvenet = function (req, res) {

    // KotoEventModel.findById(req.params.batch_id, function (err, kotoEventBatch) {
    //
    //     logger.log(req, 'found:'+kotoEventBatch);
    // });
    var apiKey = req.headers['apikey'];
    if (apiKey === undefined) {
        res.status(401).json({"message": "Missing or incomplete authentication parameters"})
    } else if (kotiConfig.api_key === apiKey) {
        var payload = JSON.parse(JSON.stringify(req.body));
        payload.date = moment(payload.date, "YYYY-MM-DDTHH:mm:ss.sssZ").toDate();
        KotoEventModel.update({_id: req.params.batch_id}, {$push: {eventList: payload}}, {upsert: false}, function (err, raw) {
            if (err) {
                logger.log(req, 'Error!');
                res.json({message: err});
            } else {
                logger.log(req, 'Noerror!');
                res.status(302).json({message: raw});
            }
        });
    } else {
        res.status(403).json({"message": "Missing permissions!"})
    }

};

// exports.deleteEvent = function(req,res){
//     KotoEventModel.remove({
//         _id: req.params.kotoevent_id
//     }, function(err, bear) {
//         if (err)
//             res.send(err);
//
//         res.json({ message: 'KotoEventBatch deleted' });
//     });
// };
