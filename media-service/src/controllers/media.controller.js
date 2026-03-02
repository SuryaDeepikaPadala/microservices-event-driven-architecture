const Media = require("../models/media.model")
const { uploadToCloudinary } = require("../utils/cloudinary")
const logger = require("../utils/logger")
const fs=require("fs")
const uploadMediaController=async(req,res)=>{
  try {
    logger.info("upload media endpoint hit")
    if(!req.file)
    {
      logger.error("File not found")
      return res.status(404).json({
        success:false,
        message:"file  not found"
      })
    }
    logger.info("started uploading to cloudinary")
    const result=await uploadToCloudinary(req.file.path)
    logger.info("successfully uploaded")
    const mediaCreation=await Media.create({
      publicId:result?.public_id,
      mediaUrl:result?.secure_url,
      user:req.user?._id,
      originalName:req?.file?.originalname,
      mediaType:req?.file?.mimetype
    })
    logger.info("media created successfully")
    fs.unlinkSync(req.file.path)
    logger.info("file removed from uploads folder")
    res.status(201).json({
      success:true,
      media:mediaCreation
    })
  } catch (error) {
    logger.error("Error at uploading")
    res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}
const getAllMedia=async(req,res)=>{
  try {
    const mediadata=await Media.find({})
    res.status(200).json({
      success:true,
      mediadata
    })
  } catch (error) {
    logger.error("Error occured while fetching data from media")
    res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}
module.exports={uploadMediaController,getAllMedia}