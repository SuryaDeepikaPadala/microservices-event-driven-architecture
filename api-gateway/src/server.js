require("dotenv").config()
const express=require("express")
const logger = require("./utils/logger")
const Redis=require("ioredis")
const {RateLimiterRedis}=require("rate-limiter-flexible")
const helmet=require('helmet')
const cors=require('cors')
const proxy=require("express-http-proxy")
const authMiddleware = require("./middlewares/auth.middleware")
const dbConnection = require("./db/dbConnect")
const app=express()
const redisClient=new Redis(process.env.REDIS_URL)
app.use(express.json())
app.use(helmet())
app.use(cors())
app.use((err,req,res,next)=>{
  logger.info(`${req.method} for ${req.url} url from ${req.ip} address`)
  
  next()
})

const rateLimiter=new RateLimiterRedis({
  storeClient:redisClient,
  keyPrefix:'rl',
  points:10,
  duration:1,
  blockDuration:60
})
const proxyOptions={
  proxyReqPathResolver:(req)=>{
    return req.originalUrl.replace(/^\/v1/,"/api")
  },
  proxyErrorHandler:((err,res,next)=>{
     logger.error(`Proxy error: ${err}`);
     next(err);
    res.status(500).json({
      message: `Internal server error`,
      error: err.message,
    });
  })
}
app.use("/v1/auth",proxy(process.env.AUTH_SERVICE_URI,{
  ...proxyOptions,
  proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
    proxyReqOpts.headers['content-type']='application/json'
    return proxyReqOpts
  },
  userResDecorator:(proxyRes,proxyResData,userReq,usereRes)=>{
    logger.info(`Response came from identity-service ${proxyRes.statusCode}`)
    return proxyResData
  }
}))

app.use("/v1/posts",authMiddleware, proxy(process.env.POST_SERVICE_URI,{
  ...proxyOptions,
  proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
    proxyReqOpts.headers['content-type']='application/json'
    proxyReqOpts.headers['x-user-id']=srcReq.userId
    return proxyReqOpts
  },
  userResDecorator:(proxyRes,proxyResData,userReq,usereRes)=>{
    logger.info(`Response came from post-service ${proxyRes.statusCode}`)
    return proxyResData
  }
}))
app.use("/v1/media",authMiddleware, proxy(process.env.MEDIA_SERVICE_URI,{
  ...proxyOptions,
  proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
   
    proxyReqOpts.headers['x-user-id']=srcReq.userId
     if (!srcReq?.headers["content-type"]?.startsWith("multipart/form-data")) {
        proxyReqOpts.headers["Content-Type"] = "application/json";
      }
    return proxyReqOpts
  },
  userResDecorator:(proxyRes,proxyResData,userReq,usereRes)=>{
    logger.info(`Response came from media-service ${proxyRes.statusCode}`)
    return proxyResData
  },
  parseReqBody: false,
}))
app.use("/v1/search",authMiddleware, proxy(process.env.SEARCH_SERVICE_URI,{
  ...proxyOptions,
  proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
    proxyReqOpts.headers['content-type']='application/json'
    proxyReqOpts.headers['x-user-id']=srcReq.userId
    return proxyReqOpts
  },
  userResDecorator:(proxyRes,proxyResData,userReq,usereRes)=>{
    logger.info(`Response came from search-service ${proxyRes.statusCode}`)
    return proxyResData
  }
}))
app.use((req,res,next)=>{
  rateLimiter.consume(req.ip).then(()=>next()).catch((e)=>{
    logger.warn(`rate limit exceeded for ${req.ip}`)
    return res.status(429).json({
      success:false,
      message:"Too Many Requests"
    })
  })
})
// dbConnection()
app.listen(process.env.PORT,()=>{
  logger.info(`Api Gateway running on port ${process.env.PORT}`)
  logger.info(`Auth service running on localhost ${process.env.AUTH_SERVICE_URI}`)
  logger.info(`Post Service running on localhost ${process.env.POST_SERVICE_URI}`)
  logger.info(`media Service running on localhost ${process.env.MEDIA_SERVICE_URI}`)
  logger.info(`search Service running on localhost ${process.env.SEARCH_SERVICE_URI}`)
})
