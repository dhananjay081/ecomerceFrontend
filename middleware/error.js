const errorHandler = require("../utils/errorHandler");

module.exports = (err,  req ,res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // wrong Mongodb  Id error
    if(err.name === "CastError"){
        const message = `Resouce not found . Invalid: ${err.path}`;
        err = new errorHandler(message, 400);
    }
    // mongoose duplicate key error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new errorHandler(message,400);
    }

    // Wrong Jwt error
    if(err.name === "JsonWebTokenError"){
        const message = `Json Web Token is invalid, Try again `;
        err = new errorHandler(message,400);
    }
    // JWT Expire error
    if(err.name === "TokenExpiredError"){
        const message = `Json Web Token is Expire, Try again`;
        err = new errorHandler(message,400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
        
    });
};