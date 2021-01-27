const express = require('express')
const router = express.Router()
const User = require('../models/user')

//get all carts /shoppingCarts
router.get('/', async (req, res)=>{
    try {
        const users = await User.find()
        res.json(users)
    } catch (error) {
        res.status(500).json({message: error})
    }
})
//get a specific user /user/<userId>
router.get('/:id', (req, res)=>{
    res.send(req.params.id)
})
//POST: add users to shoppingCarts/<userId>/add
router.post('/', async (req, res)=>{
    const user = new User({
        userId: req.body.userId,
        userName: req.body.userName
    })

    try {
        const newUser = await user.save()
        res.status(201).json(newUser)
    } catch (error) {
        res.status(400).json({message: error})
    }

})


// delete products shoppingCarts/<userId>/remove/<orderId><productId>

//POST: shoppingCart/userId/complete



module.exports = router