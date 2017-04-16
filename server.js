// call the packages we need
const express = require('express');        // call express
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
const logger = require('./app/utils/logger.js');
const webRouter = require('./router/webRouter');
const apiRouter = require('./router/apiRouter');
const gqlRouter = require('./router/gqlRouter');
const app = express();
// and support socket io
const server = require('http').createServer(app);
koTio = require('socket.io')(server);


var graphqlExpress = require('graphql-server-express').graphqlExpress;
var makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const schema = require('./app/graphql/schema').schema;
const resolvers = require('./app/graphql/resolvers').resolvers;

const executableSchema = makeExecutableSchema({
    typeDefs: schema,
    resolvers: resolvers
});
/*
 * Mongoose by default sets the auto_reconnect option to true.
 * We recommend setting socket options at both the server and replica set level.
 * We recommend a 30 second connection timeout because it allows for
 * plenty of time in most operating environments.
 */
var mongoOptions = {
    user: config.mongoUser,
    pass: config.mongoPass,
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};
var dbCon = mongoose.connect(config.mongoUri, mongoOptions);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + config.mongo);
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

mongoose.connection.once('open', function () {
    // Wait for the database connection to establish, then start the app.


    express.response.jsonWrapped = function (obj) {
        return this.json({ result: obj });
    };

// REGISTER OUR ROUTES -------------------------------
    // configure app to use bodyParser()
    // this will let us get the data from a POST
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    //serve all public content as public (//http://localhost:8080/public/gallery/low/2013-05-28-Otmice/00_otmice.webp)
    app.use('/public', express.static(__dirname + "/public"));

    app.use('/', express.static('public/kotipoint-web'));

    app.use('/api', apiRouter.getApiRouter());

    app.use('/graphql', bodyParser.json(), gqlRouter.graphqlExpress)

    app.use('/graphiql', gqlRouter.graphiqlExpress);

    app.use('/', webRouter.getWebRouter());
    app.use((req, res) => {
        res.status(404).send('PAGE DOES NOT EXISTS')
    });


// START THE SERVER
// =============================================================================
    var port = config.port;
    app.listen(port);
    console.log('Kotinode at disposal on port ' + port);
});

