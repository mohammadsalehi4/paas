const express=require('express')
const router=express.Router()
const User = require('../model/user')
const bcrypt=require('bcryptjs')
const Sites = require('../model/site')
const jwt=require('jsonwebtoken')
const nodemailer = require('nodemailer');
const sendSMS=require('trez-sms-client')
const { get } = require('mongoose')
const { use } = require('../routes/routes')
const user = require('../model/user')
const client=new sendSMS('mohammad4salehi','---------')
const GroupID=client.getRandomGroupId()
const sender="5000224456787"

function validateNumber(num){
    if(num.length!=11){return false;}
    let a=num
    a=Number(a)
    if(a!=num){return false;}
    if(num[0]!=0){return false}
    return true;
}

function sendMessage(Number,Message){
    client.sendMessage(sender,Number ,Message,GroupID)
	.then((receipt) => {return 'ok';})
	.catch((error) => {return 'error';});
}

function validateEmail(email)
{
    var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
    if (reg.test(email)){
        return true; }
    else{
        return false;
    }
}

const sendMail=function(email,subject,text){
    
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'paassoftwareteam@gmail.com',
          pass: '------------'
        }
      });
      
      var mailOptions = {
        from: 'paassoftwareteam@gmail.com',
        to: email,
        subject: subject,
        text:text
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {return false} 
        else {return true}
      });
}

module.exports.getData=(req,res)=>{
    const getmode=req.body.mode
    const gettoken=req.body.token
    
    if(getmode==='site'){
        const token=(gettoken.slice(7))
        const decoded =jwt.verify(token,'secret')
        const Address=decoded.Address
        
        Sites.find({Address:Address})
        .then(site=>{
            if(site.length===1){
                return res.status(200).json({
                    status:200,
                    find:true
                })
            }else{
                return res.status(200).json({
                    status:404,
                    find:false
                })
            }
        })
        .catch(err=>{
            return res.status(200).json({
                status:404,
                find:false
            })
        })
    }
    else if(getmode==='user'){
        const token=(gettoken.slice(7))
        const decoded =jwt.verify(token,'secret')
        const Number=decoded.Number
        
        User.find({Number:Number})
        .then(user=>{
            if(user.length==1){
                return res.status(200).json({
                    status:200,
                    find:true
                })
            }else{
                return res.status(200).json({
                    status:200,
                    find:true
                })
            }
        })
        .catch(err=>{
            return res.status(200).json({
                status:404,
                find:false
            })
        })
    }else{
        return res.status(200).json({
            status:404,
            find:false
        })
    }
}

module.exports.postSignUp=(req,res)=>{
    let Number=req.body.Number
    const DeviceId='empty'
    const password=req.body.password
    
    Number=String(Number)
    
    const AddToDB=function(){
        const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
                const rnd1=Math.floor(Math.random()*26)
                let code=letters[rnd1]
                for(let i=0;i<59;i++){
                    const rnd=Math.floor(Math.random()*letters.length)
                    code=code+letters[rnd]
                }
                bcrypt.hash(code,12,(err,hash)=>{
                    if(err){return res.status(200).json({
                        msg:'Unsuccessful1',
                        link:null,
                        error:err,
                        success:false,
                        status:403
                    })}
                    else{
                        const link=`localhost:4000/active/users/${Number}/${code}`
                        bcrypt.hash(password,12,(err,hash1)=>{
                            if(err){
                                return res.status(200).json({
                                    msg:'Unsuccessful2',
                                    link:null,
                                    error:err,
                                    success:false,
                                    status:403
                                })
                            }else{
                                const user=new User({
                                    Number:Number,
                                    change_Number_code:'empty',
                                    DeviceId:DeviceId,
                                    change_Device_code:'empty',
                                    change_Device_Time:0,
                                    HashingPassword:hash1,
                                    Uns_attempt:0,
                                    is_ban:false,//need to be false
                                    recoverycode:hash,
                                    EmailAddress:'empty',
                                    Email_Activator_code:'Empty',
                                    Added_Email:false,
                                    Del_Acc_Link:'empty',
                                    loginCode:'empty',
                                    AutoLogin:{
                                        loginCode:'empty',
                                        Address:'empty',
                                        ExpTime:0
                                    },
                                    sites:[]
                                })
                                user.save()
                                    .then(result=>{
                                        // client.sendMessage(sender,Number ,`use this link to Activation Account:\n${link}`,GroupID)
                                        // .then((receipt) => {return res.status(200).json({msg:'user created'})})
                                        // .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                                        
                                        return res.status(200).json({/*MOVAGHATI- LINK RA BAYAD PAYAMAK KONAD*/
                                            msg:'user created',
                                            link:link,
                                            success:true,
                                            error:[],
                                            status:200
                                        })
                                    })
                                    .catch(err=>{return res.status(200).json({
                                        msg:'Unsuccessful3',
                                        link:null,
                                        error:err,
                                        success:false,
                                        status:403
                                    })})
                            }
                        })
                    }
                })
    }
    
    const ExistingChecker=function(){
        User.find({Number:Number})
            .then(user=>{
                if(user.length>=1){return res.status(200).json({
                    msg:'this Number is already exist',
                    link:null,
                    error:['repetitive Number'],
                    success:false,
                    status:403
                })}
                AddToDB()
            })
            .catch(err=>{return res.status(200).json({
                msg:'Unsuccessful4',
                link:null,
                error:err,
                success:false,
                status:403
            })})
    }
    
    const Validator=function(){
        if(validateNumber(Number)==false){return res.status(200).json({
            msg:'Wrong Phone Number format',
            link:null,
            error:['Wrong Phone Number'],
            success:false,
            status:403
        })}
        ExistingChecker()
    }
    Validator()
}

