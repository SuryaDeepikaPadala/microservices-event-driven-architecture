const express=require("express")
const { registerUser, loginUser, refreshTokenHandler } = require("../controllers/auth.controller")
const authRouter=express.Router()
authRouter.post("/register",registerUser)
authRouter.post("/login",loginUser)
authRouter.post("/refresh-token",refreshTokenHandler)
module.exports=authRouter