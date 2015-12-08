// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var fs = require('fs');
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var KotoInventory = require('./app/models/kotoinventory')
var config = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
var kotipointController = require('./app/controllers/kotoevent');
var kotoinventoryController = require('./app/controllers/kotoinventory');
var demoTransparentAccount = require('./app/controllers/demoaccounts')

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/public', express.static(__dirname + "/public"));

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

// middleware to use for all requests
api_router.use(function(req, res, next) {
    // do logging
    console.log('Access API KoTi request ');
    next(); // make sure we go to the next routes and don't stop here
});


// ===== ROUTE to WEB ========

// test route to make sure everything is working (accessed at GET http://url:port/)
web_router.get('/', function(req, res) {
    fs.readFile(__dirname + '/public/welcome/index.html', 'utf8', function(err, text){
        res.send(text);
    });
});

// test route to make sure everything is working (accessed at GET http://url:port/)
web_router.get('/project', function(req, res) {
    fs.readFile(__dirname + '/public/project/index.html', 'utf8', function(err, text){
        res.send(text);
    });
});


// ===== ROUTE to SERVER API ========

api_router.route('/kotinode/account')

    .get(demoTransparentAccount.getAccounts)

api_router.route('/kotinode/transaction')

    .get(demoTransparentAccount.getTransactions)

// ----------------------------------------------------
api_router.route('/kotinode/inventory')

    .post(kotoinventoryController.postInventory)
    .get(kotoinventoryController.getInventory);

// ----------------------------------------------------
// more routes for our API will happen here
// ----------------------------------------------------
api_router.route('/kotinode/event')
    .post(kotipointController.postEvents)
    .get(kotipointController.getEvents)
    .delete(kotipointController.deleteEvents);

api_router.route('/kotinode/event/fixed')
    .get(kotipointController.getEventsFixed);


api_router.route('/kotinode/event/admin')
    .get(kotipointController.refill);

// on routes that end in /kotinode/:kotoevent_id
// ----------------------------------------------------
api_router.route('/kotinode/event/:kotoevent_id')
    .get(kotipointController.getEvent)
    .put(kotipointController.putEvenet)
    .delete(kotipointController.deleteEvent);

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', web_router);
app.use('/api', api_router);


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Kotinode at disposal on port ' + port);