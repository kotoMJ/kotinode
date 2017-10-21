exports.saveLastHeatingInfo = function (req, res) {
    var temperature = req.body.temperature;
    var keyBody = req.body.key;
    var keyHeader = req.headers['key'];

    if (temperature === undefined) {
        return res.status(401).json({"message": "Missing t parameter"})
    }
    if ((keyBody === undefined) && (keyHeader === undefined)) {
        return res.status(401).json({"message": "Missing k parameter"})
    }

    if ((keyBody === "Test123") || ( keyHeader === "Test123")) {

        //TODO save temperature

        return res.status(200).json({
            "dataValue": {
                "temperature": temperature,
                "keyHeader": keyHeader,
                "keyBody": keyBody,
                "successful": true
            }
        })
    } else {
        return res.status(403).json({
            "dataValue": "invalid credentials"
        })
    }
};

exports.saveLastHeatingInfoRaw = function (req, res) {
    var temperature = req.body.temperature;
    var keyBody = req.body.key;
    var keyHeader = req.headers['key'];

    if (temperature === undefined) {
        return res.status(401).json({"message": "Missing t parameter"})
    }
    if ((keyBody === undefined) && (keyHeader === undefined)) {
        return res.status(401).json({"message": "Missing k parameter"})
    }

    if ((keyBody === "Test123") || ( keyHeader === "Test123")) {

        //TODO save temperature

        return res.status(200).json({
            "dataValue": {
                "temperature": temperature,
                "keyHeader": keyHeader,
                "keyBody": keyBody,
                "successful": true
            }
        })
    } else {
        return res.status(403).json({
            "dataValue": "invalid credentials"
        })
    }
};

exports.getLastHeatingInfo = function (req, res) {

    //TODO read from DB
    return res.status(200).json({"dataValue": {
        "temperature": 19.5
    }})
}