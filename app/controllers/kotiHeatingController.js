const kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
const logger = require('../utils/logger.js');
const KotiHeatingSchedule = require('../models/kotiHeatingSchedule');
const KotiHeatingStatus = require('../models/kotiHeatingStatus');
const apiKeyUtils = require('./kotoAuthController');
const moment = require('moment');
const sslCertificate = require('get-ssl-certificate');

/**
 * SET HEATING STATUS - set by every heating device periodically.
 * @param req
 * @param res
 */
exports.saveHeatingStatus = function (req, res) {
    apiKeyUtils.verifyHeatingKey(req, res, () => {
        const heatingId = req.params.heating_id;
        const heatingName = req.body.heatingName;
        const heatingDateTimeValue = req.body.heatingDateTime;
        const heatingModeValue = req.body.heatingMode;
        const temperatureValue = req.body.temperature;
        const timetableValue = req.body.timetable;

        if (heatingId === undefined) {
            logger.log(req, 'Missing t parameter');
            return res.status(401).json({"message": "Missing heatingId parameter"})
        }

        if (heatingName === undefined) {
            logger.log(req, 'Missing t parameter');
            return res.status(401).json({"message": "Missing heatingName parameter"})
        }

        if (temperatureValue === undefined) {
            logger.log(req, 'Missing t parameter');
            return res.status(401).json({"message": "Missing temperatureValue parameter"})
        }

        if (heatingDateTimeValue === undefined) {
            return res.status(401).json({"message": "Missing heatingDateTimeValue  parameter"})
        }

        if (heatingModeValue === undefined) {
            return res.status(401).json({"message": "Missing heatingModeValue  parameter"})
        }

        if (timetableValue === undefined) {
            return res.status(401).json({"message": "Missing timetableValue  parameter"})
        }

        //[hour:18][minute:25][day:MO]
        var matches = heatingDateTimeValue.match(/\[hour:(.*?)\]\[minute:(.*?)\]\[day:(.*?)\]/);

        var hourValue = matches[1];
        var minuteValue = matches[2];
        var dayValue = matches[3];

        var newHeatingStatus =
            {
                heatingId: heatingId,
                heatingName: heatingName,
                hour: hourValue,
                minute: minuteValue,
                day: dayValue,
                heatingMode: heatingModeValue,
                temperature: temperatureValue,
                timestamp: new Date(),
                timetableDevice: timetableValue
            };
        KotiHeatingStatus.findOneAndUpdate({heatingId: heatingId}, newHeatingStatus,
            {upsert: true, new: true, runValidators: true}, // options
            function (err, updateResult) {
                if (err) {
                    logger.log(req, 'incoming body:' + JSON.stringify(req.body));
                    logger.log(req, "error when saving model:");
                    res.send(err)
                }
                else
                    res.status(200).jsonWrapped(updateResult)
            })
    })
};

/**
 * PROVIDE HEATING STATUS - read by client (Android app) with every refresh to user.
 * @param req
 * @param res
 */
exports.getHeatingStatus = function (req, res) {
    logger.log(req, "getHeatingStatus")
    apiKeyUtils.verifyUserHeatingKey(req, res, () => {
        const heatingId = parseInt(req.params.heating_id);
        requestHeatingStatusForId(req, res, heatingId)
    })
}

function requestHeatingStatusForId(req, res, heatingId) {
    KotiHeatingStatus.findOne().where('heatingId').equals(heatingId).exec(function (err, findStatusResult) {
        if (err) {
            res.status(500).send(err)
        } else {
            logger.log(req, findStatusResult)
            logger.log(req, 'loaded status:' + JSON.stringify(findStatusResult));
            KotiHeatingSchedule.findOne().where('heatingId').equals(heatingId).exec(function (err, schema) {
                if (err) {
                    return res.status(500).send(err)
                } else {
                    logger.log(req, 'loaded schedule:' + JSON.stringify(schema));
                    if (schema !== null && schema.timetable !== undefined) {
                        findStatusResult.timetableServer = schema.timetable
                        res.jsonWrapped(findStatusResult);
                    } else {
                        logger.log(req, 'no schema or timetable for heatingId=' + heatingId);
                        res.jsonWrapped(findStatusResult);
                    }
                }
            });


        }
    });
}

/**
 * SET HEATING SCHEDULE - set by client (Android app) when user change the schedule.
 * @param req
 * @param res
 */
exports.setHeatingSchedule = function (req, res) {
    logger.log(req, "setHeatingSchedule")
    apiKeyUtils.verifyUserHeatingKey(req, res, () => {
        logger.log(req, 'incoming body:' + JSON.stringify(req.body));
        const timetable = req.body.timetable;
        const heatingId = req.params.heating_id;
        //const validity = req.body.validity;
        let newHeatingSchedule =
            {
                heatingId: heatingId,
                timetable: timetable,
                validity: Date()
                //validity: moment(validity, "YYYY-MM-DDTHH:mm:ss.sssZ").toDate()//2018-01-22T06:52:49.000Z
            };

        KotiHeatingSchedule.findOneAndUpdate({heatingId: heatingId}, newHeatingSchedule,
            {upsert: true, new: true, runValidators: true}, // options
            function (err, updateResult) {
                if (err) {
                    logger.log(req, "error when saving model:");
                    logger.log(req, JSON.stringify(newHeatingSchedule));
                    res.status(500).send(err)
                }
                else {
                    requestHeatingStatusForId(req, res, heatingId)
                }
            })
    })
}


/**
 * PROVIDE HEATING SCHEDULE - in raw format - read by heating (Arduino app) periodically.
 * @param req
 * @param res
 */
