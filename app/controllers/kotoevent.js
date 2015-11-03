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
        // follow date format with ISO-8601
        res.json([{headline: "Headline "+tagEnv+" 01 from API",releaseDate:new Date(2015,01,01).toJSON(),mChildItemList:[{eventDate:new Date(2015,01,21).toJSON(),text: "Detail "+tagEnv+" 1 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 02 from API",releaseDate:new Date(2015,02,01).toJSON(),mChildItemList:[{eventDate:new Date(2015,02,21).toJSON(),text: "Detail "+tagEnv+" 2 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 03 from API",releaseDate:new Date(2015,03,01).toJSON(),mChildItemList:[{eventDate:new Date(2015,03,21).toJSON(),text: "Detail "+tagEnv+" 3 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 04 from API",releaseDate:new Date(2015,04,01).toJSON(),mChildItemList:[{eventDate:null,text: "Detail "+tagEnv+" 4 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 05 from API",releaseDate:new Date(2015,05,01).toJSON(),mChildItemList:[{eventDate:new Date(2015,05,21).toJSON(),text: "Detail "+tagEnv+" 5 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 06 from API",releaseDate:new Date(2015,06,01).toJSON(),mChildItemList:[{eventDate:new Date(2015,06,21).toJSON(),text: "Detail "+tagEnv+" 6 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 07 from API",releaseDate:new Date(2015,07,01).toJSON(),mChildItemList:[{eventDate:new Date(2015,07,21).toJSON(),text: "Detail "+tagEnv+" 7 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 08 from API",releaseDate:new Date(2015,11,01).toJSON(),mChildItemList:[{eventDate:new Date(2015,11,01).toJSON(),text: "Detail "+tagEnv+" 8 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 09 from API",releaseDate:new Date(2015,11,01).toJSON(),mChildItemList:[{eventDate:new Date(2015,11,08).toJSON(),text: "Detail "+tagEnv+" 9 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 10 from API",releaseDate:new Date(2015,11,01).toJSON(),mChildItemList:[{eventDate:new Date(2015,11,09).toJSON(),text: "Detail "+tagEnv+" 10 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 11 from API",releaseDate:new Date(2015,11,01).toJSON(),mChildItemList:[{eventDate:null,text: "Detail "+tagEnv+" 11 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 12 from API",releaseDate:new Date(2015,11,01).toJSON(),mChildItemList:[{eventDate:new Date(2015,11,23).toJSON(),text: "Detail "+tagEnv+" 12 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 13 from API",releaseDate:new Date(2015,11,01).toJSON(),mChildItemList:[{eventDate:null,text: "Detail "+tagEnv+" 13 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 14 from API",releaseDate:new Date(2015,11,01).toJSON(),mChildItemList:[{eventDate:null,text: "Detail "+tagEnv+" 14 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 15 from API",releaseDate:new Date(2015,11,01).toJSON(),mChildItemList:[{eventDate:new Date(2015,12,24).toJSON(),text: "Detail "+tagEnv+" 15 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 16 from API",releaseDate:new Date(2015,11,01).toJSON(),mChildItemList:[{eventDate:new Date(2015,12,25).toJSON(),text: "Detail "+tagEnv+" 16 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 17 from API",releaseDate:new Date(2015,11,01).toJSON(),mChildItemList:[{eventDate:new Date(2015,12,26).toJSON(),text: "Detail "+tagEnv+" 17 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 18 from API",releaseDate:new Date(2015,11,01).toJSON(),mChildItemList:[{eventDate:new Date(2015,12,31).toJSON(),text: "Detail "+tagEnv+" 18 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 19 from API",releaseDate:new Date(2015,11,01).toJSON(),mChildItemList:[{eventDate:new Date(2016,01,01).toJSON(),text: "Detail "+tagEnv+" 19 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]},
                  {headline: "Headline "+tagEnv+" 20 from API",releaseDate:new Date(2015,11,01).toJSON(),mChildItemList:[{eventDate:new Date(2016,01,02).toJSON(),text: "Detail "+tagEnv+" 20 from API",imageResource:"https://developers.google.com/admob/images/smartfill.png"}]}
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