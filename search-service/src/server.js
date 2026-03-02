require("dotenv").config()
const express=require("express")
const cors=require("cors")
const helmet=require("helmet")
const logger = require("./utils/logger")
const Redis=require("ioredis")
const {RateLimiterRedis}=require("rate-limiter-flexible")
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitMQ")
const searchRouter = require("./routes/search.route")
const { deleteSearchPostEventhandler, createSearchPostEventHandler } = require("./events/search.events")
const dbConnection = require("./db/dbConnect")
const redisClient=new Redis(process.env.REDDIS_URL)
const rateLimiter=new RateLimiterRedis({
  storeClient:redisClient,
  keyPrefix:'srl',
  points:10,
  duration:10,
  blockDuration:60
})
const app=express()
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use("/api/search",searchRouter)
app.use((req,res,next)=>{
  logger.info(`request received for ${req.url} method is ${req.method} for url ${req.ip}`)
  next()
})
app.use((req,res,next)=>{
  rateLimiter.consume(req.ip).then(()=>next()).catch((e)=>{
    logger.error(`rate limit exceeded for ${req.ip}`)
    return res.status(429).json({
      success:false,
      message:"Too many requests"
    })
  })
})
const PORT=process.env.PORT
dbConnection()
async function startServer()
{
  try {
    await connectToRabbitMQ()
    await consumeEvent('post.deleted',deleteSearchPostEventhandler)
    await consumeEvent('post.created',createSearchPostEventHandler)
    app.listen(PORT,()=>logger.info(`serach service started running on port ${PORT}`))
  } catch (error) {
    logger.error("error while connecting to the service server")
  }
}
startServer()
