var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
var logger = require('../utils/logger.js');
var KotiHeatingSchema = require('../models/KotiHeatingSchema');
var KotiHeatingSchedule = require('../models/KotiHeatingSchedule');
var apiKeyUtils = require('./kotoAuthController');
var moment = require('moment');

verifyAccess = function (req, res, successCallback) {
    kotoNotify.messageProcessDateTime = new Date()
    logger.log(req, 'success email callback.c... saving.')
    kotoNotify.save(function (err, result) {
        if (err) {
            logger.log(req, error)
            throw Error('Unable to save [email]:' + JSON.stringify(kotoNotify))
        }
        else {
            res.status(200).json({"message": `Notification finished for type > ${kotoNotify.notificationType}`})
        }
    })
}

exports.saveHeatingStatus = function (req, res) {
    apiKeyUtils.verifyHeatingKey(req, res, () => {
        const temperatureValue = req.body.temperature;
        const timetableValue = req.body.timetable;
        const deviceDateTimeValue = req.body.deviceDateTime;
        const deviceModeValue = req.body.deviceMode;

        if (temperatureValue === undefined) {
            logger.log(req, 'Missing t parameter');
            return res.status(401).json({"message": "Missing t parameter"})
        }
        if ((keyBody === undefined) && (keyHeader === undefined)) {
            logger.log(req, 'Missing k parameter');
            return res.status(401).json({"message": "Missing k parameter"})
        }

        //[hour:18][minute:25][day:MO]
        var matches = deviceDateTimeValue.match(/\[hour:(.*?)\]\[minute:(.*?)\]\[day:(.*?)\]/);

        var hourValue = matches[1];
        var minuteValue = matches[2];
        var dayValue = matches[3];

        var newHeatingSchema =
            {
                uniqueModelId: 0,
                heatingDeviceStatus: {
                    hour: hourValue,
                    minute: minuteValue,
                    day: dayValue,
                    deviceMode: deviceModeValue,
                    temperature: temperatureValue,
                    timestamp: new Date(),
                    timetable: timetableValue
                }
            };
        KotiHeatingSchema.findOneAndUpdate({uniqueModelId: 0}, newHeatingSchema,
            {upsert: true, new: true, runValidators: true}, // options
            function (err, updateResult) {
                if (err) {
                    logger.log(req, 'incoming body:' + JSON.stringify(req.body));
                    logger.log(req, "error when saving model:");
                    logger.log(req, newHeatingModel);
                    res.send(err)
                }
                else
                    res.status(200).jsonWrapped(updateResult)
            })
    })
};

exports.getHeatingStatus = function (req, res) {
    logger.log(req, "getHeatingStatus")
    KotiHeatingSchema.find().where('uniqueModelId').equals(0).exec(function (err, findResult) {
        if (err) {
            res.status(500).send(err)
        } else {
            logger.log(req, findResult)
            res.jsonWrapped(findResult);
        }
    });
}

//hexString = yourNumber.toString(16);
//yourNumber = parseInt(hexString, 16);

exports.setHeatingSchedule = function (req, res) {
    logger.log(req, "setHeatingSchedule")
    apiKeyUtils.verifyHeatingKey(req, res, () => {
        logger.log(req, 'incoming body:' + JSON.stringify(req.body));
        const timetable = req.body.timetable;
        //const validity = req.body.validity;
        let newHeatingSchedule =
            {
                uniqueScheduleId: 0,
                timetable: timetable,
                validity: Date()
                //validity: moment(validity, "YYYY-MM-DDTHH:mm:ss.sssZ").toDate()//2018-01-22T06:52:49.000Z
            };

        KotiHeatingSchedule.findOneAndUpdate({uniqueScheduleId: 0}, newHeatingSchedule,
            {upsert: true, new: true, runValidators: true}, // options
            function (err, updateResult) {
                if (err) {
                    logger.log(req, 'incoming body:' + JSON.stringify(req.body));
                    logger.log(req, "error when saving model:");
                    logger.log(req, newHeatingSchedule);
                    res.send(err)
                }
                else
                    res.status(200).jsonWrapped(updateResult)
            })
    })
}

exports.getHeatingScheduleRaw = function (req, res) {

    KotiHeatingSchedule.findOne().where('uniqueScheduleId').equals(0).exec(function (err, schema) {
        if (err) {
            return res.status(500).send(err)
        } else {
            logger.log(req, 'loaded schema:' + JSON.stringify(schema));
            let weekString = "";
            if (schema.timetable !== undefined) {
                for (let day = 0; day < 7; day++) {
                    let dayString = "";
                    logger.log(req, 'schema.timetable.length:' + schema.timetable.length);
                    if (schema.timetable.length === 7) {
                        logger.log(req, '[day]:' + JSON.stringify(day));
                        logger.log(req, 'schema.timetable[day]:' + JSON.stringify(schema.timetable[day]));
                        if (schema.timetable[day].length === 24) {
                            for (let hour = 0; hour < 24; hour++) {
                                logger.log(req, '[hour]:' + JSON.stringify(hour));
                                logger.log(req, 'schema.timetable[day][hour]:' + JSON.stringify(schema.timetable[day][hour]));
                                dayString = dayString + schema.timetable[day][hour];
                                dayString = dayString + " "
                            }
                        }
                    }
                    weekString = weekString + dayString
                }
            } else {
                logger.log(req, 'no timetable!');
            }

            return res.status(200).send(weekString);
        }
    });

    // let su = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    // let mo = new Array('150 150 150 150 150 150 150 230 230 230 230 230 230 230 230 230 230 230 230 230 200 150 150 150 ');
    // let tu = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    // let we = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    // let th = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    // let fr = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    // let sa = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');

    //return res.status(200).send(/*su + mo + tu + we + th + fr + sa*/);
}

exports.getHeatingSchedule = function (req, res) {

    KotiHeatingSchedule.findOne().where('uniqueScheduleId').equals(0).exec(function (err, schema) {
        if (err) {
            return res.status(500).send(err)
        } else {
            logger.log(req, 'loaded schema:' + JSON.stringify(schema));
            let weekString = "";
            if (schema.timetable !== undefined) {
                return res.status(200).json({
                    "dataValue": {
                        "schedule": schema.timetable
                    }
                })
            } else {
                logger.log(req, 'no timetable!');
            }

            return res.status(200).send(weekString);
        }
    });

    // return res.status(200).json({
    //         "dataValue": {
    //             "schedule":
    //                 [
    //                     ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // NE
    //                     ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "230", "230", "230", "230", "230", "230", "150", "150", "150", "150"], // PO
    //                     ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // UT
    //                     ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // ST
    //                     ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // CT
    //                     ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // PA
    //                     ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"] // SO
    //                 ]
    //         }
    //     }
    // )
}