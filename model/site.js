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
    entry_code:{
        code:{
            required:true,
            type:Number
        },
        expired:{
            required:true,
            type:Boolean
        },
    },
    is_ban:{
        required:true,
        type:Boolean
    },
    Wrong_login_Number:{
        required:true,
        type:Number
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