module.exports.postSignUpForSites=(req,res)=>{
    const Address=req.body.Address
    const Number=req.body.Number
    const password=req.body.password
    
    function validateAddress(Address)
    {
        var reg = /^\w+([-+.']\w+)*\.\w+([-.]\w+)*$/
        if(Address[0]!='w'||Address[1]!='w'||Address[2]!='w'||Address[3]!='.'){
            return false
        }
        if (reg.test(Address)){return true; }else{return false;}
    }
    const AddToDB=function(){
        const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
        const rnd1=Math.floor(Math.random()*26)
        let code=letters[rnd1]
        for(let i=0;i<59;i++){
            const rnd=Math.floor(Math.random()*letters.length)
            code=code+letters[rnd]
        }
        bcrypt.hash(code,12,(err,hash)=>{
            if(err){return res.status(200).json({
                msg:'Unsuccessful',
                error:err,
                success:false,
                status:403
            })}
            else{
                const link=`localhost:4000/active/sites/${Address}/${code}`
                bcrypt.hash(password,12,(err,hash1)=>{
                    if(err){
                        return res.status(200).json({
                            msg:'Unsuccessful',
                            error:['wrong password'],
                            success:false,
                            status:403
                        })
                    }else{
                        const site =new Sites({
                            Address:Address,
                            HashingPassWord:hash1,
                            Number:Number,
                            recoverycode:hash,
                            is_ban:false,
                            Uns_attempt:0,
                            users:[],
                            loginCode:'empty',
                        })
                        site.save()
                            .then(result=>{
                                // client.sendMessage(sender,Number ,`use this link to Activation Account:\n${link}`,GroupID)
                                // .then((receipt) => {return res.status(200).json({
                                //     msg:'user created',
                                //     error:[],
                                //     success:true,
                                //     status:200
                                // })})
                                // .catch(err=>{return res.status(403).json({
                                //     msg:'Unsuccessful',
                                //     error:err,
                                //     success:false,
                                //     status:403
                                // })})
                                
                                return res.status(200).json({/*MOVAGHATI- BAYAD PAYAMAK ERSAL SHAVAD*/
                                    msg:'site created',
                                    link:link,
                                    error:[],
                                    success:true,
                                    status:200
                                })
                            })
                            .catch(err=>{return res.status(200).json({
                                msg:'Unsuccessful',
                                error:err,
                                success:false,
                                status:403
                            })})
                    }
                })

            }
        })
    }
    
    const ExistingChecker=function(){
        Sites.find({Address:Address})
            .then(site=>{
                if(site.length>=1){return res.status(200).json({
                    msg:'this Address is already exist',
                    error:['repetitive Address'],
                    success:false,
                    status:403
                })}
                Sites.find({Number:Number})
                    .then(site1=>{
                        if(site1.length>=1){return res.status(200).json({
                            msg:'this Number is already exist',
                            error:['repetitive Number'],
                            success:false,
                            status:403
                        })}
                        AddToDB()
                    })
            })
            .catch(err=>{return res.status(200).json({
                msg:'Unsuccessful',
                error:err,
                success:false,
                status:403
            })})
    }
    
    const Validator=function(){
        if(validateNumber(Number)==false){return res.status(200).json({
            msg:'Wrong Phone Number format',
            error:['Wrong Number'],
            success:false,
            status:403
        })}
        if(validateAddress(Address)==false){return res.status(200).json({
            msg:'Wrong Address',
            error:['Wrong Address'],
            success:false,
            status:403
        })}
        ExistingChecker()
    }
    Validator()
}

module.exports.postLogin=(req,res)=>{
    const Number=req.body.Number
    const password=req.body.password
    //const DeviceId=req.body.DeviceId
    
    User.findOne({Number:Number})
        .then(user=>{
            if(user.is_ban==true){
                const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
                const rnd1=Math.floor(Math.random()*26)
                let code=letters[rnd1]
                for(let i=0;i<59;i++){
                    const rnd=Math.floor(Math.random()*letters.length)
                    code=code+letters[rnd]
                }
                const link=`localhost:4000/recovery/users/${Number}/${code}`
                bcrypt.hash(code,12,(err,hash)=>{
                    if(err){return res.status(200).json({
                        msg:'Unsuccessful',
                        token:false,
                        error:err,
                        success:false,
                        status:403,
                        link:[]
                    })}
                    else{

                        user.recoverycode=hash
                        user.save()
                            .then(result=>{
                                //client.sendMessage(sender,Number ,`use this link to Activation Account:\n${link}`,GroupID)
                            })
                            .catch(err=>{return res.status(200).json({
                                msg:'Unsuccessful',
                                token:false,
                                error:err,
                                success:false,
                                status:403,
                                link:[]
                            })})
                    }
                })
                return res.status(200).json({/*MOVAGHATI*/
                    msg:'active your account',
                    token:false,
                    error:['account is ban'],
                    success:false,
                    status:403,
                    link:link
                })
            }
            // if(user.DeviceId!=DeviceId){return res.status(403).json({
            //     msg:'Wrong_Device_ID',
            //     token:false,
            //     error:['Wrong_Device_ID'],
            //     success:false,
            //     status:403,
            //     link:[]
            // })}
            bcrypt.compare(password,user.HashingPassword,(err,result)=>{
                if(err){
                    let UA=user.Uns_attempt
                    UA++
                    user.Uns_attempt=UA
                    if(UA==3){user.is_ban=true}
                    user.save()
                    return res.status(401).json({
                        msg:'Auth Failed!',
                        error:err,
                        token:false,
                        success:false,
                        status:401,
                        link:[]
                    })
                }
                else if(result){
                    const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
                    const rnd1=Math.floor(Math.random()*26)
                    let code=letters[rnd1]
                    for(let i=0;i<59;i++){
                        const rnd=Math.floor(Math.random()*letters.length)
                        code=code+letters[rnd]
                    }
                    const token = jwt.sign({
                        Number:user.Number,
                        fullName:user.fullName,
                        code:code
                    },'secret',{expiresIn:'1h'})
                    user.Uns_attempt=0
                    user.save()
                        .then(result=>{
                            bcrypt.hash(code,12,(err,hash)=>{
                                if(!err){
                                    user.loginCode=hash
                                    user.save()
                                    .then(rslt=>{
                                        return res.status(200).json({
                                            msg:'login_Successful!',
                                            token:token,
                                            error:[],
                                            success:true,
                                            status:200,
                                            link:[]
                                        })
                                    })
                                }
                            })
                        })
                        .catch(err=>{return res.status(200).json({
                            msg:'Unsuccessful',
                            error:err,
                            token:false,
                            success:false,
                            status:403,
                            link:[]
                        })})
                }else{                    
                    let UA=user.Uns_attempt
                    UA++
                    user.Uns_attempt=UA
                    if(UA==3){user.is_ban=true}
                    user.save()
                    return res.status(200).json({
                        msg:'Auth Failed!1',
                        error:err,
                        token:false,
                        success:false,
                        status:401,
                        link:[]
                    })
                }
            })
        })
        .catch(err=>{return res.status(200).json({
            msg:'Unsuccessful',
            error:err,
            token:false,
            success:false,
            status:403,
            link:[]
        })})
}

module.exports.loginForSites=(req,res)=>{//Done
    const number=req.body.number
    const password=req.body.password
    
    Sites.findOne({Number:number})
        .then(user=>{
            if(user.is_ban==true){
                const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
                const rnd1=Math.floor(Math.random()*26)
                let code=letters[rnd1]
                for(let i=0;i<59;i++){
                    const rnd=Math.floor(Math.random()*letters.length)
                    code=code+letters[rnd]
                }
                const Address=user.Address
                const link=`localhost:4000/recovery/sites/${Address}/${code}`
                bcrypt.hash(code,12,(err,hash)=>{
                    if(err){return res.status(200).json({
                        msg:'Unsuccessful',
                        error:err,
                        success:false,
                        status:403,
                        link:[],
                        token:[],
                    })}
                    else{

                        user.recoverycode=hash
                        user.save()
                            .then(result=>{
                                //client.sendMessage(sender,user.Number ,`use this link to Activation Account:\n${link}`,GroupID)
                            })
                            .catch(err=>{return res.status(200).json({
                                msg:'Unsuccessful',
                                error:err,
                                success:false,
                                status:403,
                                link:[],
                                token:[],
                            })})
                    }
                })
                return res.status(403).json({/*MOVAGHATI*/
                    msg:'active your account',
                    error:['account is ban'],
                    success:false,
                    status:403,
                    link:link,
                    token:[],
                })
            }
            bcrypt.compare(password,user.HashingPassWord,(err,result)=>{
                if(err){
                    let UA=user.Uns_attempt
                    UA=Number(UA)
                    UA++
                    user.Uns_attempt=UA
                    if(UA==3){user.is_ban=true}
                    user.save()
                    return res.status(200).json({
                        msg:'Auth Failed!',
                        error:err,
                        success:false,
                        status:401,
                        link:[],
                        token:[],
                    })
                }
                else if(result){
                    const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
                    const rnd1=Math.floor(Math.random()*26)
                    let code=letters[rnd1]
                    for(let i=0;i<59;i++){
                        const rnd=Math.floor(Math.random()*letters.length)
                        code=code+letters[rnd]
                    }
                    bcrypt.hash(code,12,(err,hash2)=>{
                        if(!err){
                            const token = jwt.sign({
                                Address:user.Address,
                                Number:user.Number,
                                code:code
                            },'secret',{expiresIn:'1y'})
                            user.Uns_attempt=0
                            user.loginCode=hash2
                            user.save()
                                .then(result=>{
                                    return res.status(200).json({
                                        msg:'login_Successful!',
                                        token:token,
                                        error:err,
                                        success:true,
                                        status:200,
                                        link:[],
                                    })
                                })
                                .catch(err=>{return res.status(200).json({
                                    msg:'Unsuccessful',
                                    error:err,
                                    success:false,
                                    status:403,
                                    link:[],
                                    token:[],
                                })})
                        }
                    })
                }else{                    
                    let UA=user.Uns_attempt
                    UA=Number(UA)
                    UA++
                    user.Uns_attempt=UA
                    if(UA==3){user.is_ban=true}
                    user.save()
                    return res.status(200).json({
                        msg:'Auth Failed!',
                        error:err,
                        success:false,
                        status:401,
                        link:[],
                        token:[],
                    })
                }
            })
        })
        .catch(err=>{return res.status(200).json({
            msg:'Unsuccessful',
            error:err,
            success:false,
            status:403,
            link:[],
            token:[],
        })})
}

module.exports.AddUserToSiteDb=(req,res)=>{//Done
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Address=decoded.Address
    
    const username=req.body.username
    
    Sites.findOne({Address:Address})
        .then(site=>{
            const users=[...site.users]
            for(let i=0;i<users.length;i++){
                if(users[i].username==username){
                    return res.status(200).json({
                        username:username,
                        msg:'already_Added_from_before',
                        username:null,
                        code:null,
                        error:['repetitive user'],
                        success:false,
                        status:403
                    })
                }
            }
            let code
            const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
            const rnd1=Math.floor(Math.random()*26)
            code=letters[rnd1]
            for(let i=0;i<6;i++){
                const rnd=Math.floor(Math.random()*letters.length)
                code=code+letters[rnd]
            }
            users.push({
                username:username,
                registered:false,
                userid:null,
                usercode:code
            })
            site.users=users
            site.save()
                .then(result=>{return(
                    res.status(200).json({
                        msg:'user_Added',
                        username:username,
                        code:code,
                        error:[],
                        success:true,
                        status:200
                    })
                )})
                .catch(err=>{return res.status(200).json({
                    msg:'Unsuccessful',
                    username:null,
                    code:null,
                    error:err,
                    success:false,
                    status:403
                })})
        })
        .catch(err=>{return res.status(200).json({
            msg:'Unsuccessful',
            username:null,
            code:null,
            error:err,
            success:false,
            status:403
        })})
}

module.exports.AddSiteToDb=(req,res)=>{//Done
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Number=decoded.Number

    const loginCode=decoded.code    
    User.findOne({Number:Number})
    .then(user=>{
        bcrypt.compare(loginCode,user.loginCode,(err,result)=>{
            if(err){
                return res.status(200).json({
                    msg:'Unsuccessful',
                    error:err,
                    success:false,
                    status:403
                })
            }else if(!result){
                return res.status(200).json({
                    msg:'Unsuccessful',
                    error:[],
                    success:false,
                    status:403
                })
            }
        })
    })
    
    const Address=req.body.Address
    const username=req.body.username
    const code=req.body.code
    
    Sites.findOne({Address:Address})
        .then(site=>{
            const AddToDb=function(k){
                User.findOne({Number:Number})
                    .then(user=>{
                        const getsites=[...user.sites]
                        getsites.push({
                            SiteAddress:Address,
                            username:username,
                            HashingCode:null,
                            expireTime:null,
                            is_expired:true
                        })
                        user.sites=getsites
                        user.save()
                            .then(result=>{
                                const getusers=[...site.users]
                                getusers[k].userid=Number
                                getusers[k].registered=true
                                site.users=getusers
                                site.save()
                                    .then(rs=>{return(res.status(200).json({
                                        msg:'Added',
                                        error:[],
                                        success:true,
                                        status:200
                                    }))})
                                    .catch(err=>{return res.status(200).json({
                                        msg:'Unsuccessful',
                                        error:err,
                                        success:false,
                                        status:403
                                    })})
                            })
                    })
            }
            
            const siteChecker=function(){
                const getusers=[...site.users]
                for(let i=0;i<getusers.length;i++){
                    if(getusers[i].username==username){
                        if(getusers[i].registered==false){
                            if(getusers[i].usercode==code){
                                AddToDb(i)
                                return true
                            }else{return res.status(200).json({
                                msg:'wrong code',
                                error:['wrong code'],
                                success:false,
                                status:403
                            })}
                        }else{return res.status(200).json({
                            msg:'you are already added this site',
                            error:['repetitive site'],
                            success:false,
                            status:403
                        })}
                    }
                }
                return res.status(200).json({
                    msg:'need_add_to_db_from_site',
                    error:['not in site database'],
                    success:false,
                    status:403
                })
            }
            siteChecker()
        })
        .catch(err=>{return res.status(200).json({
            msg:'Unsuccessful',
            error:err,
            success:false,
            status:403
        })})
}

module.exports.getcode=(req,res)=>{//Done
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Number=decoded.Number
    const loginCode=decoded.code    
    User.findOne({Number:Number})
    .then(user=>{
        bcrypt.compare(loginCode,user.loginCode,(err,result)=>{
            if(err){
                return res.status(200).json({
                    msg:'Unsuccessful',
                    error:err,
                    success:false,
                    status:403
                })
            }else if(!result){
                return res.status(200).json({
                    msg:'Unsuccessful',
                    error:[],
                    success:false,
                    status:403
                })
            }
        })
    })
    
    const Address=req.body.Address
    
    User.findOne({Number:Number})
        .then(user=>{
            const getsites=[...user.sites]
            for(let i=0;i<getsites.length;i++){
                if(getsites[i].SiteAddress==Address){
                    let code=Math.floor(Math.random()*1000000)
                    while(code<100000){
                        code=Math.floor(Math.random()*1000000)
                    }
                    code=String(code)
                    bcrypt.hash(code,12,(err,hash)=>{
                        if(err){
                            return res.status(200).json({
                                msg:'Unsuccessful',
                                error:err,
                                success:false,
                                status:403
                            })
                        }else{
                            getsites[i].HashingCode=hash
                            let date=new Date()
                            date =date.getTime()
                            date=date/1000
                            date=Math.floor(date)
                            getsites[i].expireTime=date+60
                            getsites[i].is_expired=false  
                            user.sites=getsites
                            user.save()
                                .then(result=>{
                                    return (res.status(200).json({
                                        msg:'Done',
                                        code:code,
                                        error:[],
                                        success:true,
                                        status:200
                                    }))
                                })
                                .catch(err=>{return res.status(200).json({
                                    msg:'Unsuccessful',
                                    error:err,
                                    success:false,
                                    status:403
                                })})
                        }
                    })
                    return true
                }
            }
            return res.status(200).json({
                msg:'Wrong_Address',
                error:['Wrong Address'],
                success:false,
                status:404
            })
        })
        .catch(err=>{return res.status(200).json({
            msg:'Unsuccessful',
            error:err,
            success:false,
            status:403
        })})
}

module.exports.confirm=(req,res)=>{//Done
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Address=decoded.Address

    

    
    const username=req.body.username
    const code=req.body.code
    
    Sites.findOne({Address:Address})
        .then(site=>{
            const nxt=function(userid){
                User.findOne({Number:userid})
                    .then(user=>{
                        const Authchecker=function(num){
                            const hashcode=user.sites[num].HashingCode
                            const time=user.sites[num].expireTime
                            const exp=user.sites[num].is_expired

                            bcrypt.compare(code,hashcode,(err,result)=>{
                                if(err){
                                    return res.status(200).json({
                                        msg:'login auth',
                                        username:username,
                                        authentication:false,
                                        error:['wrong code'],
                                        success:false,
                                        status:403
                                    })
                                }else if(result){
                                    let date=new Date()
                                    date =date.getTime()
                                    date=date/1000
                                    date=Math.floor(date)
                                    if(date<time){
                                        if(exp==false){
                                            user.sites[num].is_expired=true
                                            user.save()
                                            .then(result=>{
                                                return res.status(200).json({
                                                    msg:'login auth',
                                                    username:username,
                                                    authentication:true,
                                                    error:[],
                                                    success:true,
                                                    status:200
                                                })
                                                .catch(err=>{return res.status(200).json({
                                                    msg:'Unsuccessful',
                                                    error:err,
                                                    success:false,
                                                    status:403
                                                })})
                                            })                                            
                                        }else{
                                            return res.status(200).json({
                                                msg:'login auth',
                                                username:username,
                                                authentication:false,
                                                error:['already used before'],
                                                success:false,
                                                status:403
                                            })
                                        }
                                    }else{
                                        return res.status(200).json({
                                            msg:'login auth',
                                            username:username,
                                            authentication:false,
                                            error:['expire time error'],
                                            success:false,
                                            status:403
                                        })
                                    }
                                }else{
                                    return res.status(200).json({
                                        msg:'login auth',
                                        username:username,
                                        authentication:false,
                                        error:['wrong code'],
                                        success:false,
                                        status:403
                                    })
                                }
                            })
                            return true
                        }
                        
                        const userchecker=function(){
                            const getsites=[...user.sites]
                            for(let i=0;i<getsites.length;i++){
                                if(getsites[i].SiteAddress==Address){
                                    Authchecker(i)
                                    return true
                                }
                            }
                            return res.status(200).json({
                                msg:'Unsuccessful',
                                error:['wrong Address'],
                                success:false,
                                status:403
                            })
                        }
                        
                        userchecker()
                    })
                    .catch(err=>{return res.status(200).json({
                        msg:'Unsuccessful',
                        error:err,
                        success:false,
                        status:403
                    })})  
            }
            
            const getusers=[...site.users]
            for(let i=0;i<getusers.length;i++){
                if(getusers[i].username==username){
                    const userid=getusers[i].userid
                    nxt(userid)
                    return true
                }
            }
            return res.status(200).json({
                msg:'Unsuccessful',
                error:['wrong username'],
                success:false,
                status:403
            })
        })
        .catch(err=>{return res.status(200).json({
            msg:'Unsuccessful',
            error:err,
            success:false,
            status:403
        })})
}

module.exports.sendrecoverylink=(req,res)=>{//Done
    const Number=req.body.Number
    
    User.findOne({Number:Number})
        .then(user=>{
            let code
            const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
            const rnd1=Math.floor(Math.random()*26)
            code=letters[rnd1]
            for(let i=0;i<59;i++){
                const rnd=Math.floor(Math.random()*letters.length)
                code=code+letters[rnd]
            }
            const link=`localhost:3000/changePassword/users/${Number}/${code}`
            bcrypt.hash(code,12,(err,hash)=>{
                if(err){return res.status(200).json({
                    msg:'Unsuccessful',
                    error:err,
                    link:[],
                    success:false,
                    status:403
                })}
                else{
                    try {
                        user.recoverycode=hash
                        user.save()
                            .then(result=>{
                                // client.sendMessage(sender,Number ,`use this link for Activation.\n${link}`,GroupID)
                                // .then((receipt) => {return res.status(200).json({
                                //     msg:'link sent',
                                //     error:[],
                                //     success:true,
                                //     status:200
                                // })})
                                // .catch(err=>{return res.status(403).json({
                                //     msg:'Unsuccessful',
                                //     error:err,
                                //     success:false,
                                //     status:403
                                // })})
                                return res.status(200).json({/*MOVAGHATI*/
                                        msg:'link sent',
                                        error:[],
                                        link:link,
                                        success:true,
                                        status:200
                                    })
                            })
                            .catch(err=>{return res.status(200).json({
                                msg:'Unsuccessful',
                                error:err,
                                success:false,
                                link:[],
                                status:403
                            })})
                    } catch (error) {
                        return res.status(200).json({
                            msg:'user not found',
                            error:err,
                            link:[],
                            success:false,
                            status:403
                        })
                    }
                }
            })
        })
        .catch(err=>{return res.status(200).json({
            msg:'user not found',
            error:err,
            link:[],
            success:false,
            status:403
        })})
}

module.exports.recovery=(req,res)=>{
    const mode=req.params.mode
    const ID=req.params.ID
    const code=req.params.code
    
    const newPassword=req.body.newPassword
        
    if(mode=='users'){
        User.findOne({Number:ID})
            .then(user=>{
                bcrypt.compare(code,user.recoverycode,(err,result)=>{
                    if(err){return res.status(200).json({
                        msg:'Unsuccessful',
                        error:err,
                        success:false,
                        status:403
                    })}
                    else if(result){
                        // if(newPassword.length<8){return res.status(403).json({
                        //     msg:'please enter longer password',
                        //     error:['too short password'],
                        //     success:false,
                        //     status:403,
                        // })}
                        bcrypt.hash(newPassword,12,(err,hash)=>{
                            if(err){return res.status(200).json({
                                msg:'Unsuccessful',
                                error:err,
                                success:false,
                                status:403
                            })}
                            else{
                                user.HashingPassword=hash
                                //const DeviceId=req.body.DeviceId
                                //user.DeviceId=DeviceId/******************************************/
                                user.Uns_attempt=0
                                user.is_ban=false
                                user.recoverycode='empty'
                                user.save()
                                    .then(rs=>{return res.status(200).json({
                                        msg:'changed',
                                        error:[],
                                        success:true,
                                        status:200
                                    })})
                                    .catch(err=>{return res.status(200).json({
                                        msg:'Unsuccessful',
                                        error:err,
                                        success:false,
                                        status:403
                                    })})
                            }
                        })
                    }
                    else{return res.status(200).json({
                        msg:'Unsuccessful',
                        error:['wrong password'],
                        success:false,
                        status:403
                    })}
                })
               
            })
    }
    else if(mode=='sites'){
        Sites.findOne({Address:ID})
            .then(site=>{
                bcrypt.compare(code,site.recoverycode,(err,result)=>{
                    if(err){return res.status(200).json({
                        msg:'Unsuccessful',
                        error:err,
                        success:false,
                        status:403
                    })}
                    else if(result){
                        site.Uns_attempt=0
                        site.is_ban=false
                        site.recoverycode='empty'
                        bcrypt.hash(newPassword,12,(err,hash)=>{
                            if(err){return res.status(200).json({
                                msg:'Unsuccessful',
                                error:err,
                                success:false,
                                status:403
                            })}
                            else{
                                site.HashingPassWord=hash
                                site.save()
                                .then(rs=>{return res.status(200).json({
                                    msg:'changed',
                                    error:[],
                                    success:true,
                                    status:200
                                })})
                                .catch(err=>{return res.status(200).json({
                                    msg:'Unsuccessful',
                                    error:err,
                                    success:false,
                                    status:403
                                })})
                            }
                        })

                    }
                    else{return res.status(200).json({
                        msg:'Unsuccessful',
                        error:err,
                        success:false,
                        status:403
                    })}
                })
            })
    }
    else{return res.status(200).json({
        msg:'Unsuccessful',
        error:['wrong request'],
        success:false,
        status:403
    })}
}

module.exports.active=(req,res)=>{
    const mode=req.params.mode
    const ID=req.params.ID
    const code=req.params.code
    
    if(mode=='users'){
        User.findOne({Number:ID})
            .then(user=>{
                bcrypt.compare(code,user.recoverycode,(err,result)=>{
                    if(err){return res.status(200).json({
                        msg:'Unsuccessful',
                        error:err,
                        success:false,
                        status:403
                    })}
                    else if(result){
                        user.Uns_attempt=0
                        user.is_ban=false
                        user.recoverycode='empty'
                        user.save()
                            .then(rs=>{return res.status(200).json({
                                msg:'actived',
                                error:[],
                                success:true,
                                status:200
                            })})
                            .catch(err=>{return res.status(200).json({
                                msg:'Unsuccessful',
                                error:err,
                                success:false,
                                status:403
                            })})
                    }
                    else{return res.status(200).json({
                        msg:'Unsuccessful',
                        error:['wrong password'],
                        success:false,
                        status:403
                    })}
                })
               
            })
    }
    else if(mode=='sites'){
        Sites.findOne({Address:ID})
            .then(site=>{
                bcrypt.compare(code,site.recoverycode,(err,result)=>{
                    if(err){return res.status(200).json({
                        msg:'Unsuccessful',
                        error:err,
                        success:false,
                        status:403
                    })}
                    else if(result){
                        site.Uns_attempt=0
                        site.is_ban=false
                        site.recoverycode='empty'
                        site.save()
                        .then(rs=>{return res.status(200).json({
                            msg:'actived',
                            error:[],
                            success:true,
                            status:200
                        })})
                        .catch(err=>{return res.status(403).json({
                            msg:'Unsuccessful',
                            error:err,
                            success:false,
                            status:403
                        })})
                    }
                    else{return res.status(200).json({
                        msg:'Unsuccessful',
                        error:err,
                        success:false,
                        status:403
                    })}
                })
            })
    }
    else{return res.status(200).json({
        msg:'Unsuccessful',
        error:['wrong request'],
        success:false,
        status:403
    })}
}

module.exports.sendrecoveryemailforsites=(req,res)=>{//Done

    const Address=req.body.Address
    
    Sites.findOne({Address:Address})
        .then(site=>{
            let code
            const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
            const rnd1=Math.floor(Math.random()*26)
            code=letters[rnd1]
            for(let i=0;i<40;i++){
                const rnd=Math.floor(Math.random()*letters.length)
                code=code+letters[rnd]
            }
            const link=`localhost:3000/changePassword/sites/${Address}/${code}`
            bcrypt.hash(code,12,(err,hash)=>{
                if(err){
                    return res.status(200).json({
                        msg:'Unsuccessful',
                        link:null,
                        error:err,
                        success:false,
                        status:403
                    })
                }else{
                    site.recoverycode=hash
                    site.save()
                    .then(result=>{
                        site.save()
                        .then(result=>{
                            //client.sendMessage(sender,Number ,`use this link to Activation Account or choose new password:\n${link}`,GroupID)
                            // .then((receipt) => {return res.status(200).json({msg:'link sent'})})
                            // .catch(err=>{return res.status(403).json({
                            //     msg:'Unsuccessful',
                            //     error:err,
                            //     success:false,
                            //     status:403
                            // })})
                            return res.status(200).json({
                                msg:'link sent',
                                link:link,
                                error:err,
                                success:true,
                                status:200
                            })
                        })
                        .catch(err=>{return res.status(200).json({
                            msg:'Unsuccessful',
                            link:null,
                            error:err,
                            success:false,
                            status:403
                        })})
                    })
                    .catch(err=>{return res.status(200).json({
                        msg:'Unsuccessful',
                        link:null,
                        error:err,
                        success:false,
                        status:403
                    })})
                }
            })
            return true
        })
        .catch(err=>{return res.status(200).json({
            msg:'wrong Address',
            link:null,
            error:err,
            success:false,
            status:403
        })})
}

module.exports.AddAllUsers=(req,res)=>{//Done
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Address=decoded.Address

    

    
    const users=req.body.users
    
    Sites.findOne({Address:Address})
        .then(site=>{
            const getusers=[...site.users]
            for(let i=0;i<users.length;i++){
                let check=false
                for(let j=0;j<getusers.length;j++){
                    if(getusers[j].username==users[i]){
                        check==true
                        break;
                    }
                    if(j==getusers.length-1&&check==false){
                        let code
                        const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
                        const rnd1=Math.floor(Math.random()*26)
                        code=letters[rnd1]
                        for(let i=0;i<5;i++){
                            const rnd=Math.floor(Math.random()*letters.length)
                            code=code+letters[rnd]
                        }
                        getusers.push({
                            username:users[i],
                            registered:false,
                            userid:null,
                            usercode:code
                        })
                    }
                }
            }
            site.users=getusers
            site.AddedUsers=true
            site.save()
                .then(result=>{return res.status(200).json({
                    msg:'Added',
                    error:[],
                    success:true,
                    status:200
                })})
                .catch(err=>{return res.status(200).json({
                    msg:'Unsuccessful',
                    error:err,
                    success:false,
                    status:403
                })})
        })
        .catch(err=>{return res.status(200).json({
            msg:'Unsuccessful',
            error:err,
            success:false,
            status:403
        })})
}

module.exports.getuserinfo=(req,res)=>{//Done
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Number=decoded.Number

    const loginCode=decoded.code    
    User.findOne({Number:Number})
    .then(user=>{
        bcrypt.compare(loginCode,user.loginCode,(err,result)=>{
            if(err){
                return res.status(200).json({
                    msg:'Unsuccessful',
                    error:err,
                    success:false,
                    status:403
                })
            }else if(!result){
                return res.status(200).json({
                    msg:'Unsuccessful',
                    error:[],
                    success:false,
                    status:403
                })
            }
        })
    })
    
    User.findOne({Number:Number})
        .then(user=>{
            const Number=user.Number
            const sites=[...user.sites]
            const postsites=[]
            for(let i=0;i<sites.length;i++){
                postsites.push({
                    SiteAddress:sites[i].SiteAddress,
                    username:sites[i].username
                })
            }
            return res.status(200).json({
                msg:'Done',
                Number:Number,
                success:true,
                sites:postsites
            })
        })
        .catch(err=>{return res.status(200).json({
            msg:'Unsuccessful',
            error:err,
            success:false,
            status:403
        })})
}

module.exports.getusercode=(req,res)=>{//Done
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Address=decoded.Address

    

    
    const username=req.body.username
    
    Sites.findOne({Address:Address})
        .then(site=>{
            const getuserinfo=[...site.users]
            for(let i=0;i<getuserinfo.length;i++){
                if(getuserinfo[i].username==username){
                    if(getuserinfo[i].registered==true){
                        return res.status(200).json({
                            msg:'already_added',
                            error:['user already added site'],
                            success:false,
                            status:403
                        })
                    }else{
                        return res.status(200).json({
                            msg:'not_Added',
                            username:username,
                            code:getuserinfo[i].usercode,
                            error:[],
                            success:true,
                            status:200
                        })
                    }
                }
            }
            return res.status(200).json({
                msg:'user_not_founded',
                error:['wrong username'],
                success:false,
                status:404
            })
        })
        .catch(err=>{return res.status(200).json({
            msg:'Unsuccessful',
            error:err,
            success:false,
            status:403
        })})
}

module.exports.DeleteAccount=(req,res)=>{
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Number=decoded.Number

    const loginCode=decoded.code    
    User.findOne({Number:Number})
    .then(user=>{
        bcrypt.compare(loginCode,user.loginCode,(err,result)=>{
            if(err){
                return res.status(200).json({
                    msg:'Unsuccessful',
                    error:err,
                    success:false,
                    status:403
                })
            }else if(!result){
                return res.status(200).json({
                    msg:'Unsuccessful',
                    error:[],
                    success:false,
                    status:403
                })
            }
        })
    })
    
    User.findOne({Number:Number})
        .then(user=>{
            const AllSites=[...user.sites]
            for(let i=0;i<AllSites.length;i++){
                Sites.findOne({Address:AllSites[i].SiteAddress})
                    .then(site=>{
                        const getUsers=[...site.users]
                        for(let j=0;j<getUsers.length;j++){
                            if(getUsers[j].userid==Number){
                                let code
                                const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
                                const rnd1=Math.floor(Math.random()*26)
                                code=letters[rnd1]
                                for(let i=0;i<5;i++){
                                    const rnd=Math.floor(Math.random()*letters.length)
                                    code=code+letters[rnd]
                                }
                                getUsers[j].usercode=code
                                getUsers[j].registered=false
                                getUsers[j].userid=null
                                j=getUsers.length
                            }
                        }
                        site.users=getUsers
                        site.save()
                    })
                    .catch(err=>{return res.status(403).json({
                        msg:'Unsuccessful',
                        error:err,
                        success:false,
                        status:403
                    })})
            }
            User.findOneAndDelete({Number:Number}, function (err, rs) { 
                if (err){console.log(err)} 
                else{return res.status(200).json({
                    msg:'User_Deleted',
                    error:[],
                    success:true,
                    status:200
                })} 
            });
            return 0
        })
        .catch(err=>{return res.status(200).json({
            msg:'Unsuccessful',
            error:err,
            success:false,
            status:403
        })})
}

module.exports.setEmail=(req,res)=>{
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Number=decoded.Number

    const loginCode=decoded.code    
    User.findOne({Number:Number})
    .then(user=>{
        bcrypt.compare(loginCode,user.loginCode,(err,result)=>{
            if(err){
                return res.status(200).json({
                    msg:'Unsuccessful',
                    error:err,
                    success:false,
                    status:403
                })
            }else if(!result){
                return res.status(200).json({
                    msg:'Unsuccessful',
                    error:[],
                    success:false,
                    status:403
                })
            }
        })
    })
    
    const Email=req.body.Email
    
    if(validateEmail(Email)==false){
    return res.status(200).json({
        msg:'Wrong_Email',
        error:['wrong Email'],
        link:[],
        success:false,
        status:403
    })}
    
    User.find({EmailAddress:Email})
        .then(user=>{
            if(user.length>1||(user.length==1&&user.Number!=Number)){
                return res.status(200).json({
                    msg:'this_Email_is_already_Exist',
                    error:['repititive mail'],
                    link:[],
                    success:false,
                    status:403
                })
            }
            User.findOne({Number:Number})
            .then(user1=>{
                const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
                const rnd1=Math.floor(Math.random()*26)
                let code=letters[rnd1]
                for(let i=0;i<59;i++){
                    const rnd=Math.floor(Math.random()*letters.length)
                    code=code+letters[rnd]
                }
                const link=`localhost:4000/ActiveEmail/${Number}/${code}`
                user1.EmailAddress=Email            
                bcrypt.hash(code,12,(err,hash)=>{
                    if(err){
                        return res.status(200).json({
                            msg:'Unsuccessful',
                            error:err,
                            link:[],
                            success:false,
                            status:403
                        })
                    }else{
                        user1.Added_Email=false
                        user1.Email_Activator_code=hash
                        //sendMail(Email,'Activator link for Email',link)
                        user1.save()
                            .then(result=>{return res.status(200).json({
                                msg:'Email_Added',
                                error:[],
                                link:link,
                                success:true,
                                status:200
                            })})
                            .catch(err=>{return res.status(200).json({
                                msg:'Unsuccessful',
                                error:err,
                                link:[],
                                success:false,
                                status:403
                            })})
                    }
                })
            })
        })
        .catch(err=>{return res.status(200).json({
            msg:'Unsuccessful',
            error:err,
            link:[],
            success:false,
            status:403
        })})
}

module.exports.ActiveEmail=(req,res)=>{
    const Number=req.params.Number
    const code=req.params.code
    
    User.findOne({Number:Number})
        .then(user=>{
            bcrypt.compare(code,user.Email_Activator_code,(err,result)=>{
                if(err){return res.status(200).json({
                    msg:'Wrong_link',
                    error:err,
                    success:false,
                    status:403
                })}
                else if(result){
                    user.Added_Email=true
                    user.Email_Activator_code='empty'
                    user.save()
                        .then(rs=>{return res.status(200).json({
                            msg:'Email_is_Active',
                            error:[],
                            success:true,
                            status:200
                        })})
                        .catch(err=>{return res.status(403).json({
                            msg:'Unsuccessful',
                            error:err,
                            success:false,
                            status:403
                        })})
                }
                else{return res.status(200).json({
                    msg:'Wrong_link',
                    error:['wrong link'],
                    success:false,
                    status:403
                })}
            })
        })
        .catch(err=>{return res.status(200).json({
            msg:'Unsuccessful',
            error:err,
            success:false,
            status:403
        })})
}

module.exports.SendDelLink=(req,res)=>{

    const Email=req.body.Email
    
    User.findOne({EmailAddress:Email})
        .then(user=>{
            if(user.Added_Email==false){return res.status(200).json({
                msg:'Email is not Active',
                error:['Email is not Active'],
                success:false,
                status:403
            })}
            const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
            const rnd1=Math.floor(Math.random()*26)
            let code=letters[rnd1]
            for(let i=0;i<59;i++){
                const rnd=Math.floor(Math.random()*letters.length)
                code=code+letters[rnd]
            }
            const link=`localhost:4000/DelByLink/${Email}/${code}`
            bcrypt.hash(code,12,(err,hash)=>{
                if(err){return res.status(200).json({
                    msg:'Unsuccessful',
                    link:null,
                    error:err,
                    success:false,
                    status:403
                })}
                else{
                    user.Del_Acc_Link=hash
                    user.save()
                    .then(result=>{
                        //sendMail(Email,'Delete Account Link',link)
                        return res.status(200).json({
                            msg:'link sent',
                            link:link,
                            error:[],
                            success:true,
                            status:200
                        })
                    })
                    .catch(err=>{return res.status(200).json({
                        msg:'Unsuccessful',
                        error:err,
                        link:null,
                        success:false,
                        status:403
                    })})
                }
            })
        })
        .catch(err=>{return res.status(200).json({
            msg:'Unsuccessful',
            link:null,
            error:err,
            success:false,
            status:403
        })})
}

module.exports.DelByLink=(req,res)=>{
    const Email=req.params.Email
    const code=req.params.code
    
    User.findOne({EmailAddress:Email})
        .then(user=>{
            bcrypt.compare(code,user.Del_Acc_Link,(err,result)=>{
                if(err){
                    return res.status(200).json({
                        msg:'Unsuccessful1',
                        error:err,
                        success:false,
                        status:403
                    })
                }else if(result){
                    if(user.Added_Email==false){return res.status(200).json({
                        msg:'Email is not Active',
                        error:['Email is not Active'],
                        success:false,
                        status:403
                    })}
                    const AllSites=[...user.sites]
                    for(let i=0;i<AllSites.length;i++){
                        Sites.findOne({Address:AllSites[i].SiteAddress})
                            .then(site=>{
                                let getUsers=[...site.users]
                                for(let j=0;j<getUsers.length;j++){
                                    if(getUsers[j].userid==user.Number){
                                        let code
                                        const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
                                        const rnd1=Math.floor(Math.random()*26)
                                        code=letters[rnd1]
                                        for(let i=0;i<5;i++){
                                            const rnd=Math.floor(Math.random()*letters.length)
                                            code=code+letters[rnd]
                                        }
                                        getUsers[j].registered=false
                                        getUsers[j].userid=null
                                        getUsers[j].usercode=code
                                        site.users=getUsers
                                        site.save()
                                        .then(result=>{})
                                        .catch(err=>{
                                            return res.status(200).json({
                                                msg:'Unsuccessful2',
                                                error:err,
                                                success:false,
                                                status:403
                                            })
                                        })
                                    }
                                }

                            })
                            .catch(err=>{return res.status(200).json({
                                msg:'Unsuccessful3',
                                error:err,
                                success:false,
                                status:403
                            })})
                    }
                    User.findOneAndDelete({EmailAddress:Email}, function (err, rs) { 
                        if (err){console.log(err)} 
                        else{return res.status(200).json({
                            msg:'User_Deleted',
                            error:[],
                            success:true,
                            status:200
                        })} 
                    });
                    return 0
                }else{
                    return res.status(200).json({
                        msg:'Unsuccessful4',
                        error:['wrong code'],
                        success:false,
                        status:403
                    })
                }
            })

        })
        .catch(err=>{return res.status(200).json({
            msg:'Unsuccessful5',
            error:err,
            success:false,
            status:403
        })})
}

module.exports.showQR=(req,res)=>{
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Number=decoded.Number

    const loginCode=decoded.code    
    User.findOne({Number:Number})
    .then(user=>{
        bcrypt.compare(loginCode,user.loginCode,(err,result)=>{
            if(err){
                return res.status(200).json({
                    msg:'Unsuccessful',
                    error:err,
                    success:false,
                    status:403
                })
            }else if(!result){
                return res.status(200).json({
                    msg:'Unsuccessful',
                    error:[],
                    success:false,
                    status:403
                })
            }
        })
    })
    
    
    User.findOne({Number:Number})
        .then(user=>{
            const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
            const rnd1=Math.floor(Math.random()*26)
            let code=letters[rnd1]
            for(let i=0;i<59;i++){
                const rnd=Math.floor(Math.random()*letters.length)
                code=code+letters[rnd]
            }
            let date=new Date()
            date =date.getTime()
            date=date/1000
            date=Math.floor(date)
            date=date+600
            user.change_Device_code=code
            user.change_Device_Time=date
            user.save()
                .then(result=>{
                    return res.status(200).json({
                        msg:'Done',
                        Number:Number,
                        code:code,
                        error:[],
                        success:true,
                        status:200
                    })
                })
        })
        .catch(err=>{return res.status(200).json({
            msg:'Unsuccessful',
            Number:[],
            code:[],
            error:err,
            success:false,
            status:403
        })})
}

module.exports.getQR=(req,res)=>{
    const Number=req.body.Number
    const code=req.body.code
    const DI=req.body.DeviceId
    
    User.findOne({Number:Number})
        .then(user=>{
            if(code==user.change_Device_code){
                let date=new Date()
                date =date.getTime()
                date=date/1000
                date=Math.floor(date)
                if(date<=user.change_Device_Time){
                    user.DeviceId=DI
                    user.save()
                        .then(result=>{return res.status(200).json({
                            msg:'changed',
                            error:[],
                            success:true,
                            status:200
                        })})
                        .catch(err=>{return res.status(200).json({
                            msg:'Unsuccessful',
                            error:err,
                            success:false,
                            status:403
                        })})
                }
                else{ return res.status(200).json({
                    msg:'Unsuccessful',
                    error:['time out'],
                    success:false,
                    status:403
                })}
            }
        })
        .catch(err=>{return res.status(403).json({
            msg:'Unsuccessful',
            error:err,
            success:false,
            status:403
        })})
}

module.exports.newNumber=(req,res)=>{
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Number=decoded.Number

    const loginCode=decoded.code    
    User.findOne({Number:Number})
    .then(user=>{
        bcrypt.compare(loginCode,user.loginCode,(err,result)=>{
            if(err){
                return res.status(200).json({
                    msg:'Unsuccessful',
                    error:err,
                    success:false,
                    status:403
                })
            }else if(!result){
                return res.status(200).json({
                    msg:'Unsuccessful',
                    error:[],
                    success:false,
                    status:403
                })
            }
        })
    })
    
    const newNumber=req.body.newNumber
    User.find({Number:newNumber})
    .then(user=>{
        if(user.length>=1){return res.status(200).json({
            msg:'already exist',
            error:[],
            success:false,
            status:403
        })}
    })
    User.findOne({Number:Number})
        .then(user=>{
            if(validateNumber(newNumber)==false){
                return res.status(200).json({
                    msg:'wrong number',
                    error:err,
                    success:false,
                    status:403
                })
            }
            const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
            const rnd1=Math.floor(Math.random()*26)
            let code=letters[rnd1]
            for(let i=0;i<59;i++){
                const rnd=Math.floor(Math.random()*letters.length)
                code=code+letters[rnd]
            }
            const link=`localhost:3000/SetNumber/${Number}/${newNumber}/${code}`
            bcrypt.hash(code,12,(err,hash)=>{
                if(err){return res.status(200).json({
                    msg:'Unsuccessful',
                    error:err,
                    success:false,
                    status:403
                })}
                else{
                    user.change_Number_code=hash
                    user.save(result=>{
                        //send SMS
                        user.save()
                        .then(result=>{
                            // client.sendMessage(sender,Number ,`use this link to change Number:\n${link}`,GroupID)
                            // .then((receipt) => {return res.status(200).json({msg:'link sent'})})
                            // .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                            return res.status(200).json({
                                msg:'link sent',
                                error:[],
                                link:link,
                                success:true,
                                status:200
                            })
                        })
                        .catch(err=>{return res.status(200).json({
                            msg:'Unsuccessful',
                            error:err,
                            success:false,
                            status:403
                        })})
                    })
                }
            })
        })
        .catch(err=>{return res.status(200).json({
            msg:'Unsuccessful',
            error:err,
            success:false,
            status:403
        })})
}

