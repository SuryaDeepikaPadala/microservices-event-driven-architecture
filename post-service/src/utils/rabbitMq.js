const amqp=require("amqplib")
const logger = require("./logger")
let connection=null
let channel=null
const exchange_name="data_exchange"
const connectToRabbitMQ=async()=>{
  try {
    connection=await amqp.connect(process.env.RABBITMQ_URL)
    logger.info("RabbitMq connection established")
    channel=await connection.createChannel()
    
    await channel.assertExchange(exchange_name,'topic',{durable:false})
    return channel
  } catch (error) {
    logger.error("Error while connecting to rabbitMq")
  }
}
const publishEvent=async(routingKey,message)=>{
  try {
    if(!channel)
    {
      await connectToRabbitMQ()
    }
    await channel.publish(exchange_name,routingKey,Buffer.from(JSON.stringify(message)))
    logger.info("event is published",routingKey)
  } catch (error) {
    logger.error(`error while publishing the event ${routingKey}`)
  }
}

module.exports={connectToRabbitMQ,publishEvent}