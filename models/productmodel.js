// const { default: mongoose } = require("mongoose");
const newMongoos = require("mongoose");

const productSchema  = newMongoos.Schema({
    name:{
        type:String,
        required:[true,"Please Enter the Product Name"],
        trim: true
    },
    description:{
        type:String,
        required:[true,"Please Enter Product Description"]
    },
    price:{
        type:Number,
        required:[true,"Please Enter Product Price"],
        maxLength: [8,"Price cannot exceed 8 characters"]
    },
    ratings:{
        type:Number,
        default:0
    },

    images:[
        {
            public_id:{
                type:String,
                required: true
            }, 
            url:{
                type:String,
                required: true
            }
        }
    ],
     
   category:{
    type:String,
    requited: [true,"Please enter the product category"]
   },

   Stock:{
    type:Number,
    requited: [true,"Please enter the product stock"],
    maxLength: [4,"Stock cannot ecxeed 4 characters"]
   },

  noOfReview:{
    type:Number,
    default:0
   },

   reviews:[
    {
        user: {
            type: newMongoos.Schema.ObjectId,
            ref: "User",
            require: true,
          },
        name:{
            type:String,
            required:true,
        },
        rating:{
            type:Number,
            required:true,
        },
        comment:{
            type:String,
            required:true,
        }
    }
   ],
   user: {
     type: newMongoos.Schema.ObjectId,
     ref: "User",
     require: true,
   },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = newMongoos.model("Product",productSchema);