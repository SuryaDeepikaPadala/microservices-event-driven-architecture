const amqp=require("amqplib")
const logger = require("./logger")

let connection=null
let channel=null
const excahnge_name="data_exchange"
const connectToRabbitMQ=async()=>{
  try {
    connection=await amqp.connect(process.env.RABBITMQ_URI)
    channel=await connection.createChannel()
    channel.assertQueue()
    await channel.assertExchange(excahnge_name,'topic',{durable:false})
    logger.info("rabbitmq connection established")
  } catch (error) {
    logger.error("error while connecting to the rabbitmq")
  }
}
const consumeEvent=async(routingKey,callback)=>{
  try {
    if(!channel)
    {
      connectToRabbitMQ()
    }
    const q=await channel.assertQueue("",{exclusive:true})
    await channel.bindQueue(q.queue,excahnge_name,routingKey)
    await channel.consume(q.queue,((msg)=>{
      if(msg!==null)
      {
        const content=JSON.parse(msg.content.toString())
      callback(content)
      channel.ack(msg)
      }
      
    }))
  } catch (error) {
    logger.error(`error while consuming to the ${routingKey}`)
  }
}
module.exports={connectToRabbitMQ,consumeEvent}