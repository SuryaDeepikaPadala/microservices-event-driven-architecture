const mongoose=require("mongoose")
const logger = require("../utils/logger")
const dbConnection=async()=>{
  try {
    await mongoose.connect(process.env.MONGO_URI)
    logger.info("Database connected successfully")
  } catch (error) {
    logger.error("error occured while connecting to database",error)
  }
}
module.exports=dbConnection