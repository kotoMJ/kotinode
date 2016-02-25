
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var GalleryItemSchema   = new Schema({
    id: { type: Number, required: true},
    galleryName: { type:String, required: true},
    galleryDate: { type:Date, required: true},//30.09.2015 01Z
    url: { type:String, required: true},
});
GalleryItemSchema.index({id:1, galleryName:1}, {unique:true})

module.exports = mongoose.model('KotoGalleryItem', GalleryItemSchema);