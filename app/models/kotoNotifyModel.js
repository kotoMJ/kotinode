var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotifyItemSchema = new Schema({
    apiKey: { type: String, required: true },
    tagList: [{ type: String, required: true }],
    notificationType: [{ type: String, required: true }],
    messageSubject: { type: String, required: true },
    messageBody: { type: String, required: true },
    messageArrivedDateTime: { type: Date },
    messageProcessedDateTime: { type: Date },
});

module.exports = mongoose.model('KotoNotifyItem', NotifyItemSchema);