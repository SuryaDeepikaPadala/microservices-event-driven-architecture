const joi=require("joi")
const postSchemaValidation=(data)=>{
  const schema=joi.object({
    content:joi.string().required().min(10).max(750),
    imageIds:joi.array()
  })
  return schema.validate(data)
}
module.exports=postSchemaValidation