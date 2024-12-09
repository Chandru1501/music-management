
exports.checkMissingParams = (requiredParams, requestBody)=>{
    const missingParams = requiredParams.filter(param => !(param in requestBody));
    return missingParams;
} 