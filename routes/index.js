var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');

var Product = require('../models/product');
var Order = require('../models/order');

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('smtps://mailtocucucart%40gmail.com:kanjikappa@smtp.gmail.com');

//for parsing form inputs
var bodyParser = require('body-parser');
 
//Pop-pup
var flash = require('connect-flash');

var Handlebars = require('handlebars');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// setup e-mail data with unicode symbols 
var mailOptions = {
    from: '"Cucucart.com" <mailtocucucart@gmail.com>', // sender address 
    to: 'palaniappan88@gmail.com', // list of receivers
    bcc: 'johnstmathai@gmail.com, palaniappan88@gmail.com, mathaity55@gmail.com', 
    subject: 'Your Cucucart.com Order Placed', // Subject line 
    //text: 'Your Cucucart.com Order Placed' // plaintext body 
    html: '<b>Auto Generated Test Mail</b>' // html body 
};

/* GET home page. */
router.get('/', function (req, res, next) {
    var successMsg = req.flash('success')[0];
    Product.find(function (err, docs) {
        var productChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        //console.log(productChunks);
        res.render('shop/index', {title: 'TheCar.com', products: productChunks, successMsg: successMsg, noMessages: !successMsg});
    });
});

router.get('/trackmyorders', isLoggedIn, function(req, res, next) {
    Order.find( {user:req.user}, function(err,orders) {
        if(err) {
            console.log('No orders found');
        }
        else {
            //console.log(orders);
            res.render('shop/trackmyorder', {orders: orders});
        }
    });
});


router.get('/add-to-cart/:id', function(req, res, next) {
    var splitParams = (req.params.id).split(" ");
    //console.log(splitParams);
    var productId = splitParams[0];
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product) {
       if (err) {
           console.log("Cannot find product ID : " + productId + ", err : " + err);
           return res.redirect('/');
       }
        //quantity order
        console.log(req.query);
        var qty = Number(req.query.qty);

      if( null != product)
       {
         if ( product.stock > 0 && product.stock >= qty)
         {

          //stock remaining
          //product.stock -=qty;
          //product.save(); 

         cart.add(product, product.id, qty );
         req.session.cart = cart;        	  

          //console.log(req.session.cart);
         }
         else
         {
          if ( product.stock <= 0 )
          {
              console.log("Product Sold Out");
              //req.flash('error',"Product Sold Out");
          }
          if( product.stock < qty )
          {
              console.log("Stock not enough");
              //req.flash('error',"Stock not enough");
          }
         }
       }
       else
       {
             console.log("ERROR : Product id null : " + product);
       }
        res.redirect('/');
    });
});

router.get('/reduce/:id', function(req, res, next) {

    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product) {
       if (err) {
           console.log("Cannot find product ID : " + productId + ", err : " + err);
           return res.redirect('/');
       }

       if( null != product)
       {
           //stock remaining
           //product.stock++;
           //product.save(); 
           if ( product.stock > 0 )
           {
             cart.reduceByOne(productId);
             req.session.cart = cart;
           }
           else
           {
            console.log("Out of Stock : ", productId);
           }
       }
       else
       {
            console.log("ERROR : Product id null : " + product);
       }
        res.redirect('/shopping-cart');
    });
});

router.get('/productpage/:id', function(req, res, next) {
    var productId = req.params.id;
	console.log("Product Page : " + productId);
    Product.findById(productId, function(err, product) {
    	console.log(product.title);
        res.render('shop/productpage',product);
    });
});

router.get('/add/:id', function(req, res, next) {

    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product) {
       if (err) {
           console.log("Cannot find product ID : " + productId + ", err : " + err);
           return res.redirect('/');
       }

       if( null!=product)
       {
        //stock remaining
        //product.stock--;
        //product.save();
    	   console.log(cart);
           if ( product.stock > 0 )
           {
               cart.add(product, product.id, 1 );
               req.session.cart = cart;        	  
           }
           else
           {
        	   console.log("Out of Stock");
               req.flash('error', 'Out of Stock');
           }

       }
       else
       {
            console.log("ERROR : Product id null : " + product);
       }

        res.redirect('/shopping-cart');
    });
});

router.get('/remove/:id', function(req, res, next) {

    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product) {
       if (err) {
           console.log("Cannot find product ID : " + productId + ", err : " + err);
           return res.redirect('/');
       }

   //stock remaining
   console.log("cart.qty : " + cart.items[productId].qty);
    if( null != product)
    {
        //product.stock += cart.items[productId].qty;
        //product.save(); 

        cart.removeItem(productId);
        req.session.cart = cart;       
    }
    else
    {
        cart.removeItem(productId);
        console.log("ERROR : Product id null : " + product);
    }
    res.redirect('/shopping-cart');    });

});

