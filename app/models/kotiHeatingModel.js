var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var KotiHeatingSchema = new Schema({
    heatingDeviceStatus: {
        uniqueId: {type: Number, unique: true},
        hour: {type: Number},
        minute: {type: Number},
        day: {type: String},
        temperature: {type: Number, required: true},
        timestamp: {type: Date, required: true},
        timetable: [[{type: String, required: true}]]
    },
    heatingServerStatus: {
        timetable: [[{type: String, required: true}]]
    }
});


module.exports = mongoose.model('KotiHeatingModel', KotiHeatingSchema);