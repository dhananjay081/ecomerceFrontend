const catchAsyncErrors = require("./catchAsyncError");
const User = require("../models/usermodel");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    // Debugging: Check if the token is present
    if (!token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    
    if (token.split('.').length !== 3) {
        return next(new ErrorHandler("Invalid token format", 400));
    }

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedData.id);
        if (!req.user) {
            return next(new ErrorHandler("User not found with this token", 404));
        }
        next();
    } catch (error) {
        return next(new ErrorHandler("Invalid or expired token", 401));
    }
});

exports.authorizeRoles = (...roles)=>{
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
           return next( new ErrorHandler(
                `Role: ${req.user.role} is not allowed to access this resource`,403
            ))
        }
        next();
    };
}