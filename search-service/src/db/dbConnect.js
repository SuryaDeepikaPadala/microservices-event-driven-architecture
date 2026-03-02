const mongoose=require("mongoose")
const logger = require("../utils/logger")
const dbConnection=async()=>{
  try {
    await mongoose.connect(process.env.MONGO_URI)
    logger.info("database connected successfully")
  } catch (error) {
    logger.error("error while connecting to the database",error)
  }
}
module.exports=dbConnection