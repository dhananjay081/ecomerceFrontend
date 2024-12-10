const Order = require("../models/orderModel");
const Product = require("../models/productmodel");
const errorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const mongoose = require("mongoose");

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

// get Single Order

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new errorHandler("Order not found this id", 404));
  }

  res.status(200).json({
    sucess: true,
    order,
  });
});

// get logged in user Orders

exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

// get All Orders --> Admin
exports.getAllOrder = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;
  orders.forEach((order)=>{
    totalAmount+=order.totalPrice;
  })

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// Update Order Status --> Admin
exports.UpdateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new errorHandler("Order not found this id", 404));
  }
  
  if(order.orderStatus === "Delivered"){
    return next(new errorHandler("You have allready delivered this order",400))
  }
    if(req.body.status === "Shipped"){
      order.orderItems.forEach(async (item) => {
        await updateStock(item.product._id, item.quantity);
      });
    }
    
  order.orderStatus = req.body.status;
  if(req.body.status === "Delivered"){
    order.deliveredAt = Date.now();
  }

  await order.save({validateBeforeSave: false})

  res.status(200).json({
    success: true, 
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  if (!product) {
    throw new Error("Product not found");
  }

  product.Stock -= quantity;
  await product.save({ validateBeforeSave: false });
}


// delete Order --> Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new errorHandler("Order not found this id", 404));
  }

  await order.deleteOne();
  res.status(200).json({
    success: true,
  });
});