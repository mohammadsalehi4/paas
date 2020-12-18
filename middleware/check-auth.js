const jwt=require('jsonwebtoken')
const jwtDecode = require('jwt-decode');
module.exports=(req,res,next)=>{
    try{
        const token=req.headers.authorization.split(' ')[1]
        const decoded =jwt.verify(token,'secret')
        req.userData=decoded
        next()
    }catch(error){
        return res.status(401).json({
            msg:'Auth Failed'
        })
    }
} 

