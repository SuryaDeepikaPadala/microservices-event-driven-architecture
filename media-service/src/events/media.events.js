const Media = require("../models/media.model")
const { deleteFromCloudinary } = require("../utils/cloudinary")
const logger = require("../utils/logger")

const deletePostEvent=async(event)=>{
  try {
    const{postId,mediaIds}=event
    const medias=await Media.find({_id:{$in:mediaIds}})
    for(const media of medias)
    {
      await deleteFromCloudinary(media?.publicId)
      await Media.findByIdAndDelete(media?._id)
      logger.info(`assert deleted from cloudinary ${media.publicId}`)
      logger.info(`media doc deleted successfully for post ${postId}`)
    }
    logger.info(`processed routing key post.deleted`)
  } catch (error) {
    logger.error(`error while deleting the media`,error)
  }
}
module.exports={deletePostEvent}