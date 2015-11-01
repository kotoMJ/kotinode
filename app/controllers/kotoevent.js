var KotoEvent     = require('../models/kotoevent');
var moment      = require('moment');
var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
var tagEnv = kotiConfig.tagEnv;
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
exports.getEvents = function(req,res) {
        //TODO temporary fixed response for Android tunning
        res.json([{headline: "Headline "+tagEnv+" 1 from API",mChildItemList:[{text: "Detail "+tagEnv+" 1 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 2 from API",mChildItemList:[{text: "Detail "+tagEnv+" 2 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 3 from API",mChildItemList:[{text: "Detail "+tagEnv+" 3 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 4 from API",mChildItemList:[{text: "Detail "+tagEnv+" 4 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 5 from API",mChildItemList:[{text: "Detail "+tagEnv+" 5 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 6 from API",mChildItemList:[{text: "Detail "+tagEnv+" 6 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 7 from API",mChildItemList:[{text: "Detail "+tagEnv+" 7 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 8 from API",mChildItemList:[{text: "Detail "+tagEnv+" 8 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 9 from API",mChildItemList:[{text: "Detail "+tagEnv+" 9 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 10 from API",mChildItemList:[{text: "Detail "+tagEnv+" 10 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 11 from API",mChildItemList:[{text: "Detail "+tagEnv+" 11 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 12 from API",mChildItemList:[{text: "Detail "+tagEnv+" 12 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 13 from API",mChildItemList:[{text: "Detail "+tagEnv+" 13 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 14 from API",mChildItemList:[{text: "Detail "+tagEnv+" 14 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 15 from API",mChildItemList:[{text: "Detail "+tagEnv+" 15 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 16 from API",mChildItemList:[{text: "Detail "+tagEnv+" 16 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 17 from API",mChildItemList:[{text: "Detail "+tagEnv+" 17 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 18 from API",mChildItemList:[{text: "Detail "+tagEnv+" 18 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 19 from API",mChildItemList:[{text: "Detail "+tagEnv+" 19 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 20 from API",mChildItemList:[{text: "Detail "+tagEnv+" 20 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]}
                ])
};
//// get all the kotinode items (accessed at GET http://url:port/api/kotinode/event
//exports.getEvents = function(req,res) {
//    KotoEvent.find(function(err, kotinode) {
//        if (err)
//            res.send(err);
//
//        res.json(kotinode);
//    });
//};

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

exports.getEvent = function(req,res){
    KotoEvent.findById(req.params.kotoevent_id, function(err, bear) {
        if (err)
            res.send(err);
        res.json(bear);
    });
};

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