router.get('/shopping-cart', function(req, res, next) {
   if (!req.session.cart) {
       return res.render('shop/shopping-cart', {products: null});
   } 
    var cart = new Cart(req.session.cart);
    //console.log(cart.generateArray());
    var addedProducts = cart.generateArray()
    //console.log(addedProducts);
    //console.log(cart.totalPrice);
    res.render('shop/shopping-cart', {products: addedProducts, totalPrice: cart.totalPrice});
});

router.get('/checkout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.get('/contact', function(req, res, next) {
    res.render('shop/contact');
});

router.get('/aboutus', function(req, res, next) {
    res.render('shop/aboutus');
});

router.get('/howwework', function(req, res, next) {
    res.render('shop/howwework');
});

router.post('/checkout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
        var order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: Date()
        });   
        order.save(function(err, result) {
            if(err)
            {
                console.log("Order save error " + err);
            }
            else
            {     
                console.log("cart");
                console.log(cart);
                var mycart = cart.generateArray();
                mycart = { "mycart" : mycart};
                mycart["totalQty"] = cart.totalQty;
                mycart["totalPrice"] = cart.totalPrice;
                mycart["name"] = req.body.name;
                mycart["address"] = req.body.address;
                mycart["landmark"] = req.body.landmark;
                mycart["mobileno"] = req.body.mobileno;
                mycart["pincode"] = req.body.pincode;
                //Decrementing product count
                var index;
                for (index = 0; index < mycart.mycart.length;index++) {
                    var productId = mycart.mycart[index]['item']['_id'];
                    console.log(productId);
                    (function(index) {
                        Product.findById(productId, function(err, product) 
                        {
                           if (err) {
                               console.log("Cannot find product ID : " + productId + ", err : " + err);
                               return res.redirect('/');
                           }
                           //find how many items purchased
                           console.log("index = " + index);
                           var quantity = mycart.mycart[index]['qty'];
                           console.log(quantity);
                           if ( null!= product)
                           {
                        	   product.stock -=quantity;
                        	   if ( product.stock < 0 )
                        	   {
                        		   console.log("Product Sold Out");
                        		   product.stock = 0 ;

                        	   }
                        	   product.save(); 
                           }
                           else
                           {
                        	   console.log("Product pointing to null");
                            }

                        });
                    })(index);
                }


                //End decrementing product count
                console.log("req.body");
                console.log(req.body);
                console.log("MyCart");
                console.log(mycart);



                var source2 = '<div class="container">' + 
                               '<h3>Ordered Items</h3>' + 
                               '<table>' + 
                                  '<thead>' + 
                                   '<tr>' + 
                                     '<th>Product</th>' + 
                                     '<th>Quantity</th>' + 
                                     '<th>Price</th>' + 
                                     '<th>Total</th>' + 
                                   '</tr>' + 
                                 '</thead>' + 
                                 '<tbody>' + 
                                    '{{#mycart}}' +
                                     '<tr>' + 
                                       '<td><center>{{item.title}} - {{item.description}}</center></td>' + 
                                       '<td><center>{{qty}}</center></td>' + 
                                       '<td><center>Rs.{{item.price}}</center></td>' + 
                                       '<td><center>Rs.{{price}}</center></td>' + 
                                      '</tr>' + 
                                   '{{/mycart}}' +
                                    '<tr>' + 
                                       '<td></td>' + 
                                       '<td></td>' + 
                                       '<td><h4>Total Price</h4></td>' + 
                                       '<td>Rs.{{totalPrice}}</td>' + 
                                     '</tr>' + 
                                     '<tr> </tr>' +
                                      '<tr>' + 
                                       '<td>Name</td>' + 
                                       '<td>{{name}}</td>' + 
                                       '<td>Address</td>' + 
                                       '<td>{{address}}</td>' + 
                                      '</tr>' +
                                      '<tr>' + 
                                       '<td>landmark</td>' + 
                                       '<td>{{landmark}}</td>' + 
                                       '<td>Pincode</td>' + 
                                       '<td>{{pincode}}</td>' + 
                                      '</tr>' +
                                      '<tr>' + 
                                       '<td>Mobile No</td>' + 
                                       '<td>{{mobileno}}</td>' + 
                                       '<td></td>' + 
                                       '<td></td>' + 
                                      '</tr>' +
                                 '</tbody>' + 
                               '</table>' + 
                             '</div>';

                var template = Handlebars.compile(source2);


                // var data = { "Product": "Product", "Quantity": "Quantity",
                //              "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};
                var result = template(mycart);

                console.log(result);

                //mail sending
                mailOptions.to = req.user.email;
                mailOptions.text = JSON.stringify(order);
                mailOptions.html = result;
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        return console.log(error);
                    }
                    console.log('Message sent: ' + info.response);
                    console.log('Email sent to : ' + mailOptions.to);
                });


                req.flash('success', 'Successfully bought product, Check your email for details');
                req.session.cart = null;
                res.redirect('/');
            }
        });
    /*
    var stripe = require("stripe")(
        "sk_test_fwmVPdJfpkmwlQRedXec5IxR"
    );

    stripe.charges.create({
        amount: cart.totalPrice * 100,
        currency: "usd",
        source: req.body.stripeToken, // obtained with Stripe.js
        description: "Test Charge"
    }, function(err, charge) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/checkout');
        }
        var order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: charge.id
        });
        order.save(function(err, result) {
            req.flash('success', 'Successfully bought product!');
            req.session.cart = null;
            res.redirect('/');
        });
    });*/ 
});

