const amqp=require("amqplib")
const logger = require("./logger")
let connection=null
let channel=null
const exchange_name="data_exchange"
const connectToRabbitMQ=async()=>{
  try {
    connection=await amqp.connect(process.env.RABBITMQ_URL)
    channel=await connection.createChannel()
   
    logger.info("rabbitmq connection established")
    await channel.assertExchange(exchange_name,'topic',{durable:false})
    return channel
  } catch (error) {
    logger.error("error while connecting to rabbitmq",error)
  }
}
const consumeEvent=async(routingkey,callback)=>{
  try {
    if(!channel)
    {
      await connectToRabbitMQ()
    }
    const q=await channel.assertQueue("",{exclusive:true})
    await channel.bindQueue(q.queue,exchange_name,routingkey)
    await channel.consume(q.queue,(msg)=>{
      if(msg!==null)
      {

        const content=JSON.parse(msg.content.toString())
        callback(content)
        channel.ack(msg)
      }
    })
    logger.info("consumed the event",routingkey)
  } catch (error) {
    logger.error("error while consuming",routingkey)
  }
}
module.exports={connectToRabbitMQ,consumeEvent}