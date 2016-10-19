var Order = require('../models/order');

var mongoose = require('mongoose');

mongoose.connect('localhost:27017/shopping');

var orders = [
    new Order({
            user: 'test_name',
            cart: {},
            address: 'dummy_address',
            name: 'dummy_name',
            payment: 'dummy_payment'
    })
];

var done = 0;
for (var i = 0; i < orders.length; i++) {
    orders[i].save(function(err, result) {
        done++;
        if (done === orders.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}