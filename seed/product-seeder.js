var Product = require('../models/product');

var mongoose = require('mongoose');

mongoose.connect('localhost:27017/mysupercar');

var products = [
    new Product({
        imagePath: 'images/baleno.jpg',
        thumbnail: 'images/Mathan_tn.jpg',
        title: 'Maruti Baleno',
        brand: 'Maruti',
        description: '1.3 ZETA',
        price: 8.6,
        mileage:27.4,
        engine:1248,
        bhp:74,
        seaters:5,
        fueltype:'Diesel',
        vehicleType:'Hatchback',
        transmission:'Manual',
        stock: 40
    })
 ];

var done = 0;
for (var i = 0; i < products.length; i++) {
    products[i].save(function(err, result) {
        if(err) {
            console.log(err);    
        }

        done++;
        if (done === products.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}
