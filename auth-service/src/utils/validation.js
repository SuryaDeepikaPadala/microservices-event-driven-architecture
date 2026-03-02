const joi=require("joi")
const registerSchemavalidation=async(data)=>{
  const schema=joi.object({
    username:joi.string().required().min(3).max(50),
    email:joi.string().email().required().lowercase(),
    password:joi.string().required().min(8)
  })
  return schema.validate(data)
}
const loginSchemaValidation=async(data)=>{
  const schema=joi.object({
    email:joi.string().email().lowercase().required(),
    password:joi.string().required()
  })
  return schema.validate(data)
}
module.exports={registerSchemavalidation,loginSchemaValidation}