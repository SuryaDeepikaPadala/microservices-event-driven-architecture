const express=require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const handleSearch = require("../controllers/search.controller")
const searchRouter=express.Router()
searchRouter.get("/",authMiddleware,handleSearch)
module.exports=searchRouter