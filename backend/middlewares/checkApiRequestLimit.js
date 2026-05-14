const asyncHandler = require("express-async-handler");

const checkApiRequestLimit = asyncHandler(async(req, res, next) =>{
    
    if(!req.user){
        return res.status(401).json({
            message: "not authorized"
        });
    }

    //* find the user
    const user = await User.findById(req?.user?.id);
        if(!user){
        return res.status(404).json({
            message: "user not found"
        });
    }

    let requestLimit = 0;
    //* check if the user is currently on a trial period
    if(user?.isTrialActive){
        requestLimit = user?.monthlyRequestCount; 
    }
    
    //* checking if the user has exceeded his monthly request limit
    if(user?.apiRequestCount >= requestLimit){
        throw new Error("API request limit exceeded, please subscribe to the plan to access new features.");
    }
    next();
});

module.exports = checkApiRequestLimit;