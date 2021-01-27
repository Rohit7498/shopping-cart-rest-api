const express = require('express')
const cart = require('../models/cart')
const router = express.Router()
const Cart = require('../models/cart')
const Order = require('../models/orders')

// ------------------- CART ---------------------------------

//get all carts /shoppingCarts
router.get('/', async (req, res)=>{
    const carts = await Cart.find()
    res.json(carts)
})


/*************
// //get a specific cart /shoppingCarts/<userId>
// router.get('/:id', (req, res)=>{
//     res.send(req.params.id)
// })
**************/


//POST: add new carts to shoppingCarts/
router.post('/', async (req, res)=>{
    const cartId = req.body.cartId
    const userId = req.body.userId
    const cartExist = await Cart.find({userId: userId})
    
    //Assingn a cart to only a single user
    if(cartExist.length==0){
        const cart = new Cart({
            cartId: cartId,
            userId: userId
        })
        try {
            const newCart = await cart.save()
            res.status(201).json(newCart) 
        } catch (error) {
            res.status(400).json({message: error})
        }
    }else{
        res.status(400).json({message: "cart already assingned"});

    }
})


//-------- POST: add new products to cart shoppingCarts/
router.post('/add', async (req, res)=>{
    const cartId = req.body.cartId
    //console.log(req.body.cartId)
    let productsToAdd = req.body.products;
    const curCart = await Cart.findOne({cartId: cartId});
    console.log("...."+curCart)
    
    //check whether its a valid cart    
    if(curCart === null){
        res.status(400).json({message: "Cart does not exists"})
    }
    
    let curProducts = curCart.products;
    //console.log("cart..."+typeof curCart)
    //console.log(productsToAdd);
    //console.log(curCart);
    // get all the ids of the products to add
    let productIds = {};
    //console.log(curProducts)
    productsToAdd.forEach(product => {
        productIds[product.productId] = 1;
    });
    //console.log(productIds);

    // Compare if products to add already exists then increment its qty by 1 
    if(curProducts !== undefined){
        curProducts.forEach(product=>{
            
            console.log(product.amount +"type..." + typeof product.amount)
            product.amount = Number(product.amount);
            if(product.productId in productIds){
                product.amount += 1;
                productIds[product.productId] = 0
            }
            
        })
        //console.log(curProducts)
        // Add the not present products to the cur Product which are not present
        productsToAdd = productsToAdd.filter(product=>{
            return productIds[product.productId] === 1; // new products
        })
        //console.log(productsToAdd)

        if(productsToAdd.length!==0){
            productsToAdd.forEach(product=>{
                curProducts.push(product);
            })
        } 

    }else{
        curProducts = productsToAdd
    }

    
    //Cast to number and calculate the total Cost and update cart cost
    var curCost = 0;
    
    //console.log(curProducts)
    curProducts.forEach(product=>{
        product.amount = Number(product.amount);
        product.price = Number(product.price);
        //console.log(typeof price + "... "+ typeof amount)
        curCost = curCost + (product.amount * product.price);
        //console.log(curCost + "...."+typeof curCost)
    });
    //console.log(curCost);


    // update the cart with the changes
    const updatedCart = await Cart.findOneAndUpdate({cartId: cartId}, { $set: { products: curProducts, totalCost: curCost,  totalItems: curProducts.length}});
    
    res.json(updatedCart);
})

//POST: aremove a product from a cart shoppingCarts/<cartId>/remove/<productId>
router.post('/:cartId/remove/:productId', async (req, res)=>{
    const cartId = req.params.cartId
    const productId = req.params.productId
    try {
        const curCart = await Cart.findOne({cartId: cartId});
        //console.log(curCart);
        if(curCart === null){
            res.status(404).json({message: `${req.params.cartId} does not exists`});
        }else{

            let allProducts = curCart.products
            // get the product with the id
            let idToRemove;
            for(let i=0; i<allProducts.length; i++){
                product = allProducts[i];
                if(product.productId === productId){
                    if(Number(product.amount) > 1){
                        console.log(product.amount)
                        product.amount = product.amount - 1;
                    }else if(product.amount === 1){
                        idToRemove = product.productId;
                    }
                    break;
                }
            }
            // remove if count is just 1
            if(idToRemove !== undefined){
                allProducts = allProducts.filter(product => product.productId !== idToRemove);
            }

            let curCost = 0;
            allProducts.forEach(product=>{
                product.amount = Number(product.amount);
                product.price = Number(product.price);
                //console.log(typeof price + "... "+ typeof amount)
                curCost += (product.amount * product.price);
                //console.log(curCost + "...."+typeof curCost)
            });
            try {
                const updatedCart = await Cart.findOneAndUpdate({cartId: cartId}, { $set: { products: allProducts, totalCost: curCost,  totalItems: allProducts.length}});
                res.json(updatedCart);       
            } catch (error) {
                res.status(400).send({message: error})
            }
        }
    } catch (error) {
        console.log("error.."+error)
    }
    

})

// ------------------- ORDERS ---------------------------------


function diff_hours(dt2, dt1) 
 {
    
  var diff =Math.abs(dt2.getTime() - dt1.getTime()) / 1000;
  diff /= (60 * 60);
  console.log("Time.."+Math.abs(Math.round(diff)));
  return Math.abs(Math.round(diff));
  
 }

 //POST: create orders for a user shoppingCarts/<userId>/add