exports.getHeatingScheduleRaw = function (req, res) {
    apiKeyUtils.verifyHeatingKey(req, res, () => {
        const heatingId = req.params.heating_id;
        KotiHeatingSchedule.findOne().where('heatingId').equals(heatingId).exec(function (err, schema) {
            if (err) {
                return res.status(500).send(err)
            } else {
                logger.log(req, 'loaded schema:' + JSON.stringify(schema));
                let weekString = "";
                if (schema.timetable !== undefined) {
                    for (let day = 0; day < 7; day++) {
                        let dayString = "";
                        //logger.log(req, 'schema.timetable.length:' + schema.timetable.length);
                        if (schema.timetable.length === 7) {
                            logger.log(req, '[day]:' + JSON.stringify(day));
                            logger.log(req, 'schema.timetable[day]:' + JSON.stringify(schema.timetable[day]));
                            if (schema.timetable[day].length === 24) {
                                for (let hour = 0; hour < 24; hour++) {
                                    //logger.log(req, '[hour]:' + JSON.stringify(hour));
                                    //logger.log(req, 'schema.timetable[day][hour]:' + JSON.stringify(schema.timetable[day][hour]));
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

/**
 * PROVIDE HEATING SCHEDULE - in json format - .
 * @param req
 * @param res
 */
exports.getHeatingSchedule = function (req, res) {
    logger.log(req, "getHeatingSchedule")
    apiKeyUtils.verifyUserHeatingKey(req, res, () => {
        const heatingId = req.params.heating_id;
        KotiHeatingSchedule.findOne().where('heatingId').equals(heatingId).exec(function (err, schema) {
            if (err) {
                return res.status(500).send(err)
            } else {
                logger.log(req, 'loaded schema:' + JSON.stringify(schema));
                let weekString = "";
                if (schema !== null && schema.timetable !== undefined) {
                    return res.jsonWrapped({
                        "heatingId": heatingId,
                        "timetable": schema.timetable

                    })
                } else {
                    logger.log(req, 'no schema or timetable for heatingId=' + heatingId);
                    return res.status(204).send(weekString);
                }
            }
        });

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

/**
 * PROVIDE CURRENT SHA1 FINGERPRINT OF SSH CERTIFICATE - used by external API to provide secretly HTTP endpoint for Arduino device (since Arduino needs it to start secure communication).
 * @param req
 * @param res
 */
exports.getCert = function (req, res) {
    sslCertificate.get('kotopeky.cz').then(function (certificate) {
        return res.status(200).send(certificate.fingerprint.replace(/:/g, " "))
    })

}

/**
 * ADMINISTRATION TOOL to reset data and models by API.
 * @param req
 * @param res
 */
exports.cleanupHeatingData = function (req, res) {
    apiKeyUtils.verifyUserAdminKey(req, res, () => {
        logger.log(req, "Ready to drop schedule model...");
        KotiHeatingSchedule.remove({}, function (err, result) {
            if (err == null) {
                logger.log(req, 'Schedule model cleaned!');
                logger.log(req, "Ready to drop status model...");
                KotiHeatingStatus.remove({}, function (err, result) {
                    if (err == null) {
                        logger.log(req, 'Status model cleaned!');
                        logger.log(req, "Drop done...");
                        return res.status(200).json({
                            "message": "drop done"
                        })
                    } else {
                        logger.log(req, 'Status model clean failed!' + err);
                        return res.status(500).json({
                            "message": "status drop failed"
                        })
                    }
                });
            } else {
                logger.log(req, 'Schedule model clean failed!' + err);
                return res.status(500).json({
                    "message": "schedule drop failed"
                })
            }
        });


    });
}


exports.simulateDeviceSync = function (req, res) {
    apiKeyUtils.verifyUserAdminKey(req, res, () => {
        logger.log(req, "Ready to simulate sync of the device...");
        const heatingId = req.params.heating_id;
        KotiHeatingSchedule.findOne().where('heatingId').equals(heatingId).exec(function (err, schema) {
            if (err) {
                return res.status(500).send(err)
            } else {
                logger.log(req, 'loaded schema:' + JSON.stringify(schema));
                let weekString = "";
                if (schema !== null && schema.timetable !== undefined) {

                    var currentDateTime = new Date()
                    var timetabletemp = 1
                    try {
                        timetabletemp = schema.timetable[currentDateTime.getDay() - 1][currentDateTime.getHours()] / 10
                    } catch (e) {
                        logger.err(req, "Unable to read current temperature from time table for [" + currentDateTime.getDay() - 1 + "][" + currentDateTime.getHours() + "]")
                    }
                    var newHeatingStatus =
                        {
                            heatingId: heatingId,
                            heatingName: "fakeNameBySyncRequest",
                            hour: currentDateTime.getHours(),
                            minute: currentDateTime.getMinutes(),
                            day: currentDateTime.getDay(),
                            heatingMode: 2,
                            temperature: timetabletemp,
                            timestamp: currentDateTime,
                            timetable: schema.timetable
                        };

                    KotiHeatingStatus.findOneAndUpdate({heatingId: heatingId}, newHeatingStatus,
                        {upsert: true, new: true, runValidators: true}, // options
                        function (err, updateResult) {
                            if (err) {
                                logger.log(req, "error when saving model:");
                                res.send(err)
                            }
                            else
                                res.status(200).jsonWrapped(updateResult)
                        })

                } else {
                    logger.log(req, 'no schema or timetable for heatingId=' + heatingId);
                    return res.status(204).send(weekString);
                }
            }
        });
    });
}
