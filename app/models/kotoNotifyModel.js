var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotifyItemSchema = new Schema({
    sender: { type: String, required: true },
    tagList: [{ type: String, required: true }],
    notificationType: [{ type: String, required: true }],
    urgent: { type: Boolean, required: true },
    messageSubject: { type: String, required: true },
    messageBody: { type: String, required: true },
    messageArriveDateTime: { type: Date },
    messageProcessDateTime: { type: Date },
});

module.exports = mongoose.model('KotoNotifyItem', NotifyItemSchema);