router.post('/:userId/add', async (req, res)=>{
    try {

        const curCart = await Cart.findOne({userId: req.params.userId});
        if(curCart === null){
            res.status(404).json({message: 'Not Found'})
        }
        console.log(curCart);
        

        // get all the products currently
        let allProducts = curCart.products;

        //calculate the total order cost
        orderCost = curCart.totalCost;

        // get the products with delivery flag
        let deliveryProducts = allProducts.filter(product=>{
            return (product.deliveryType === "DELIVERY");
        }) 
        console.log("Delivery..."+deliveryProducts)
        //seggregate as schedule or express
        const timeNow = new Date();
        let expressProducts=[];
        let scheduledProducts=[];
        
        deliveryProducts.forEach(product=>{

            let serviceDateString = product.serviceDate;
            serviceDateString = serviceDateString.replace("T", " ");
            serviceDateString = serviceDateString.replace("Z", "");

            const serviceDate = new Date(serviceDateString);
            const hrsDiff = diff_hours(serviceDate, timeNow)

            if(hrsDiff <= 4){
                expressProducts.push(product);
            }else{
                scheduledProducts.push(product);
            }
        })
        console.log("Express.."+expressProducts);
        console.log("Scheduled.."+scheduledProducts);
        

        
        // calculate the delivery cost/fee
        let orderDeliveryFee = 0;
        let totalExpressCost = 0;
        let isHavingExpensiveProduct = false
        expressProducts.forEach(product=>{
            totalExpressCost += Number(product.price);
            if(Number(product.price) > 2000) isHavingExpensiveProduct = true;
        })
        
        let totalScheduledCost = 0;
        scheduledProducts.forEach(product=>{
            totalScheduledCost += Number(product.price);
            if(Number(product.price) > 2000) isHavingExpensiveProduct = true;
        })

        // Delivery fee logic
        if(isHavingExpensiveProduct){
            orderDeliveryFee += 199
        }else{
            if(totalExpressCost < 60){
                orderDeliveryFee += 38
            }else{
                orderDeliveryFee += 28
            }
            if(totalScheduledCost < 60){
                orderDeliveryFee += 28
            }else{
                orderDeliveryFee += 19
            }
        }
        
        console.log("DeliveryFee..."+orderDeliveryFee);
        console.log("OrderCost" + orderCost)
        console.log(allProducts)
        

        // Create the new order and save it
        
        const order = new Order({
                userId: req.params.userId,
                products: allProducts,
                orderDeliveryFee: orderDeliveryFee,
                orderCost: orderCost
        })

    
        try{
            const updateCart = await Cart.findOneAndUpdate({userId: req.params.userId}, { $set: { products: [], totalCost: 0,  totalItems: 0}});   
            console.log("Updated Cart.."+updateCart)
            const newOrder = await order.save()
            res.status(201).json(newOrder);
        } catch (error) {
            res.status(400).json({message: error})
        }

        

    } catch (error) {
        res.status(400).json({message: error})        
    }


})


// delete products shoppingCarts/<userId>/remove/<orderId>/<productId> ---> isCompleted = false
router.post('/:userId/remove/:orderId/:productId', async (req, res)=>{
    const userId = req.params.userId;
    const orderId = req.params.orderId;
    const productId = req.params.productId;
    console.log(productId)
    console.log(orderId);
    try {
        const order = await Order.findById({_id: orderId});
        console.log(order)
        let allProducts = order.products;
        if(order.isComplete === true){
            res.status(405).json({message:"Order cannot be updated"})
        } 

        console.log("allPr.."+allProducts)
        let newProducts = allProducts.filter(product => {
            if(product.productId)
            return product.productId !== productId
        })

        console.log("newPr.."+newProducts)
        const updateOrder = await Order.findOneAndUpdate({_id:orderId}, {$set: {products:newProducts}})
        res.json(updateOrder);

    } catch (error) {
        res.status(400).json({message: error});
    }
    
    

})



//POST: complete the order by marking is as isComplete shoppingCart/userId/complete 
router.post('/:userId/complete', async (req, res) => {
    try {
        const updatedOrders = await Order.updateMany({ userId: req.params.userId }, { $set: {isComplete: true} });
        res.status(204).json(updatedOrders);

    } catch (error) {
        res.status(400).json({message: error});
    }
})

//get all orders
router.get('/orders', async (req, res)=>{
    const allOrders = await Order.find();
    res.json(allOrders)
})


//GET: get all the orders by a user with totals shoppingCart/userId/complete 
router.get('/:userId/', async (req, res) => {
    try {
        const allOrders = await Order.find({userId: req.params.userId});

        let totalDeliveryFee = 0
        let totalOrderCost = 0
        
        allOrders.forEach(order=>{
            totalOrderCost += order.orderCost
            totalDeliveryFee += order.orderDeliveryFee 
        })

        res.json({
            orders: allOrders,
            totalDeliveryFee: totalDeliveryFee,
            totalOrdersCost: totalOrderCost,
            totalCost: totalDeliveryFee + totalOrderCost
        })


    } catch (error) {
        res.status(400).json({message: error})
    }
})





module.exports = router