const Search = require("../models/search.model")
const logger = require("../utils/logger")

const deleteSearchPostEventhandler=async(event)=>{
  const {postId}=event
  try {
    const res=await Search.findOneAndDelete({postId})
    logger.info(`search model deleted by deleting the post ${postId}`)
  } catch (error) {
    logger.info("error while deleting the serach model on deleting of post model",error)
  }
}
const createSearchPostEventHandler=async(event)=>{
  const {postId,userId,content,createdAt}=event
  try {
    const newsearchPost=await Search.create({
      postId,
      content,
      userId,
      createdAt
    })
    logger.info(`search model is created successfully for post ${postId}`)
    
  } catch (error) {
    
    logger.error(`error while creating a search model for post ${postId}`)
  }
}
module.exports={deleteSearchPostEventhandler,createSearchPostEventHandler}