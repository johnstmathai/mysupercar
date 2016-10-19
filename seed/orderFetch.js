var Order = require('../models/order');
var mongoose = require('mongoose');

mongoose.connect('localhost:27017/shopping');

//Function to get the size of an object
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Order
.find(function(err, orders) {
	console.log("Inside find");
	if (err) {
		console.log(error);
		return;
		mocha
	}
	console.log(orders);
	// To fetch current week order
	for ( var order in orders)
	{
		//if ("11-09-16" == orders[order]["paymentId"]) {
		if (1) {
			{
				console.log(orders[order]["name"]);
				console.log(orders[order]["paymentId"]);
				console.log(orders[order]["address"]);
				for (item in orders[order]["cart"]["items"])
				{
					console.log(orders[order]["cart"]["items"][item]["item"]["title"]
					+ "\t"
					+ orders[order]["cart"]["items"][item]["item"]["description"]
					+ "\t"
					+ orders[order]["cart"]["items"][item]["item"]["price"]
					+ "\t"
					+ orders[order]["cart"]["items"][item]["qty"]
					+ "\t"
					+ orders[order]["cart"]["items"][item]["price"]);
				}
				// Get the size of an object
				var size = Object.size(orders[order]["cart"]["items"]);
				console.log(size);
				//console.log(orders[order]["cart"]["totalQty"]);
				console.log(orders[order]["cart"]["totalPrice"]);
			}
		}
	}
	process.exit();
});

function exit() {
    mongoose.disconnect();
}


