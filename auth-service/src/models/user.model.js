const bcrypt=require("bcryptjs")
const mongoose=require("mongoose")
const userSchema=new mongoose.Schema({
  username:{
    type:String,
    required:true,
    trim:true
  },
  email:{
    type:String,
    unique:true,
    required:true
  },
  password:{
    type:String,
    required:true
  }
},{timestamps:true})
userSchema.pre("save",async function(next)
{
  try {
    if(this.isModified("password"))
    {
      this.password=await bcrypt.hash(this.password,10)
    }
  } catch (error) {
    return next(error)
  }
})
userSchema.methods.comparePassword=async function(password)
{
  try {
    return await bcrypt.compare(password,this.password)
  } catch (error) {
    throw error
  }
}
const User=mongoose.model('User',userSchema)
module.exports=User