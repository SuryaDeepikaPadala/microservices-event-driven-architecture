const logger = require("../utils/logger")

const authMiddleware=async(req,res,next)=>{
  const userId=req.headers['x-user-id']
  try {
    if(!userId)
    {
      logger.warn("Unauthenticated user")
      return res.status(401).json({
        success:false,
        message:"Unauthenticated user"
      })
    }
    req.user={_id:userId}
    next()
  } catch (error) {
    logger.error("error at auth middleware post service",error)
    res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}
module.exports=authMiddleware