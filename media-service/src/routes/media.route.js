const express=require('express')
const authMiddleware = require('../middlewares/auth.middleware')
const upload = require('../utils/multer')
const { uploadMediaController, getAllMedia } = require('../controllers/media.controller')
const mediaRouter=express.Router()
mediaRouter.post("/upload",authMiddleware,upload.single('file'),uploadMediaController)
mediaRouter.get("/",authMiddleware,getAllMedia)
module.exports=mediaRouter