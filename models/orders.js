const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema(
    {
        userId: {type: String, required: true},
        createdOn: {type:Date, default: Date.now},
        isComplete: {type:Boolean, default:false},
        products: {type:Array, required:true},
        orderDeliveryFee:{type:Number, required: true},
        orderCost:{type:Number, required: true},
        
    });
  
  module.exports = mongoose.model("Order", OrderSchema);