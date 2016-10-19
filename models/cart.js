module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    this.add = function(item, id, qty) {
        var storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = {item: item, qty: 0, price: 0};
        }

        num_qty = Number(qty);

        if( 0!=num_qty )
        {
//            console.log(" num_qty = "+ num_qty);
//            console.log("storedItem.qty = "+ storedItem.qty);
//            console.log("storedItem.price =  " + storedItem.price);
//            console.log("storedItem.item.price =  " + storedItem.item.price);
//            console.log("this.totalQty = "+ this.totalQty);
//            console.log("this.totalPrice = "+ this.totalPrice);
//            console.log("------------")
        	if( 5 >= (storedItem.qty + num_qty))
        	{
                storedItem.qty +=num_qty;
                //storedItem.qty++;
                storedItem.price = storedItem.item.price * storedItem.qty;
                this.totalQty +=num_qty;
                this.totalPrice += storedItem.item.price * num_qty;           		
        	}
        	else
        	{
        		console.log("Cannot purchase more that 3 items");
        	}
//            console.log("storedItem.qty = "+ storedItem.qty);
//            console.log("storedItem.price =  " + storedItem.price);
//            console.log("storedItem.item.price =  " + storedItem.item.price);
//            console.log("this.totalQty = "+ this.totalQty);
//            console.log("this.totalPrice = "+ this.totalPrice);
        }
    };

    this.reduceByOne = function(id) {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price;
        this.totalQty--;
        this.totalPrice -= this.items[id].item.price;

        if (this.items[id].qty <= 0) {
            delete this.items[id];
        }
    };
    
    this.reduceByAny = function(id,qty) {
        this.items[id].qty -= qty;
        this.items[id].price = this.items[id].item.price * this.items[id].qty;
        this.totalQty -=qty;
        this.totalPrice = this.items[id].item.price*qty;

        if (this.items[id].qty <= 0) {
            delete this.items[id];
        }
    };

    this.removeItem = function(id) {
        this.totalQty -= this.items[id].qty;
        this.totalPrice -= this.items[id].price;
        delete this.items[id];
    };
    
    this.generateArray = function() {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
};