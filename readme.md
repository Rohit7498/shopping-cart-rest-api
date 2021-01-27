# REST API FOR Shopping Cart - Ecommerce

### Shopping Cart
GET http://localhost:3000/shoppingCarts/

### Getting carts by cartId
GET http://localhost:3000/shoppingCarts/cartId

### Creating Carts
POST http://localhost:3000/shoppingCarts/
Content-Type: application/json

{
    "cartId": "Cart02",
    "userId": "User02"
}

### Add Products to Cart
POST http://localhost:3000/shoppingCarts/add
Content-Type: application/json


{
	"cartId": "Cart02",
	"products": [{
			"productId": "prod_03",
			"name": "Alfredo Pasta",
			"amount": 1,
			"price": 145,
			"deliveryType": "DELIVERY",
			"serviceDate": "2021-01-20T09:00:00.000Z",
			"serviceSchedule": "9:00-11:00",
			"supplier": "Not a fancy place"
		},
		{
			"productId": "prod_04",
			"name": "Banana Puddin",
			"price": 29,
			"amount": 1,
			"deliveryType": "DELIVERY",
			"serviceDate": "2021-01-20T09:00:00.000Z",
			"serviceSchedule": "9:00-11:00",
			"supplier": "Not a fancy place"
		}
	]
}

### Remove specific product
POST http://localhost:3000/shoppingCarts/cartId/remove/prodId
Content-Type: application/json


########## ORDERS ############

## Convert products in the cart of a user to order
POST http://localhost:3000/shoppingCarts/userId/add/
Content-Type: application/json


### Get Orders by specific users
GET http://localhost:3000/shoppingCarts/userId/


### Complete Orders by specific users
POST http://localhost:3000/shoppingCarts/userId/complete


### Remove products from Orders by specific users
POST http://localhost:3000/shoppingCarts/userId/remove/orderId/prodId


### Get all Orders
GET http://localhost:3000/shoppingCarts/orders/

##



################   USERS  #################

###
GET http://localhost:3000/users/


###
POST http://localhost:3000/users/
Content-Type: application/json

{
    "userId": "User02",
    "userName": "User 2"
}

###



