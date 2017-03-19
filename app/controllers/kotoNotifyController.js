var fs = require('fs');
var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
var nconf = require('nconf');
var logger = require('../utils/logger.js');
var apiKeyUtils = require('../utils/apiKeyUtils')
var nodemailer = require('nodemailer');
var request = require('request');
var crypto = require('crypto');

/**
 * https://docs.rosti.cz/emails/
 * https://nodemailer.com/about/
 * https://nodemailer.com/smtp/
 * http://wiki.rosti.cz/e-maily
 * http://blog.rosti.cz/novy-smtp-server/
 * @param req
 * @param res
 */
exports.notifyEmail = function (req, res) {
    if (apiKeyUtils.verifyToken(req, res)) {
        logger.log(req, "exports.notifyEmail");
        nconf.file('email', './app/config/config.notify.json');
        if (nconf.get('email') === undefined) {
            res.status(500).json({ "message": "Email config is missing on the server!" })
        } else {

            var transporter = nodemailer.createTransport({
                host: nconf.get('email').rosti.smtp.host,
                port: nconf.get('email').rosti.smtp.port,
                requireTLS: true,
                auth: {
                    user: nconf.get('email').rosti.smtp.user,
                    pass: nconf.get('email').rosti.smtp.pass
                },
                debug: process.env.NODE_ENV == 'dev',
            });

            var payload = req.body
            if (payload.to !== undefined
                && payload.subject !== undefined
                && (payload.text !== undefined /*|| payload.html!==undefined*/)) {
                var mailOptions = {
                    from: nconf.get('email').rosti.smtp.sender, // sender address
                    to: payload.to, // list of receivers
                    subject: payload.subject, // Subject line
                    text: payload.text //, // plaintext body
                    //html: '<b>Yo dude! ✔</b>' // You can choose to send an HTML body instead
                };


                // verify connection configuration
                transporter.verify(function (error, success) {
                    if (error) {
                        logger.log(req, error);
                        res.status(500).json({ "message": 'Email server is not ready to send email now.' });
                    } else {
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                                res.status(500).json({ "message": 'Unexpected error when sending email' });
                            } else {
                                console.log('Message sent: ' + info.response);
                                res.status(200).json({ "message": info.response });
                            }
                            ;
                        });
                    }
                });
            } else {
                res.status(401).json({ "message": "Missing or incomplete message parameters in body!" })
            }
        }
    }
};

/**
 * http://smsmanager.cz/api/http/
 * http://smsmanager.cz/api/codes/#errors
 * http://www.smsmanager.cz/rozesilani-sms/lowcost
 * https://www.smsmanager.cz/rozesilani-sms/ceny/
 * @param req
 * @param res
 */
exports.notifySms = function (req, res) {
    if (apiKeyUtils.verifyToken(req, res)) {
        logger.log(req, "exports.notifySms");
        nconf.file('sms', './app/config/config.notify.json');
        if (nconf.get('sms') === undefined) {
            res.status(500).json({ "message": "Email config is missing on the server!" })
        } else {
            var sendUrl = nconf.get('sms').smsmanager.apiSend;
            var username = nconf.get('sms').smsmanager.username;
            var hashBase = nconf.get('sms').smsmanager.hashFix;

            var payload = req.body
            if (payload.number !== undefined
                && payload.message !== undefined) {
                var finalHash = crypto.createHash('sha1').update(hashBase + payload.message).digest('hex');
                logger.log(req, 'Sending message:' + payload.message);
                var gateway = (payload.quality === undefined || payload.quality === false || payload.quality === 'false') ? 'lowcost' : 'high';
                request({
                    url: sendUrl,
                    qs: {
                        'username': username,
                        'password': crypto.createHash('sha1').update(nconf.get('sms').smsmanager.password).digest('hex'),
                        //'hash' : finalHash,
                        'number': payload.number,
                        'message': payload.message,
                        'gateway': gateway,
                    }

                }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        logger.log(req, body) // Print the google web page.
                        res.status(200).json({ "message": response.body, "gateway": gateway });
                    } else {
                        res.status(500).json({ "message": response.body });
                    }
                });
            }
            else {
                res.status(401).json({ "message": "Missing or incomplete message parameters in body!" })
            }
        }
    }
};


exports.notify = function (req, res) {
    if (apiKeyUtils.verifyToken(req, res)) {
        logger.log(req, "exports.notifySms");


    }
}
