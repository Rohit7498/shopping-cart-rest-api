const mongoose = require('mongoose')

const CartSchema = new mongoose.Schema({
    cartId: {
        type: String,
        required: true,
        unique: true
    },  
    userId: {
    type: String,
    required: true,
    },
    products: {type: Array, default: []},
    active: {
    type: Boolean,
    default: true
    },
    totalCost: {
        type: Number,
        default: 0
    },
    totalItems: {
    type: Number,
    default: 0
},
});
  
  module.exports = mongoose.model("Cart", CartSchema);
