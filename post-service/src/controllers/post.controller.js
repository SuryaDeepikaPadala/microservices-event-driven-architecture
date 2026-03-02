const Post = require("../models/post.model")
const logger = require("../utils/logger")
const { publishEvent } = require("../utils/rabbitMq")
const postSchemaValidation = require("../utils/validation")
const invalidateGetPostsKey=async(req)=>{
  const keys=await req.redisClient.keys("posts:*")
  if(keys && keys.length>0)
  {
    await req.redisClient.del(keys)
  }
}
const createPost=async(req,res)=>{
  const{content,imageIds}=req.body
  try {
    logger.info("Create post endpoint hit")
    const {error}=postSchemaValidation(req.body)
    if(error)
    {
      logger.warn("Validation Error",error.details[0].message)
      return res.status(400).json({
        success:false,
        message:error.details[0].message
      })
    }
    const newPost=await Post.create({
      content,
      user:req?.user?._id,
      imageIds:imageIds||[]
    })
    await publishEvent('post.created',{
      postId:newPost?._id.toString(),
      content:newPost?.content,
      userId:newPost?.user.toString(),
      createdAt:newPost?.createdAt
    })
    await invalidateGetPostsKey(req)
    logger.info("post created successfully")
    res.status(201).json({
      success:true,
      message:"Post created successfully",
      post:newPost
    })
  } catch (error) {
    logger.error("Error occured while creating post",error)
    res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}
const getAllPosts=async(req,res)=>{
  const page=parseInt(req.query.page) || 1
  const limit=parseInt(req.query.limit) || 20
  const skip=(page-1)*limit
  const totalDocs=await Post.countDocuments()
  const totalPages=Math.ceil(totalDocs/limit)
 
  try {
     logger.info("Get All Posts endpoint hit")
    const redisKey=`posts:${page}:${limit}`
    const getPostsFromCache=await req.redisClient.get(redisKey)
    if(getPostsFromCache)
    {
      logger.info("posts fetched from redis cache")
      return res.status(200).json({
        success:true,
        posts:JSON.parse(getPostsFromCache)
      })
    }
   
    const posts=await Post.find({}).sort({createdAt:-1}).skip(skip).limit(limit)
    await req.redisClient.setex(redisKey,180,JSON.stringify(posts))
    logger.info("getting all posts")
    res.status(200).json({
      success:true,
      posts
    })
  } catch (error) {
     logger.error("Error occured while getting all posts",error)
    res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}
const getAPost=async(req,res)=>{
  const {id}=req.params
  try {
    logger.info("Get A Post endpoint hit")
    const cacheKey=`posts:${id}`
    const postFromCache=await req.redisClient.get(cacheKey)
    if(postFromCache)
    {
      logger.info("Got a post from redis")
      return res.status(200).json({
        success:true,
        post:JSON.parse(postFromCache)
      })
    }
    const post=await Post.findById(id)
    if(!post)
    {
      logger.warn("post not found")
      return res.status(404).json({
        success:false,
        message:"post not found"
      })
    }
    await req.redisClient.setex(cacheKey,180,JSON.stringify(post))
    logger.info("getting a post")
    res.status(200).json({
      success:true,
      post
    })
  } catch (error) {
     logger.error("Error occured while getting a post",error)
    res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}
const deletePost=async(req,res)=>{
  const {id}=req.params
  try {
    logger.info("delete post endpoint hit")
    const post=await Post.findById(id)
    if(!post)
    {
      logger.warn("post not found")
      return res.status(404).json({
        success:false,
        message:"post not found"
      })
    }
    await post.deleteOne()
    await invalidateGetPostsKey(req)
    await publishEvent('post.deleted',
      {
        postId:post._id.toString(),
        user:req.user?._id,
        mediaIds:post.imageIds
      }
    )
    logger.info("post deleted successfully")
    res.status(200).json({
      success:true,
      message:"post deleted successfully"
    })
  } catch (error) {
    logger.error("Error occured while deleting a post",error)
    res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}
const updatePost=async(req,res)=>{
  const{id}=req.params
  try {
    logger.info("update post endpoint hit")
    
   
    const updatedPost=await Post.findByIdAndUpdate(id,req.body,{new:true})
     if(!updatedPost)
    {
      logger.warn("post not found")
      return res.status(404).json({
        success:false,
        message:"post not found"
      })
    }
    await invalidateGetPostsKey(req)
    logger.info("post updated successfully")
    res.status(201).json({
      success:true,
      message:"post updated successfully",
      updatedPost
    })
  } catch (error) {
     logger.error("Error occured while updating a post",error)
    res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}
module.exports={createPost,getAllPosts,getAPost,deletePost,updatePost}