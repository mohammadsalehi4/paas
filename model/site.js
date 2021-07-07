const mongoose=require('mongoose')
const Schema=mongoose.Schema

const siteSchema=new Schema({
    Address:{
        required:true,
        type:String
    },
    HashingPassWord:{
        required:true,
        type:String
    },
    Number:{
        required:true,
        type:String
    },
    recoverycode:{
        required:true,
        type:String
    },
    is_ban:{
        required:true,
        type:Boolean
    },
    Uns_attempt:{
        required:true,
        type:Number
    },
    AddedUsers:{
        required:true,
        type:Boolean
    },
    users:[{
        username:{
            type:String
        },
        registered:{
            type:Boolean
        },
        userid:{
            type:String
        },
        usercode:{
            type:String
        }
    }] 
})

module.exports=mongoose.model('Site',siteSchema)