
const logger = require("../utils/logger")
const jwt=require("jsonwebtoken")
const authMiddleware=async(req,res,next)=>{
  const headers=req.headers.authorization
  const token=headers&& headers.startsWith("Bearer")&& headers.split(" ")[1]
  try {
    if(!token)
    {
    logger.warn("Token required")
    return res.status(400).json({
      success:false,
      message:"Token required"
    })
    }
    const decoded=jwt.verify(token,process.env.JWT_SECRET)
    const {userId}=decoded
    req.userId=userId
    next()
  } catch (error) {
    logger.error("error at api gateway auth middleware",error)
    res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}
module.exports=authMiddleware