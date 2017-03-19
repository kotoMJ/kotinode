var kotiConfig = require('config.json')('./app/config/config.json', process.env.NODE_ENV == 'dev' ? 'development' : 'production');

export function verifyToken(req, res) {
    var apiKey = req.headers['apikey'];
    if (apiKey === undefined) {
        res.status(401).json({ "message": "Missing or incomplete authentication parameters" })
        return false
    } else if (kotiConfig.api_key !== apiKey) {
        res.status(403).json({ "message": "Missing permissions!" })
        return false
    } else
        return true

}