require("dotenv").config()
const express=require("express")
const helmet=require("helmet")
const cors=require("cors")
const Redis=require("ioredis")
const {RateLimiterRedis}=require("rate-limiter-flexible")
const logger = require("./utils/logger")
const postRouter = require("./routes/post.route")
const dbConnection = require("./db/dbConnect")
const { connectToRabbitMQ } = require("./utils/rabbitMq")

const app=express()
const PORT=process.env.PORT
const redisClient=new Redis(process.env.REDIS_URL)
const rateLimiter=new RateLimiterRedis({
  storeClient:redisClient,
  keyPrefix:'rl',
  points:10,
  duration:5,
  blockDuration:60
})

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use((req,res,next)=>{
  logger.info(`got ${req.method} for ${req.url} from ${req.ip} address`)
  next()
})
app.use("/api/posts",(req,res,next)=>{
  req.redisClient=redisClient
  next()
},postRouter)
app.use((req,res,next)=>{
  rateLimiter.consume(req.ip).then(()=>next()).catch((e)=>{
    logger.error(`rate limit exceeded for ${req.ip}`)
    return res.status(429).json({
      success:false,
      message:"Too many requests"
    })
  })
})
dbConnection()
const startServer=async()=>{
  try {
    await connectToRabbitMQ()
    app.listen(PORT,()=>{
  logger.info(`post-service running on port ${PORT}`)
  })
  } catch (error) {
    logger.error("error while connecting to post server",error)
  }
}
startServer()