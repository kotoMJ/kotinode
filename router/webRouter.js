var express = require('express');
var path = require('path');
var fs = require('fs');

var logger = require('../app/utils/logger.js');

exports.getWebRouter = function () {

    var web_router = express.Router();

    web_router.use(function (req, res, next) {
        logger.log(req, 'Access WEB KoTi request');
        next();
    });

    // ===== ROUTE to WEB ========

    const allowedPaths = [
        '/contact',
        '/photo'
    ];

    web_router.get('*', (req, res, next) => {
        const isAllowed = allowedPaths.includes(req.originalUrl)
        if (!isAllowed) {
            return next()
        }

        res.status(200).sendFile(path.join(__dirname, '../public/kotipoint-web/index.html'))
    });

    web_router.get('*', express.static('public/kotipoint-web'))

    // web_router.get('/', function (req, res) {
    //     fs.readFile(__dirname + '/public/welcome/index.html', 'utf8', function (err, text) {
    //         res.send(text);
    //     });
    // });

    web_router.get('/kbforest', function (req, res) {
        fs.readFile(__dirname + '/public/kbforest/index.html', 'utf8', function (err, text) {
            res.send(text);
        });
    });

    web_router.get('/kbsmart', function (req, res) {
        fs.readFile(__dirname + '/public/kbsmart/index.html', 'utf8', function (err, text) {
            res.send(text);
        });
    });

    web_router.get('/project', function (req, res) {
        fs.readFile(__dirname + '/public/project/index.html', 'utf8', function (err, text) {
            res.send(text);
        });
    });

    return web_router;
}