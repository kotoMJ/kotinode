var fs = require('fs');
var KotoEventModel = require('../models/kotoEventModel');
var moment = require('moment');
var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
var logger = require('../utils/logger.js');
var DESC_SORT_ORDER = -1
var ASC_SORT_ORDER = 1

function verifyToken(req, res) {
    var apiKey = req.headers['apikey'];
    if (apiKey === undefined) {
        res.status(401).json({"message": "Missing or incomplete authentication parameters"})
        return false
    } else if (kotiConfig.api_key !== apiKey) {
        res.status(403).json({"message": "Missing permissions!"})
        return false
    } else
        return true

}

// get all the kotinode items (accessed at GET http://url:port/api/kotinode/event
exports.getEventFixed = function (req, res) {
    var fixedEvents = JSON.parse(fs.readFileSync('app/data/event.list.json', 'utf8'));
    // follow date format with ISO-8601
    res.jsonWrapped(fixedEvents)
};

// GET http://localhost:8080/api/kotinode/event/?offset=1&limit=1&delay=2000
exports.getEventList = function (req, res) {
    logger.logMem(req, "exports.getEventList")
    // var offset = isNaN(parseInt(req.query.offset))?0:parseInt(req.query.offset);
    // var limit = isNaN(parseInt(req.query.limit))?0:parseInt(req.query.limit);
    var delay = isNaN(parseInt(req.query.delay)) ? 0 : parseInt(req.query.delay);

    setTimeout(function () {
        // Currently the sorting is given by sortId order (kotoAdminController.sortEvent()).
        // KotoEventModel.find().
        //     where('sortId').gte(offset).limit(limit).sort({sortId: 1}).exec(function (err, event) {
        //         res.json(event);
        //     });
        KotoEventModel.find().sort({date: DESC_SORT_ORDER}).exec(function (err, event) {
            res.jsonWrapped(event);
        });
    }, delay);// delay to simulate slow connection!

};

exports.getBundleList = function (req, res) {
    logger.logMem(req, "exports.getBundleList")
    var delay = isNaN(parseInt(req.query.delay)) ? 0 : parseInt(req.query.delay);

    setTimeout(function () {
        KotoEventModel.find().sort({date: DESC_SORT_ORDER}).exec(function (err, bundle) {
            if (err) {
                res.status(500).send(err)
            } else {
                for (var i in bundle) {
                    bundle[i].eventList = null; // delete not work on mongoose objects, it requires some workaround.
                }
                res.jsonWrapped(bundle);
            }
        });
    }, delay);// delay to simulate slow connection!

};
exports.createEventBundle = function (req, res) {
    logger.log(req, "exports.setEvent");
    if (verifyToken(req, res)) {
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
    }
};


exports.deleteEventBundle = function (req, res) {
    if (verifyToken(req, res)) {
        KotoEventModel.remove({
            _id: req.params.bundle_id
        }, function (err, bear) {
            if (err)
                res.status(500).send(err);

            res.json({message: 'KotoEventBundle deleted'});
        });
    }
};


exports.cleanupEventBundleAll = function (req, res) {
    if (verifyToken(req, res)) {
        KotoEventModel.remove({}, function (err, bear) {
            if (err)
                res.status(500).send(err);
            else
                res.json({message: 'All KotoEvents deleted'});
        });
    }
};

exports.addEventToBundle = function (req, res) {

    // KotoEventModel.findById(req.params.bundle_id, function (err, kotoEventBundle) {
    //
    //     logger.log(req, 'found:'+kotoEventBundle);
    // });
    if (verifyToken(req, res)) {
        var payload = req.body//JSON.parse(JSON.stringify(req.body));
        payload.date = moment(payload.date, "YYYY-MM-DDTHH:mm:ss.sssZ").toDate();
        KotoEventModel.update({_id: req.params.bundle_id}, {$push: {eventList: payload}}, {upsert: false}, function (err, raw) {
            if (err) {
                logger.log(req, 'Error!');
                res.status(500).json({message: err});
            } else {
                logger.log(req, 'Noerror!');
                res.status(200).json({message: raw});
            }
        });
    }

};

exports.deleteEventFromBundle = function (req, res) {

    if (verifyToken(req, res)) {
        if (req.params.bundle_id === undefined) res.status(302).json({message: 'Missing bundle_id parameter'});
        if (req.params.event_id === undefined) res.status(302).json({message: 'Missing event_id parameter'});
        KotoEventModel.update({_id: req.params.bundle_id}, {$pull: {'eventList': {_id: req.params.event_id}}}, {upsert: false}, function (err, raw) {
            if (err) {
                logger.log(req, 'Error!');
                res.status(500).json({message: err});
            } else {
                logger.log(req, 'Noerror!');
                res.status(200).json({message: raw});
            }
        });
    }
};
