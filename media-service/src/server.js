require("dotenv").config()
const express=require("express")
const cors=require("cors")
const helmet=require("helmet")
const logger = require("./utils/logger")
const Redis=require("ioredis")
const {RateLimiterRedis}=require("rate-limiter-flexible")
const dbConnection = require("./db/dbConnect")
const mediaRouter = require("./routes/media.route")
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitMQ")
const { deletePostEvent } = require("./events/media.events")
const redisClient=new Redis(process.env.REDIS_URL)
const rateLimiter=new RateLimiterRedis({
  storeClient:redisClient,
  keyPrefix:'mrl',
  points:10,
  duration:10,
  blockDuration:60
})
const app=express()
const PORT=process.env.PORT
app.use(express.json())
app.use(cors())
app.use(helmet())
app.use("/api/media",mediaRouter)
app.use((req,res,next)=>{
  rateLimiter.consume(req.ip).then(()=>next()).catch((e)=>{
    logger.error(`rate limit exceeded for ${req.ip}`)
    return res.status(400).json({
      success:false,
      message:"Too many requests"
    })
  })
})
app.use((req,res,next)=>{
  logger.info(`Request  ${req.method} for ${req.url} from ${req.ip} address`)
  next()
})
dbConnection()
async function startServer()
{
  try {
    await connectToRabbitMQ()
    await consumeEvent('post.deleted',deletePostEvent)
    app.listen(PORT,()=>{
  logger.info(`media service running on port ${PORT}`)
})
  } catch (error) {
    logger.error("error while connecting to media server",error)
  }
}
startServer()

