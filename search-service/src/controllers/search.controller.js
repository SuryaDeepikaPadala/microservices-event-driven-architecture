const Search = require("../models/search.model")
const logger = require("../utils/logger")

const handleSearch=async(req,res)=>{
  const {query}=req.query
  try {
    logger.info("serach endpoint hit")
    const result=await Search.find({$text:{$search:query}},{score:{$meta:"textScore"}}).sort({score:{$meta:"textScore"}})
    res.status(200).json({
      success:true,
      result
    })
  } catch (error) {
    logger.error("error while searching posts",error)
    res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}
module.exports=handleSearch