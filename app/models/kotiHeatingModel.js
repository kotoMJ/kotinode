var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var KotiHeatingSchema = new Schema({
    uniqueModelId: {type: Number, unique: true},
    heatingDeviceStatus: {
        hour: {type: Number},
        minute: {type: Number},
        day: {type: String},
        temperature: {type: Number, required: true},
        timestamp: {type: Date, required: true},
        timetable: [[{type: Number, required: true}]]
    },
    heatingServerStatus: {
        timetable: [[{type: String, required: true}]]
    }
});


module.exports = mongoose.model('KotiHeatingModel', KotiHeatingSchema);