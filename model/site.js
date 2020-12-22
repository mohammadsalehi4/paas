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
    Email:{
        required:true,
        type:String
    },
    enable_to_change_password:{
        required:true,
        type:Boolean
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
    ExpireDate:{
        year:{
            required:true,
            type:Number
        },
        month:{
            required:true,
            type:Number
        },
        day:{
            required:true,
            type:Number
        }
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
            type:Number
        }
    }]

        
    
})

module.exports=mongoose.model('Site',siteSchema)