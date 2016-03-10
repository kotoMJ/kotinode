// app/models/bear.js
//http://mongoosejs.com/docs/2.7.x/docs/schematypes.html

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var EventSchema   = new Schema({
    sortId: { type: Number, required: true},
    headline: { type:String, required: true},
    label: [String],
    eventDate: { type:Date, required: true},//30.09.2015 01Z
    eventLocation : [String],
    textCapital : [String],
    text : { type: [String], required: true},
    imageResource: String,
    updateDate: {type: Date, default:Date.now }
});

module.exports = mongoose.model('KotoEvent', EventSchema);