const logger = require("../utils/logger")

const authMiddleware=async(req,res,next)=>{
  try {
    const userId=req.headers['x-user-id']
    if(!userId)
    {
      logger.error("Unauthenticated user")
      return res.status(401).json({
        success:false,
        message:"Unauthenticated user"
      })
    }
    req.user={_id:userId}
    next()
  } catch (error) {
    logger.error("error while checking the user authentication in search service")
  }
}
module.exports=authMiddleware