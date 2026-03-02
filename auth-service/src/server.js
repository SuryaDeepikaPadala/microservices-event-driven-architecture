require("dotenv").config()
const express=require("express")
const logger = require("./utils/logger")
const helmet=require("helmet")
const cors=require("cors")
const {RateLimiterRedis}=require("rate-limiter-flexible")
const client=require("ioredis")
const authRouter = require("./routes/auth.route")
const dbConnection = require("./db/db.connection")
const app=express()

const redisclient=new client("redis://localhost:6379")
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use("/api/auth",authRouter)
const rateLimit=new RateLimiterRedis({
  storeClient:redisclient,
  keyPrefix:'rl',
  points:10,
  duration:1,
  blockDuration:60
})

app.use((req,res,next)=>{
  logger.info(`${req.method} request to ${req.url} from ${req.ip} address`)
  
  next()
})
app.use((req,res,next)=>{
  rateLimit.consume(req.ip).then(()=>next()).catch((e)=>{
    logger.warn(`Rate Limit Exceeded from ${req.ip}`)
    return res.status(429).json({
      success:false,
      message:"Too Many requests"
    })
  })
})
dbConnection()
app.listen(process.env.PORT,()=>{
  logger.info(`Auth Service is running on port ${process.env.PORT}`)
  
})
