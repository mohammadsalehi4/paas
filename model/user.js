const mongoose=require('mongoose')
const Schema=mongoose.Schema

const userSchema=new Schema({
    fullName:{
        required:true,
        type:String
    },
    Email:{
        required:true,
        type:String
    },
    HashingPassword:{
        required:true,
        type:String
    },
    Uns_attempt:{
        required:true,
        type:Number
    },
    is_ban:{
        required:true,
        type:Boolean
    },
    is_google_register:{
        required:true,
        type:Boolean
    },
    sites:[{
        SiteAddress:{
            type:String
        },
        username:{
            type:String
        },
        HashingCode:{
            type:String
        },
        expireTime:{
            type:Number
        },
        is_expired:{
            type:Boolean
        }
    }]
})

module.exports=mongoose.model('User',userSchema)
