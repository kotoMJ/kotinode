var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');
var logger = require('../utils/logger.js');
var KotiHeatingSchema = require('../models/KotiHeatingSchema');
var KotiHeatingSchedule = require('../models/KotiHeatingSchedule');

exports.saveHeatingStatus = function (req, res) {
    var temperatureValue = req.body.temperature;
    var timetableValue = req.body.timetable;
    var keyBody = req.body.key;
    var keyHeader = req.headers['key'];
    var deviceDateTimeValue = req.body.deviceDateTime;
    var deviceModeValue = req.body.deviceMode

    if (temperatureValue === undefined) {
        logger.log(req, 'Missing t parameter');
        return res.status(401).json({"message": "Missing t parameter"})
    }
    if ((keyBody === undefined) && (keyHeader === undefined)) {
        logger.log(req, 'Missing k parameter');
        return res.status(401).json({"message": "Missing k parameter"})
    }

    if ((keyBody === kotiConfig.heatingKey) || (keyHeader === kotiConfig.heatingKey)) {

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
    } else {
        logger.log(req, 'Invalid credentials');
        return res.status(403).json({
            "dataValue": "invalid credentials"
        })
    }
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
    logger.log(req, "getHeatingStatus")
    var timetable = req.body.timetable;
    var validity = req.body.validity;

    var newHeatingSchedule =
        {
            uniqueScheduleId: 0,
            timetable: timetable,
            validity: validity
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
}

exports.getHeatingScheduleRaw = function (req, res) {


    KotiHeatingSchema.find().where('uniqueModelId').equals(0).exec(function (err, schema) {
        if (err) {
            return res.status(500).send(err)
        } else {
            logger.log(req, schema)


            let week = []
            if (schema.timetable) {
                for (let day = 0; day < 8; day++) {
                    let day = []
                    if (schema.timetable.length === 8) {
                        for (let hour = 0; hour < 25; hour++) {
                            if (schema.timetable[day].length === 24) {
                                day.push(schema.timetable[day][hour]).push(" ")
                            }
                        }
                    }
                    week.push(day)
                }
            }

            return res.status(200).send(week);
        }
    });

    // let su = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    // let mo = new Array('150 150 150 150 150 150 150 230 230 230 230 230 230 230 230 230 230 230 230 230 200 150 150 150 ');
    // let tu = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    // let we = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    // let th = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    // let fr = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');
    // let sa = new Array('150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 150 ');


    //TODO read from DB
    //return res.status(200).send(/*su + mo + tu + we + th + fr + sa*/);
}

exports.getHeatingSchedule = function (req, res) {

    //TODO read from DB
    return res.status(200).json({
            "dataValue": {
                "schedule":
                    [
                        ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // NE
                        ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "230", "230", "230", "230", "230", "230", "150", "150", "150", "150"], // PO
                        ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // UT
                        ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // ST
                        ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // CT
                        ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"], // PA
                        ["150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150", "150"] // SO
                    ]
            }
        }
    )
}