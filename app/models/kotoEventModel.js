// app/models/bear.js
//http://mongoosejs.com/docs/2.7.x/docs/schematypes.html

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventBatchSchema = new Schema({
    name: {type: String, required: true},
    date: {type: Date, required: true},
    eventList: [{
        headline: {type: String, required: true},
        description: String,
        imageResource: String,
        category: [{
            name: {type: String, required: true}
        }],
        date: {type: Date},
        time: {type: Date},
        location: [{
            name: {type: String}
        }],
        text: [{type: String, required: true}]
    }]
});

//https://github.com/Automattic/mongoose/issues/4356

// var EventText = new Schema({
//     text: {type: String, required: true},
// })
//
// var EventBatch = new Schema({
//     //id: {type: String, required: true, unique: true},
//     date: {type: Date, required: true},
//     description: {type: String, required: true}
// })
//
// var EventCategory = new Schema({
//     //id: {type: String, required: true, unique: true},
//     name: {type: String, required: true}
// })
//
// var EventLocation = new Schema({
//     //id: {type: String, required: true, unique: true},
//     name: {type: String, required: true}
// })

module.exports = mongoose.model('KotoEventBatch', EventBatchSchema);