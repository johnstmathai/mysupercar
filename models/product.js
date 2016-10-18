var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    imagePath: {type: String, required: true},
    thumbnail: {type: String, required: true},
    title: {type: String, required: true},
    brand: {type: String,required:true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    mileage:{type: Number, required: true},
    engine:{type: Number, required: true},
    bhp:{type: Number, required: true},
    seaters:{type: Number, required: true},
    fueltype:{type: String, required: true},
    vehicleType:{type: String, required: true},
    transmission:{type: String, required: true},
    stock:{type:Number, required:true}
});

module.exports = mongoose.model('Product', schema);