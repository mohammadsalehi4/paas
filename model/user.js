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
    enable_to_change_password:{
        required:true,
        type:Boolean
    },
    recoverycode:{
        required:true,
        type:String
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
