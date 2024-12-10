const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const User = require("../models/usermodel");
const sendToken = require("../utils/jwtToken");
const errorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto");
const cloudinary = require("cloudinary")

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    try {
        let myCloud;
        if (req.body.avatar && req.body.avatar !== "undefined") {
            myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
                folder: "avatars",
                width: 150,
                crop: "scale",
            });
        } else {
            myCloud = {
                public_id: "default_avatar",
                secure_url: "/public/Profile.png", 
            };
        }
        const { name, email, password } = req.body;

        const user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            },
        });

        const token = user.getJWTToken();
        sendToken(user, 201, res);
    } catch (error) {
        console.error("Registration Error:", error);
        return next(error);
    }
});


// LogIn User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    console.log("LOGIN USER = ",req.body)

    // Checking if user has given password and email both
    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email & Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }
    const token = user.getJWTToken();
    sendToken(user, 200, res);
});

// LogOut User
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged Out",
    });
});

//Forget password
exports.forgetPassword = catchAsyncErrors(async(req, res, next)=>{
   const user = await User.findOne({email:req.body.email});
   if(!user){
    return next(new ErrorHandler("User not found ",404));
   }

   // Get ResetPassword Token
   const resetToken = user.getResetPasswordToken();

   await user.save({validateBeforeSave : false});
   
    // const resetPasswordUrl = `${req.protocol}://${req.get("hostcls")}/password/reset/${resetToken}`

   const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

   const message = `Your password reset token is :- \n\n ${resetPasswordUrl}\n\nIf you have not requested this  email then please ignore it `;
   try {
    await sendEmail({
        email:user.email,
        subject:`Ecommerse Password Recovery`,
        message,
    })
    res.status(200).json({
        success:true,
        message: `Email send to ${user.email} successfully`,
    });
   } catch (error) {
    user.resetPasswordToken = undefined ;
    user.resetPasswordExpire = undefined;
    
    await user.save({validateBeforeSave : false});
    return next(new errorHandler(error.message,500))
   }
});

exports.resetPassword = catchAsyncErrors(async(req, res, next)=>{
    // creating token hash

    const resetPasswordToken = crypto
          .createHash("sha256")
          .update(req.params.token)
          .digest("hex");
    
   const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {$gt: Date.now()},
   });
  if(!user){
    return next(new errorHandler("Reset Password Token is invalid or hhas been exprired",400))
  }

  if(req.body.password !== req.body.confirmPassword){
    return next(new errorHandler("Password does not passwoerd",400))
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save()

  sendToken(user , 200 , res);
});

// GEt user detail
exports.getUserDeatils = catchAsyncErrors(async (req, res, next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        sucess: true,
        user,
    })
})

// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next)=>{
    

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 400));
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("password does not matched", 400));
    }
  
    user.password = req.body.newPassword;

     await user.save()
     sendToken(user, 200, res);

    })

    // update profile
    exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
        const newUserData = {
            name: req.body.name,
            email:  req.body.email,
            role: req.user.role,
        };
    
        if (req.body.avatar && req.body.avatar !== "") {
          const user = await User.findById(req.user.id); 
      
          const imageId = user.avatar.public_id;
      
          await cloudinary.v2.uploader.destroy(imageId);
      
          const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
          });
      
          newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        }
      
        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
          new: true,
          runValidators: true,
          userFindAndModify: false,
        });

        res.status(200).json({
          success: true, 
        });
      });


      
// get all user (admin)
exports.getAllUser = catchAsyncErrors( async(req, res ,next)=>{
   
    const users = await User.find();

    res.status(200).json({
       success:true,
       users
    })
})

// Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new errorHandler(`User does not exist with id: ${req.params.id}`))
    }

    res.status(200).json({
        sucess: true,
        user,
    })
})

 // update User Role -- Admin
 exports.updateUserRole = catchAsyncErrors(async (req, res, next)=>{
    
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role: req.body.role,
    };
     
    let user = User.findById(req.params.id);

    if(!user){
        return next(new errorHandler(`User does not exist with Id : ${req.params.id}`,400))
    }
    

     user = await User.findByIdAndUpdate(req.params.id, newUserData,{
        new:true,
        runValidators: true,
        userFindAndModify: false,
    });
    
  
    res.status(200).json({
        sucess:true,
    });   
 })

 // Delete User -- Admin
 exports.deleteUser = catchAsyncErrors(async (req, res, next)=>{
    
    const user= await User.findById(req.params.id);

    if(!user){
        return next(new errorHandler(`User does not exist with Id : ${req.params.id}`,400))
    }
     
    const imgaeId = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imgaeId);


    await user.deleteOne(); 
    res.status(200).json({
        sucess:true,
        message:"User Deleted Successfuly"
    });   
 })