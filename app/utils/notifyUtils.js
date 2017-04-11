//var fs = require('fs');
var nodemailer = require('nodemailer');
var request = require('request');
var crypto = require('crypto');
var nconf = require('nconf');
var logger = require('../utils/logger.js');


exports.getEmailTransport = function (failureCallback) {
    nconf.file('email', './app/config/config.notify.json');
    if (nconf.get('email') === undefined) {
        throw new Error('Email config is missing on the kotoServer!')
    } else {
        return nodemailer.createTransport({
            pool: true,
            maxConnections: 2,
            host: nconf.get('email').rosti.smtp.host,
            port: nconf.get('email').rosti.smtp.port,
            requireTLS: true,
            secure: false,
            auth: {
                user: nconf.get('email').rosti.smtp.user,
                pass: nconf.get('email').rosti.smtp.pass
            },
            debug: process.env.NODE_ENV == 'dev',
        })
    }
}

/**
 *
 * https://docs.rosti.cz/emails/
 * https://nodemailer.com/about/
 * https://nodemailer.com/smtp/
 * http://wiki.rosti.cz/e-maily
 * http://blog.rosti.cz/novy-smtp-server/
 *
 * SuccessCallback starts with message code: http://www.serversmtp.com/en/smtp-error
 *
 * @param emailTo
 * @param emailSubject
 * @param emailText
 * @param successCallback - for example "250 Message Queued"
 * @param failureCallback
 */
exports.notifyEmail = function (req, transporter, emailTo, emailSubject, emailText, successCallback, failureCallback) {
    nconf.file('email', './app/config/config.notify.json');
    if (nconf.get('email') === undefined) {
        failureCallback('Email config is missing on the kotoServer!')
    } else {

        var mailOptions = {
            from: nconf.get('email').rosti.smtp.sender, // sender address
            to: emailTo,//payload.to, // list of receivers
            subject: emailSubject, //payload.subject, // Subject line
            text: emailText, //payload.text //, // plaintext body
            //html: '<b>Yo dude! ✔</b>' // You can choose to send an HTML body instead
        };


        // verify connection configuration
        transporter.verify(function (error, success) {
            if (error) {
                logger.log(req, 'Failed to verify: ' + error);
                //res.status(500).json({ "message": 'Email server is not ready to send email now.' });
                failureCallback('Email server is not ready to send email now:' + error)
            } else {
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        logger.log(req, 'Failed to sendMail: ' + error);
                        //res.status(500).json({ "message": 'Unexpected error when sending email' });
                        failureCallback('Unexpected error when sending email:' + error)
                    } else {
                        //console.log('Message sent: ' + info.response);
                        //res.status(200).json({ "message": info.response });
                        successCallback(info.response)
                    }
                    ;
                });
            }
        });
    }

}

/**
 *
 * http://smsmanager.cz/api/http/
 * http://smsmanager.cz/api/codes/#errors
 * http://www.smsmanager.cz/rozesilani-sms/lowcost
 * https://www.smsmanager.cz/rozesilani-sms/ceny/
 *
 * @param phoneNumber
 * @param message
 * @param gateway
 * @param successCallback - for example: "OK|9231583|420724811441"
 * @param failureCallback
 */
exports.notifySms = function (req, phoneNumber, message, gateway, successCallback, failureCallback) {

    //var finalHash = crypto.createHash('sha1').update(hashBase + message).digest('hex');
    nconf.file('sms', './app/config/config.notify.json');
    if (nconf.get('sms') === undefined) {
        failureCallback({ body: 'SMS config is missing on the kotoServer!' })
    } else {
        logger.log(req, JSON.stringify(nconf.get('sms')))
        var sendUrl = nconf.get('sms').smsmanager.apiSend;
        var username = nconf.get('sms').smsmanager.username;
        var hashBase = nconf.get('sms').smsmanager.hashFix;

        request({
            url: sendUrl,
            qs: {
                'username': username,
                'password': crypto.createHash('sha1').update(nconf.get('sms').smsmanager.password).digest('hex'),
                //'hash' : finalHash,
                'number': phoneNumber,
                'message': message,
                'gateway': gateway,
            }

        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //logger.log(req, body) // Print the google web page.
                //res.status(200).json({ "message": response.body, "gateway": gateway });
                successCallback(response)
            } else {
                //res.status(500).json({ "message": response.body });
                logger.err(req, 'response.body.error' + response)
                failureCallback(response)
            }
        });
    }
}

/**
 *
 * http://smsmanager.cz/api/http/
 * http://smsmanager.cz/api/codes/#errors
 * http://www.smsmanager.cz/rozesilani-sms/lowcost
 * https://www.smsmanager.cz/rozesilani-sms/ceny/
 *
 */
exports.checkSmsStatus = function (successCallback, failureCallback) {
    //var finalHash = crypto.createHash('sha1').update(hashBase + message).digest('hex');
    nconf.file('sms', './app/config/config.notify.json');
    if (nconf.get('sms') === undefined) {
        failureCallback({ body: 'SMS config is missing on the kotoServer!' })
    } else {
        console.log(JSON.stringify(nconf.get('sms')))
        var sendUrl = nconf.get('sms').smsmanager.apiStatus;
        var username = nconf.get('sms').smsmanager.username;
        var hashBase = nconf.get('sms').smsmanager.hashFix;

        request({
            url: sendUrl,
            qs: {
                'username': username,
                'password': crypto.createHash('sha1').update(nconf.get('sms').smsmanager.password).digest('hex'),
            }

        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //logger.log(req, body) // Print the google web page.
                //res.status(200).json({ "message": response.body, "gateway": gateway });
                successCallback(response.body)
            } else {
                //res.status(500).json({ "message": response.body });
                failureCallback(response)
            }
        });
    }
}