router.get('/filter', function(req, res, next) {
	//var splitParams = (req.params.id).split(" ");
	
	console.log(req.url);
	var regex = /[?&]([^=#]+)=([^&#]*)/g,
    url = req.url,
    params = {},
    match;
	while(match = regex.exec(url)) {
		params[match[1]] = match[2];
	}
	console.log(params);
	//console.log(splitParams);
	console.log("Filter applied");
    var successMsg = req.flash('success')[0];
    Product.find(function (err, docs) {
        var productChunks = [];
        var chunkSize = 1;
        var validPriceRange;
        var validBrand;
        var validFuelType;
        var validVehicleType;
        var validMileage;
        for (var i = 0; i < docs.length; i += chunkSize) {
        	//PriceRange
        	if (params["1lakhto3lakh"] == undefined
        			&& params["3lakhto5lakh"] == undefined
        			&& params["5lakhto10lakh"] == undefined
        			&& params["10lakhto20lakh"] == undefined )
        	{
        		validPriceRange = true;
        	}
        	else
        	{
        		validPriceRange = false;
        		if ( 1 < docs[i].price && 3 > docs[i].price )
        		{
        			if( params["1lakhto3lakh"]!=undefined &&  params["1lakhto3lakh"]=="on" )
        			{
        				validPriceRange = true;
        				console.log("Inside Filter");
        			}
        			else
        			{
        				console.log("Outside Filter");
        			}
        			console.log("Price between 1 lakh to 3 lakh");
        		}
        		else if ( 3 < docs[i].price && 5 > docs[i].price )
        		{
        			if( params["3lakhto5lakh"]!=undefined &&  params["3lakhto5lakh"]=="on" )
        			{
        				validPriceRange = true;
        				console.log("Inside Filter");
        			}
        			else
        			{
        				console.log("Outside Filter");
        			}
        			console.log("Price between 3 lakh to 5 lakh");
        		}
        		else if ( 5 < docs[i].price && 10 > docs[i].price )
        		{
        			if( params["5lakhto10lakh"]!=undefined &&  params["5lakhto10lakh"]=="on" )
        			{
        				validPriceRange = true;
        				console.log("Inside Filter");
        			}
        			else
        			{
        				console.log("Outside Filter");
        			}
        			console.log("Price between 5 lakh to 10 lakh");
        		}
        		else if ( 10 < docs[i].price && 20 > docs[i].price )
        		{
        			if( params["10lakhto20lakh"]!=undefined &&  params["10lakhto20lakh"]=="on" )
        			{
        				validPriceRange = true;
        				console.log("Inside Filter");
        			}
        			else
        			{
        				console.log("Outside Filter");
        			}

        			console.log("Price between 10 lakh to 20 lakh");        		
        		}

        	}
        	//Brand
        	if (params["Maruti"] == undefined
        			&& params["hyundai"] == undefined
        			&& params["chevorlet"] == undefined
        			&& params["Renault"] == undefined )
        	{
        		validBrand = true;
        	}
        	else
        	{
        		validBrand = false;
        		if ( "Maruti" == docs[i].brand )
        		{
        			if( params["Maruti"]!=undefined &&  params["Maruti"]=="on" )
        			{
        				validBrand = true;
        				console.log("Inside Filter");
        			}
        			else
        			{
        				console.log("Outside Filter");
        			}
        			console.log("Brand is Maruti");
        		}
        		else if (  "hyundai" == docs[i].brand )
        		{
        			if( params["hyundai"]!=undefined &&  params["hyundai"]=="on" )
        			{
        				validBrand = true;
        				console.log("Inside Filter");
        			}
        			else
        			{
        				console.log("Outside Filter");
        			}
        			console.log("Brand is hyundai");
        		}
        		else if (  "chevorlet" == docs[i].brand )
        		{
        			if( params["chevorlet"]!=undefined &&  params["chevorlet"]=="on" )
        			{
        				validBrand = true;
        				console.log("Inside Filter");
        			}
        			else
        			{
        				console.log("Outside Filter");
        			}
        			console.log("Brand is chevorlet");
        		}
        		else if (  "Renault" == docs[i].brand )
        		{
        			if( params["Renault"]!=undefined &&  params["Renault"]=="on" )
        			{
        				validBrand = true;
        				console.log("Inside Filter");
        			}
        			else
        			{
        				console.log("Outside Filter");
        			}

        			console.log("Brand is Renault");        		
        		}

        	}

        	//FuelType
        	if (params["Diesel"] == undefined
        			&& params["Petrol"] == undefined)
        	{
        		validFuelType = true;
        	}
        	else
        	{
        		validFuelType = false;
        		if ( "Diesel" == docs[i].fueltype )
        		{
        			if( params["Diesel"]!=undefined &&  params["Diesel"]=="on" )
        			{
        				validFuelType = true;
        				console.log("Inside Filter");
        			}
        			else
        			{
        				console.log("Outside Filter");
        			}
        			console.log("Fuel Type is Diesel");
        		}
        		else if (  "Petrol" == docs[i].fueltype )
        		{
        			if( params["Petrol"]!=undefined &&  params["Petrol"]=="on" )
        			{
        				validFuelType = true;
        				console.log("Inside Filter");
        			}
        			else
        			{
        				console.log("Outside Filter");
        			}
        			console.log("FuelType is Petrol");
        		}

        	}

        	//Vehicle Type
        	if (params["Hatchback"] == undefined
        			&& params["Sedan"] == undefined
        			&& params["SUV"] == undefined
        			&& params["MUV"] == undefined )
        	{
        		validVehicleType = true;
        	}
        	else
        	{
        		validVehicleType = false;
        		if ( "Hatchback" == docs[i].vehicleType )
        		{
        			if( params["Hatchback"]!=undefined &&  params["Hatchback"]=="on" )
        			{
        				validVehicleType = true;
        				console.log("Inside Filter");
        			}
        			else
        			{
        				console.log("Outside Filter");
        			}
        			console.log("vehicleType is Hatchback");
        		}
        		else if (  "Sedan" == docs[i].vehicleType )
        		{
        			if( params["Sedan"]!=undefined &&  params["Sedan"]=="on" )
        			{
        				validVehicleType = true;
        				console.log("Inside Filter");
        			}
        			else
        			{
        				console.log("Outside Filter");
        			}
        			console.log("vehicleType is Sedan");
        		}
        		else if (  "SUV" == docs[i].vehicleType )
        		{
        			if( params["SUV"]!=undefined &&  params["SUV"]=="on" )
        			{
        				validVehicleType = true;
        				console.log("Inside Filter");
        			}
        			else
        			{
        				console.log("Outside Filter");
        			}
        			console.log("vehicleType is SUV");
        		}
        		else if (  "MUV" == docs[i].vehicleType )
        		{
        			if( params["MUV"]!=undefined &&  params["MUV"]=="on" )
        			{
        				validVehicleType = true;
        				console.log("Inside Filter");
        			}
        			else
        			{
        				console.log("Outside Filter");
        			}

        			console.log("vehicleType is MUV");        		
        		}
        		else
        		{
        			console.log("ERROR:No matching vehicle type");
        		}

        	}

        	//Mileage
        	if (params["10to15kmpl"] == undefined
        			&& params["15andabove"] == undefined )
        	{
        		validMileage = true;
        	}
        	else
        	{
        		validMileage = false;
        		if ( 10 <= docs[i].mileage && 15 >= docs[i].mileage)
        		{
        			if( params["10to15kmpl"]!=undefined &&  params["10to15kmpl"]=="on" )
        			{
        				validMileage = true;
        				console.log("Inside Filter");
        			}
        			else
        			{
        				console.log("Outside Filter");
        			}
        			console.log("Mileage is 10to15kmpl");
        		}
        		else if (  15 < docs[i].mileage )
        		{
        			if( params["15andabove"]!=undefined &&  params["15andabove"]=="on" )
        			{
        				validMileage = true;
        				console.log("Inside Filter");
        			}
        			else
        			{
        				console.log("Outside Filter");
        			}
        			console.log("Mileage is 15andabove");
        		}

        	}
        	console.log(docs[i].price);
	        if (true == validPriceRange
				&& true == validBrand
				&& true == validFuelType
				&& true == validVehicleType
				&& true == validMileage)
       		{
                productChunks.push(docs.slice(i, i + chunkSize));       		
       		}
        }
        //console.log(productChunks);
        console.log(docs);
        res.render('shop/index', {title: 'TheCar.com', products: productChunks, successMsg: successMsg, noMessages: !successMsg, '1lakhto3lakh':'on'});
    });
});


module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}

function sendMail(req,res,next) {

}
