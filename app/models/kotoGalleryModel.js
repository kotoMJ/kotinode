
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var GallerySchema   = new Schema({
    id: { type: Number, required: true, unique: true},
    label: { type:String, required: true},
    url: { type:String, required: true},
});

module.exports = mongoose.model('KotoGallery', GallerySchema);