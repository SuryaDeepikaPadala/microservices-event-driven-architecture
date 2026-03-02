const winston=require("winston")
const logger=winston.createLogger({
  level:'info',
  format:winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.splat(),
    winston.format.errors({stack:true})
  ),
  defaultMeta:{service:'media-service'},

  transports:[
    new winston.transports.Console({
      format:winston.format.combine(
        winston.format.simple(),
        winston.format.colorize()
      )
    }),
    new winston.transports.File({filename:'error.log',level:'error'}),
    new winston.transports.File({filename:'combined.log'})
  ]
})
module.exports=logger