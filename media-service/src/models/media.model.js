const mongoose=require("mongoose")
const mediaSchema=new mongoose.Schema({
  publicId:{
    type:String,
    required:true
  },
  mediaUrl:{
    type:String,
    required:true
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
 
  originalName:{
    type:String,
    
  },
  mediaType:{
    type:String,
   
  }
},{timestamps:true})
const Media=mongoose.model('Media',mediaSchema)
module.exports=Media