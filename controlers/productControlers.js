const Product = require("../models/productmodel");
const Errorhander = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const ApiFeacture = require("../utils/apiFeacture");
const errorHandler = require("../utils/errorHandler");
const cloudinary = require ("cloudinary");






// Get All Products
exports.getAllProduct = catchAsyncErrors(async (req, res) => {
    const resultPerPage = 8;
    const productsCount = await Product.countDocuments();
  

    const apiFeature = new ApiFeacture(Product.find(), req.query).search().filter()
    
    let products = await apiFeature.query;

    let filteredProductsCount = products.length;
    apiFeature.pagination(resultPerPage);
    // products = await apiFeature.query;

    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
    });
});

// Get All Products (Admin)
exports.getAdminProduct = catchAsyncErrors(async (req, res , next) => {
    
  const products = await Product.find();

  if(!products){
      return next(new Errorhander("Product not found", 404))
  }

    res.status(200).json({
        success: true,
        products,
       
    });
});


// Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});


// update product by admine
exports.updateProduct = catchAsyncErrors(async(req,res,next)=>{
    let product = await Product.findById(req.params.id);
    
    if(!product){
        return next(new Errorhander("Product not found",404))
      }
      // Images Start Here
      
        let images = [];

        if (typeof req.body.images === "string") {
          images.push(req.body.images);
        } else {
          images = req.body.images;
        }

        if (images !== undefined) {
          // Deleting Images From Cloudinary
          for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
          }

          const imagesLinks = [];

          for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
              folder: "products",
            });

            imagesLinks.push({
              public_id: result.public_id,
              url: result.secure_url,
            });
          }

          req.body.images = imagesLinks;
        }
        product = await Product.findByIdAndUpdate(req.params.id , req.body,{
            new:true,
            runValidator: true,
            useFinndAndModify : false
        });
        res.status(200).json({
            success:true,
            product
        })
})

// delete Product 

exports.deleteProduct =catchAsyncErrors(async (req , res, next)=>{
    let product  = await Product.findById(req.params.id);
    
    if(!product){
        return next(new Errorhander("Product not found",404))
    }

    //Deleting product
    for(let i = 0; i<product.images.length; i++){
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.deleteOne({_id:req.params.id});
    res.status(200).json({
        success:true,
        message:"Product Deleted Succesfully"
    })
})
// get Product detail
exports.productDetail = catchAsyncErrors( async(req, res ,next)=>{
    const product  = await Product.findById(req.params.id);

    if(!product){
        return next(new Errorhander("Product not found",404))
    }

    res.status(200).json({
       success:true,
       product
      //  productCount,
    })
})

//create New Review or update the review
    exports.createProductReview = catchAsyncErrors( async (req, res ,next)=>{
     const {rating , comment , productId} = req.body;

     const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
     };
     const product = await Product.findById(productId);

     const isReviewed = product.reviews.find(rev=> rev.user.toString()=== req.user._id.toString());

     if(isReviewed){
       product.reviews.forEach(rev => {
        if(rev.user.toString()=== req.user._id.toString())
            rev.rating = rating,
            rev.comment = comment
       });  
     }else{
        product.reviews.push(review);
        product.noOfReview  = product.reviews.length
     }
     
     let avg = 0;
     product.reviews.forEach((rev)=>{
        avg+=rev.rating;
      })
 
      let ratings = 0;
      if(product.reviews.length=== 0){
        ratings = 0;
      }else{
        product.ratings = avg/product.reviews.length;
      }
      
       await product.save({validateBeforeSave: false });

       res.status(200).json({
        success: true,
       });
    });
    
    // GEt all Review of a product
    exports.getProductReviews = catchAsyncErrors( async (req, res ,next)=>{
        const product = await Product.findById(req.query.id);
       
        if(!product){
            return next(new errorHandler("Product not found",400));
         }
         res.status(200).json({
            success:true,
            reviews: product.reviews,
         });
    });

    // delete Review 
    exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
        const { productId, id } = req.query;
      
        if (!productId || !id) {
          return next(new errorHandler("Product ID and Review ID are required", 400));
        }
      
        const product = await Product.findById(productId);
      
        if (!product) {
          return next(new errorHandler("Product not found", 400));
        }
      
        const reviews = product.reviews.filter(
          (rev) => rev._id.toString() !== id.toString()
        );
      
        if (reviews.length === product.reviews.length) {
          return next(new errorHandler("Review not found", 404));
        }
      
        // Calculate average rating
        let avg = 0;
        reviews.forEach((rev) => {
          avg += rev.rating;
        });
      
        const ratings = reviews.length ? avg / reviews.length : 0;
        const numOfReviews = reviews.length;
      
        await Product.findByIdAndUpdate(
          productId,
          {
            reviews,
            ratings,
            numOfReviews,
          },
          {
            new: true,
            runValidators: true,
            useFindAndModify: false, // corrected typo
          }
        );
      
        res.status(200).json({
          success: true,
        });
      });

 exports.getCategoryProduct = catchAsyncErrors(async (req, res, next) => {
    try{
      const productCategory = await Product.distinct("category")


      //array to store one product from each category
      const productByCategory = []

      for(const category of productCategory){
          const product = await Product.findOne({category })

          if(product){
              productByCategory.push(product)
          }
      }


      res.json({
          message : "category product",
          data : productByCategory,
          success : true,
          error : false
      })


  }catch(err){
      res.status(400).json({
          message : err.message || err,
          error : true,
          success : false
      })
  }
})

exports.getCategoryWiseProduct = catchAsyncErrors(async (req, res) => {
  try{
    const { category } = req?.body || req?.query
    const product = await Product.find({ category })

    res.json({
        data : product,
        message : "Product",
        success : true,
        error : false
    })
}catch(err){
    res.status(400).json({
        message : err.message || err,
        error : true,
        success : false
    })
}
})




      