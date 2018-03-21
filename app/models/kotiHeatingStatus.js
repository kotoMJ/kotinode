var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var KotiHeatingStatus = new Schema({
    heatingId: {type: Number, unique: true},
    heatingName: {type: String, required: true},
    hour: {type: Number},
    minute: {type: Number},
    day: {type: String},
    heatingMode: {type: Number},
    temperature: {type: Number, required: true},
    timestamp: {type: Date, required: true},
    timetable: [[{type: Number, required: true}]]
});


module.exports = mongoose.model('KotiHeatingStatus', KotiHeatingStatus);