module.exports.changeNumber=(req,res)=>{
    const Number=req.params.Number
    const newNumber=req.params.newNumber
    const code=req.params.code
    
    User.find({Number:newNumber})
    .then(user=>{
        if(user.length>=1){return res.status(200).json({
            msg:'this Number is already exist',
            error:['repetitive Number'],
            success:false,
            status:403
        })}
        AddToDB()
    })
    
    User.findOne({Number:Number})
        .then(user=>{
            if(user.change_Number_code=='empty'){return res.status(200).json({
                msg:'Unsuccessful',
                error:['enable change number link'],
                success:false,
                status:403
            })}
            bcrypt.hash(code,user.change_Number_code,(err,result)=>{
                if(err){return res.status(200).json({
                    msg:'Unsuccessful',
                    error:err,
                    success:false,
                    status:403
                })}
                else if(result){
                    user.Number=newNumber
                    user.change_Number_code='empty'
                    user.save()
                        .then(rs=>{return res.status(200).json({
                            msg:'Number changed',
                            error:[],
                            success:true,
                            status:200
                        })})
                        .catch(err=>{return res.status(200).json({
                            msg:'Unsuccessful',
                            error:err,
                            success:false,
                            status:403
                        })})
                }
                else{return res.status(200).json({
                    msg:'Unsuccessful',
                    error:err,
                    success:false,
                    status:403
                })}
            })
        })
        .catch(err=>{return res.status(200).json({
            msg:'Unsuccessful',
            error:err,
            success:false,
            status:403
        })})
}

