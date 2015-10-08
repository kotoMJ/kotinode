// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var KotoEvent     = require('./app/models/kotoevent');
var moment      = require('moment');
var config = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'prod' ? 'production' : 'development');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = config.port;

mongoose.connect(config.mongo);

// ROUTES FOR OUR API
// =============================================================================
var api_router = express.Router();              // get an instance of the express Router
var web_router = express.Router();

web_router.use(function (req, res, next) {
   console.log('Access WEB KoTi request');
    next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/)
web_router.get('/', function(req, res) {
    res.send("<html><body>Access WEB KoTi request</body></html>");
});

// middleware to use for all requests
api_router.use(function(req, res, next) {
    // do logging
    console.log('Access API KoTi request.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
api_router.get('/', function(req, res) {
    res.json({ message: 'Welcome to Koto API!' });
});

// more routes for our API will happen here
// ----------------------------------------------------
api_router.route('/kotinode')

    // create a bear (accessed at POST http://localhost:8080/api/kotinode)
    .post(function(req, res) {
        console.log("/kotinode post");
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

    })

    // get all the kotinode (accessed at GET http://localhost:8080/api/kotinode)
    .get(function(req, res) {
        KotoEvent.find(function(err, kotinode) {
            if (err)
                res.send(err);

            res.json(kotinode);
        });
    })

    // delete all kotinode (accessed at DELETE http://localhost:8080/api/kotinode/)
    .delete(function(req, res) {
        KotoEvent.remove({}, function(err, bear) {
            if (err)
                res.send(err);

            res.json({ message: 'All KotoEvents deleted' });
        });
    });


// on routes that end in /kotinode/:kotoevent_id
// ----------------------------------------------------
api_router.route('/kotinode/:kotoevent_id')

    // get the bear with that id (accessed at GET http://localhost:8080/api/kotinode/:kotoevent_id)
    .get(function(req, res) {
        KotoEvent.findById(req.params.kotoevent_id, function(err, bear) {
            if (err)
                res.send(err);
            res.json(bear);
        });
    })

    // update the bear with this id (accessed at PUT http://localhost:8080/api/kotinode/:kotoevent_id)
    .put(function(req, res) {

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
    })

    // delete the bear with this id (accessed at DELETE http://localhost:8080/api/kotinode/:kotoevent_id)
    .delete(function(req, res) {
        KotoEvent.remove({
            _id: req.params.kotoevent_id
        }, function(err, bear) {
            if (err)
                res.send(err);

            res.json({ message: 'KotoEvent deleted' });
        });
    });


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', web_router);
app.use('/api', api_router);


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Kotinode at disposal on port ' + port);