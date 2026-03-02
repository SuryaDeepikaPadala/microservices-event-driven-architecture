const logger = require("./logger")

const cloudinary=require("cloudinary").v2
cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key:process.env.API_KEY,
  api_secret:process.env.API_SECRET
})
const uploadToCloudinary=async(filePath)=>{
  try {
    const result=await cloudinary.uploader.upload(filePath)
    return result
  } catch (error) {
    logger.error("Error while uploading to cloudinary")
    return res.status(400).json({
      success:false,
      message:"Internal server error"
    })
  }
}
const deleteFromCloudinary=async(publicId)=>{
  try {
    const result=await cloudinary.uploader.destroy(publicId)
    logger.info("Media deleted from cloudinary",publicId)
    return result
  } catch (error) {
    logger.error("error while deleting media from cloudinary",error)
  }
}
module.exports={uploadToCloudinary,deleteFromCloudinary}