module.exports.getSiteToken=(req,res)=>{
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Address=decoded.Address

    

    
    Sites.findOne({Address:Address})
    .then(site=>{
        const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
            const rnd1=Math.floor(Math.random()*26)
            let code=letters[rnd1]
            for(let i=0;i<59;i++){
                const rnd=Math.floor(Math.random()*letters.length)
                code=code+letters[rnd]
            }
        const token = jwt.sign({
            Address:site.Address,
            Number:site.Number,
            mode:'code_Checker',
            code:code
        },'secret',{expiresIn:'1y'})
        
        bcrypt.hash(code,12,(err,hash)=>{
            if(err){
                return res.status(200).json({
                    success:false,
                    status:400,
                    token:[],
                    error:err
                })
            }else{
                site.loginCode=hash
                site.save()
                .then(result=>{
                    return res.status(200).json({
                        success:true,
                        status:200,
                        token:token,
                        error:[]
                    })
                })
                .catch(err=>{
                    return res.status(200).json({
                        success:true,
                        status:200,
                        token:token,
                        error:[]
                    })
                })
            }
        })
    })
    .catch(err=>{
        return res.status(200).json({
            success:false,
            status:400,
            token:[],
            error:err
        })
    })
}

module.exports.AutoLogin=(req,res)=>{
    const token=(req.body.token.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Number=decoded.Number
    const address=req.body.address

    User.findOne({Number:Number})
    .then(user=>{
        const sites=[...user.sites]
        for(let i=0;i<sites.length;i++){
            if(sites[i].SiteAddress===address){

                const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
                const rnd1=Math.floor(Math.random()*26)
                let code=letters[rnd1]
                for(let i=0;i<59;i++){
                    const rnd=Math.floor(Math.random()*letters.length)
                    code=code+letters[rnd]
                }

                let date=new Date()
                date =date.getTime()
                date=date/1000
                date=Math.floor(date)

                user.AutoLogin.loginCode=code
                user.AutoLogin.Address=address
                user.AutoLogin.ExpTime=date+60
                user.save()
                .then(resp=>{
                    return res.status(200).json({
                        success:true,
                        loginCode:user.AutoLogin.loginCode,
                        username:sites[i].username
                    })
                })
                .catch(err=>{
                    return res.status(200).json({
                        success:false,
                        loginCode:err
                    })
                })
                return
            }
        }
    })
}

module.exports.AutoLoginAuth=(req,res)=>{
    const username=req.body.username
    const code=req.body.code

    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Address=decoded.Address

    Sites.findOne({Address:Address})
    .then(site=>{
        const siteUsers=[...site.users]
        for(let i=0;i<siteUsers.length;i++){
            if(siteUsers[i].username===username){
                const userNumber=siteUsers[i].userid
                User.findOne({Number:userNumber})
                .then(user=>{
                    if(user.AutoLogin.loginCode===code){
                        if(user.AutoLogin.Address===Address){//zaman check shavad
                            return res.status(200).json({
                                success:true
                            })
                        }else{
                            return res.status(200).json({
                                success:false
                            })
                        }
                    }else{
                        return res.status(200).json({
                            success:false
                        })
                    }
                })
            }
        }
    })
}