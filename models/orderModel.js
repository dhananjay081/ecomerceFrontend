const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    shippingInfo:{
        address:{
             type: String,
             requred: true
            },
        city: {
            type: String,
            required: true},
        state:{ 
            type:String, 
            require: true
         },
        country:{
            type: String, 
            requird: true
        },
        pincode: {
            type: Number,
             requird: true
        },
    },
    orderItems:[
    {
       name:{
        type: String, 
        requird: true
       },
       price:{
        type: Number,
         requird: true
       },
       quantity:{
        type: Number,
        requird: true
       },
       image:{
        type: String, 
        requird: true
       },
       product:{
        type: mongoose.Schema.ObjectId,
        ref:"Product",
        required: true,
       },
    },
  ],
  user:{
    type: mongoose.Schema.ObjectId,
    ref:"User",
    required: true,
  },
  paymentInfo:{
    id:{
        type:String,
        required:true
    },
    status: {
      type: String,
      required: true,
    },
  },
  paidAt:{
    type:Date,
    required: true,
  },
   itemsPrice:{
    type:Number,
    required:true,
    default:0,
   },
   textPrice:{
    type:Number,
    required:true,
    default:0,
   },
   shippingPrice:{
    type:Number,
    required:true,
    default: 0,
   },
   totalPrice: {
    type:Number,
    required: true,
    default: 0,
   },
   orderStatus:{
    type: String,
    required: true,
    default:"Processing",
   },
   deliveredAt: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Order",orderSchema);