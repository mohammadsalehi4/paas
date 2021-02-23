const express=require('express')
const router=express.Router()
const User = require('../model/user')
const bcrypt=require('bcryptjs')
const Sites = require('../model/site')
const jwt=require('jsonwebtoken')
const nodemailer = require('nodemailer');
const sendSMS=require('trez-sms-client')
const { get } = require('mongoose')
const { use } = require('../routes/user')
const user = require('../model/user')
const client=new sendSMS('mohammad4salehi','59215921')
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
          user: 'mohamadsalehi473@gmail.com',
          pass: '23220171eH'
        }
      });
      
      var mailOptions = {
        from: 'mohamadsalehi473@gmail.com',
        to: email,
        subject: subject,
        text:text
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {return false} 
        else {return true}
      });
}

module.exports.postSignUp=(req,res)=>{
    const fullname=req.body.fullname
    let Number=req.body.Number
    const DeviceId=req.body.DeviceId
    const password=req.body.password
    
    Number=String(Number)
    
    const AddToDB=function(){
        bcrypt.hash(password,12,(err,hash1)=>{
            if(err){
                return res.status(403).json({msg:'Unsuccessful'})
            }else{
                const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
                const rnd1=Math.floor(Math.random()*26)
                let code=letters[rnd1]
                for(let i=0;i<59;i++){
                    const rnd=Math.floor(Math.random()*letters.length)
                    code=code+letters[rnd]
                }
                bcrypt.hash(code,12,(err,hash)=>{
                    if(err){return res.status(403).json({msg:'Unsuccessful'})}
                    else{
                        const link=`localhost:4000/ActiveAccount/${Number}/${code}`
                        const user=new User({
                            fullName:fullname,
                            Number:Number,
                            change_Number_code:'empty',
                            Activator_code:hash,
                            DeviceId:DeviceId,
                            change_Device_code:'empty',
                            change_Device_Time:0,
                            HashingPassword:hash1,
                            Uns_attempt:0,
                            is_ban:true,
                            recoverycode:'empty',
                            EmailAddress:'empty',
                            Email_Activator_code:'Empty',
                            Added_Email:false,
                            Del_Acc_Link:'empty',
                            sites:[]
                        })
                        user.save()
                            .then(result=>{
                                client.sendMessage(sender,Number ,`.برای فعالسازی اکانت روی لینک زیر کلیک کنید.\n${link}`,GroupID)
                                .then((receipt) => {return res.status(200).json({msg:'user created'})})
                                .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                            })
                            .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                    }
                })
            }
        })
    }
    
    const ExistingChecker=function(){
        User.find({Number:Number})
            .then(user=>{
                if(user.length>=1){return res.status(403).json({msg:'this Number is already exist'})}
                AddToDB()
            })
            .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
    }
    
    const Validator=function(){
        if(validateNumber(Number)==false){return res.status(403).json({msg:'Wrong Phone Number format'})}
        if(password.length<8){return res.status(403).json({msg:'Enter longer password'})}
        if(fullname==' '||fullname==''||fullname.length<=2){return res.status(403).json({ msg:'enter true fullname'})}
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
        bcrypt.hash(password,12,(err,hash1)=>{
            if(err){
                return res.status(403).json({msg:'Unsuccessful'})
            }else{
                const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
                const rnd1=Math.floor(Math.random()*26)
                let code=letters[rnd1]
                for(let i=0;i<59;i++){
                    const rnd=Math.floor(Math.random()*letters.length)
                    code=code+letters[rnd]
                }
                bcrypt.hash(code,12,(err,hash)=>{
                    if(err){return res.status(403).json({msg:'Unsuccessful'})}
                    else{
                        const link=`localhost:4000/ActiveSite/${Address}/${code}`
                        const site =new Sites({
                            Address:Address,
                            HashingPassWord:hash1,
                            Number:Number,
                            recoverycode:'empty',
                            Activator_code:hash,
                            is_ban:true,
                            Uns_attempt:0,
                            AddedUsers:false,
                            ExpireDate:{
                                year:1399,
                                month:12,
                                day:29
                            },
                            users:[]
                        })
                        site.save()
                            .then(result=>{
                                return res.status(200).json({msg:'user created',link:link})
                                client.sendMessage(sender,Number ,`برای فعالسازی اکانت روی لینک زیر کلیک کنید.\n${link}`,GroupID)
                                .then((receipt) => {return res.status(200).json({msg:'user created'})})
                                .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                            })
                            .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                    }
                })
            }
        })
    }
    
    const ExistingChecker=function(){
        Sites.find({Address:Address})
            .then(site=>{
                if(site.length>=1){return res.status(403).json({msg:'this Address is already exist'})}
                Sites.find({Number:Number})
                    .then(site1=>{
                        if(site1.length>=1){return res.status(403).json({msg:'this Number is already exist'})}
                        AddToDB()
                    })
            })
            .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
    }
    
    const Validator=function(){
        if(validateNumber(Number)==false){return res.status(403).json({msg:'Wrong Phone Number format'})}
        if(validateAddress(Address)==false){return res.status(403).json({msg:'Wrong Address'})}
        if(password.length<16){return res.status(403).json({msg:'Enter longer password'})}
        ExistingChecker()
    }
    Validator()
}

module.exports.ActiveAccount=(req,res)=>{
    const Number=req.params.Number
    const code=req.params.code
    
    User.findOne({Number:Number})
        .then(user=>{
            if(user.Activator_code=='empty'){return res.status(403).json({msg:'Unsuccessful'})}
            bcrypt.compare(code,user.Activator_code,(err,result)=>{
                if(err){
                    return res.status(403).json({msg:'Unsuccessful'})
                }else if(result){
                    user.is_ban=false
                    user.Uns_attempt=0
                    user.Activator_code='empty'
                    user.save() 
                        .then(rs=>{return res.status(200).json({msg:'Account is Active'})})
                        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                }else{
                    return res.status(403).json({msg:'Unsuccessful'})
                }
            })
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.ActiveSite=(req,res)=>{
    const Address=req.params.Address
    const code=req.params.code
    
    Sites.findOne({Address:Address})
        .then(user=>{
            if(user.Activator_code=='empty'){return res.status(403).json({msg:'Unsuccessful1'})}
            bcrypt.compare(code,user.Activator_code,(err,result)=>{
                if(err){
                    return res.status(403).json({msg:'Unsuccessful2'})
                }else if(result){
                    user.is_ban=false
                    user.Uns_attempt=0
                    user.Activator_code='empty'
                    user.save() 
                        .then(rs=>{return res.status(200).json({msg:'Account is Active'})})
                        .catch(err=>{return res.status(403).json({msg:'Unsuccessful3'})})
                }else{
                    return res.status(403).json({msg:'Unsuccessful4'})
                }
            })
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful5'})})
}

module.exports.postLogin=(req,res)=>{
    const Number=req.body.Number
    const password=req.body.password
    const DeviceId=req.body.DeviceId
    
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
                bcrypt.hash(code,12,(err,hash)=>{
                    if(err){return res.status(403).json({msg:'Unsuccessful'})}
                    else{
                        const link=`localhost.com/ActiveAccount/${Number}/${code}`
                        user.Activator_code=hash
                        user.save()
                            .then(result=>{
                                client.sendMessage(sender,Number ,`برای فعالسازی اکانت روی لینک زیر کلیک کنید.\n${link}`,GroupID)
                            })
                            .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                    }
                })
                return res.status(403).json({msg:'ban'})
            }
            if(user.DeviceId!=DeviceId){return res.status(403).json({msg:'Wrong_Device_ID'})}
            bcrypt.compare(password,user.HashingPassword,(err,result)=>{
                if(err){
                    let UA=user.Uns_attempt
                    UA=Number(UA)
                    UA++
                    user.Uns_attempt=UA
                    if(UA==3){user.is_ban=true}
                    user.save()
                    return res.status(401).json({msg:'Auth Failed!'})
                }
                else if(result){
                    const token = jwt.sign({
                        Number:user.Number,
                        fullName:user.fullName
                    },'secret',{expiresIn:'1h'})
                    user.Uns_attempt=0
                    user.save()
                        .then(result=>{
                            return res.status(200).json({
                                msg:'login_Successful!',
                                token:token
                            })
                        })
                        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                }else{                    
                    let UA=user.Uns_attempt
                    UA=Number(UA)
                    UA++
                    user.Uns_attempt=UA
                    if(UA==3){user.is_ban=true}
                    user.save()
                    return res.status(401).json({msg:'Auth Failed!'})
                }
            })
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.loginForSites=(req,res)=>{//Done
    const Address=req.body.Address
    const password=req.body.password
    
    Sites.findOne({Address:Address})
        .then(user=>{
            if(user.is_ban==true){
                const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
                const rnd1=Math.floor(Math.random()*26)
                let code=letters[rnd1]
                for(let i=0;i<59;i++){
                    const rnd=Math.floor(Math.random()*letters.length)
                    code=code+letters[rnd]
                }
                bcrypt.hash(code,12,(err,hash)=>{
                    if(err){return res.status(403).json({msg:'Unsuccessful'})}
                    else{
                        const link=`localhost.com/ActiveSite/${Address}/${code}`
                        user.Activator_code=hash
                        user.save()
                            .then(result=>{
                                client.sendMessage(sender,user.Number ,`برای فعالسازی اکانت روی لینک زیر کلیک کنید.\n${link}`,GroupID)
                            })
                            .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                    }
                })
                return res.status(403).json({msg:'ban'})
            }
            bcrypt.compare(password,user.HashingPassWord,(err,result)=>{
                if(err){
                    let UA=user.Uns_attempt
                    UA=Number(UA)
                    UA++
                    user.Uns_attempt=UA
                    if(UA==3){user.is_ban=true}
                    user.save()
                    return res.status(401).json({msg:'Auth Failed!'})
                }
                else if(result){
                    const token = jwt.sign({
                        Address:user.Address,
                        Number:user.Number,
                    },'secret',{expiresIn:'1y'})
                    user.Uns_attempt=0
                    user.save()
                        .then(result=>{
                            return res.status(200).json({
                                msg:'login_Successful!',
                                token:token
                            })
                        })
                        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                }else{                    
                    let UA=user.Uns_attempt
                    UA=Number(UA)
                    UA++
                    user.Uns_attempt=UA
                    if(UA==3){user.is_ban=true}
                    user.save()
                    return res.status(401).json({msg:'Auth Failed!'})
                }
            })
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
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
                    return res.status(403).json({
                        username:username,
                        msg:'already_Added_from_before'
                    })
                }
            }
            let code
            const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
            const rnd1=Math.floor(Math.random()*26)
            code=letters[rnd1]
            for(let i=0;i<5;i++){
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
                        username:username,
                        msg:'user_Added',
                        code:code
                    })
                )})
                .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.AddSiteToDb=(req,res)=>{//Done
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Number=decoded.Number
    
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
                                    .then(rs=>{return(res.status(200).json({msg:'Added'}))})
                                    .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
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
                            }else{return res.status(403).json({msg:'wrong code'})}
                        }else{return res.status(403).json({msg:'you are already added this site'})}
                    }
                }
                return res.status(404).json({msg:'need_add_to_db_from_site'})
            }
            siteChecker()
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.getcode=(req,res)=>{//Done
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Number=decoded.Number
    
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
                            return res.status(403).json({msg:'Unsuccessful'})
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
                                        code:code
                                    }))
                                })
                                .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                        }
                    })
                    return true
                }
            }
            return res.status(404).json({msg:'Wrong_Address'})
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
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
                                        value:'wrong code'
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
                                                    value:'auth completed'
                                                })
                                                .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                                            })                                            
                                        }else{
                                            return res.status(200).json({
                                                msg:'login auth',
                                                username:username,
                                                authentication:false,
                                                value:'has been used before'
                                            })
                                        }
                                    }else{
                                        return res.status(200).json({
                                            msg:'login auth',
                                            username:username,
                                            authentication:false,
                                            value:'expire time error'
                                        })
                                    }
                                }else{
                                    return res.status(200).json({
                                        msg:'login auth',
                                        username:username,
                                        authentication:false,
                                        value:'wrong code'
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
                            return res.status(404).json({msg:'wrong Address'})
                        }
                        
                        userchecker()
                    })
                    .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})  
            }
            
            const getusers=[...site.users]
            for(let i=0;i<getusers.length;i++){
                if(getusers[i].username==username){
                    const userid=getusers[i].userid
                    nxt(userid)
                    return true
                }
            }
            return res.status(404).json({msg:'wrong username'})
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.sendrecoveryemail=(req,res)=>{//Done
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
            const link=`localhost:4000/recovery/users/${Number}/${code}`
            bcrypt.hash(code,12,(err,hash)=>{
                if(err){return res.status(200).json({msg:'Unsuccessful2'})}
                else{
                    user.recoverycode=hash
                    user.save()
                        .then(result=>{
                            client.sendMessage(sender,Number ,`use this link for Activation.\n${link}`,GroupID)
                            .then((receipt) => {return res.status(200).json({msg:'link sent'})})
                            .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                        })
                        .catch(err=>{return res.status(403).json({msg:'Unsuccessful1'})})
                }
            })
        })
        .catch(err=>{return res.status(403).json({msg:'wrong Number'})})
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
                    if(err){return res.status(403).json({msg:'Unsuccessful1'})}
                    else if(result){
                        if(newPassword.length<8){return res.status(200).json({msg:'please choose longer password'})}
                        const DeviceId=req.body.DeviceId
                        user.DeviceId=DeviceId
                        user.Uns_attempt=0
                        user.is_ban=false
                        bcrypt.hash(newPassword,12,(err,hash)=>{
                            if(err){return res.status(403).json({msg:'Unsuccessful2'})}
                            else{user.HashingPassword=hash}
                        })
                        user.save()
                            .then(rs=>{return res.status(200).json({msg:'changed'})})
                            .catch(err=>{return res.status(403).json({msg:err})})
                            
                    }
                    else{return res.status(403).json({msg:'Unsuccessful4'})}
                })
               
            })
    }
    else if(mode=='sites'){
        Sites.findOne({Address:ID})
            .then(site=>{
                bcrypt.compare(code,site.recoverycode,(err,result)=>{
                    if(err){return res.status(403).json({msg:'Unsuccessful'})}
                    else if(result){
                        const newPassword=req.body.newPassword
                        site.Uns_attempt=0
                        site.is_ban=false
                        site.recoverycode='empty'
                        bcrypt.hash(newPassword,12,(err,hash)=>{
                            if(err){return res.status(403).json({msg:'Unsuccessful'})}
                            else{
                                site.HashingPassWord=hash
                                site.save()
                                .then(rs=>{return res.status(200).json({msg:site.HashingPassWord,hash:hash})})
                                .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                            }
                        })

                    }
                    else{return res.status(403).json({msg:'Unsuccessful'})}
                })
            })
    }
    else{return res.status(403).json({msg:'Unsuccessful'})}
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
            const link=`localhost:4000/recovery/sites/${Address}/${code}`
            bcrypt.hash(code,12,(err,hash)=>{
                if(err){
                    return res.status(403).json({msg:'Unsuccessful'})
                }else{
                    site.recoverycode=hash
                    site.save()
                    .then(result=>{
                        site.save()
                        .then(result=>{
                            return res.status(200).json({msg:'link sent',link:link})
                            client.sendMessage(sender,Number ,`برای فعالسازی اکانت و بازیابی رمز، روی لینک زیر کلیک کنید.\n${link}`,GroupID)
                            .then((receipt) => {return res.status(200).json({msg:'link sent'})})
                            .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                        })
                        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                    })
                    .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                }
            })
            return true
        })
        .catch(err=>{return res.status(403).json({msg:'wrong Address'})})
}

module.exports.extention=(req,res)=>{//Done
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Address=decoded.Address
    
    const mode=req.body.mode
    
    Sites.findOne({Address:Address})
        .then(site=>{
            const saveExt=function(){
                let y=site.ExpireDate.year
                let m=site.ExpireDate.month
                let d=site.ExpireDate.day
                y=Number(y)
                m=Number(m)
                d=Number(d)
                
                if(mode==1){
                    m++
                    if(m==13){
                        m=1
                        y++
                    }
                }else if(mode==2){
                    m=m+3
                    if(m>12){
                        m=m-12
                        y++
                    }
                }else if(mode==3){
                    m=m+6
                    if(m>12){
                        m=m-12
                        y++
                    }
                }
                else if(mode==4){y++}
                else{return res.status(403).json({msg:'Unsuccessful'})}
                site.ExpireDate.year=y
                site.ExpireDate.month=m
                site.ExpireDate.day=d
                site.save()
                    .then(result=>{
                        return res.status(200).json({
                            msg:'extentioned',
                            year:y,
                            month:m,
                            day:d
                        })
                    })
                    .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
            }
            
            const pay=function(){
                saveExt()
            }
            
            pay()
        })
}

module.exports.AddAllUsers=(req,res)=>{//Done
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Address=decoded.Address
    
    const users=req.body.users
    
    Sites.findOne({Address:Address})
        .then(site=>{
            if(site.AddedUsers==true){return res.status(403).json({msg:'already Added'})}
            const getusers=[...site.users]
            for(let i=0;i<users.length;i++){
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
            site.users=getusers
            site.AddedUsers=true
            site.save()
                .then(result=>{return res.status(200).json({msg:'Added'})})
                .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.getuserinfo=(req,res)=>{//Done
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Number=decoded.Number
    
    User.findOne({Number:Number})
        .then(user=>{
            const fullName=user.fullName
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
                fullName:fullName,
                Number:Number,
                sites:postsites
            })
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.getsiteinfo=(req,res)=>{//Done
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Address=decoded.Address
    
    Sites.findOne({Address:Address})
        .then(site=>{
            const getAddress=site.Address
            const Number=site.Number
            const ExpireDate=site.ExpireDate
            const getusers=site.users
            const users=[]
            for(let i=0;i<getusers.length;i++){
                users.push({
                    username:getusers[i].username,
                    registered:getusers[i].registered
                })
            }
            return res.status(200).json({
                msg:'Done',
                Address:getAddress,
                Number:Number,
                ExpireDate:ExpireDate,
                users:users
            })
            
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
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
                        return res.status(400).json({msg:'already_added'})
                    }else{
                        return res.status(200).json({
                            msg:'not_Added',
                            username:username,
                            code:getuserinfo[i].usercode
                        })
                    }
                }
            }
            return res.status(404).json({msg:'user_not_founded'})
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.DeleteAccount=(req,res)=>{
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Number=decoded.Number
    
    User.findOne({Number:Number})
        .then(user=>{
            const AllSites=[...user.sites]
            for(let i=0;i<AllSites.length;i++){
                Sites.findOne({Address:AllSites[i].SiteAddress})
                    .then(site=>{
                        const getUsers=[...site.users]
                        for(let j=0;j<getUsers.length;j++){
                            if(getUsers[j].userid==Number){
                                getUsers[j].usercode=null
                                getUsers[j].registered=false
                                getUsers[j].userid=null
                                j=getUsers.length
                            }
                        }
                        site.users=getUsers
                        site.save()
                    })
                    .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
            }
            User.findOneAndDelete({Number:Number}, function (err, rs) { 
                if (err){console.log(err)} 
                else{return res.status(200).json({msg:'User_Deleted'})} 
            });
            return 0
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.setEmail=(req,res)=>{
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Number=decoded.Number
    
    const Email=req.body.Email
    
    if(validateEmail(Email)==false){return res.status(403).json({msg:'Wrong_Email'})}
    
    User.find({EmailAddress:Email})
        .then(user=>{
            if(user.length>1||(user.length==1&&user.Number!=Number)){return res.status(404).json({msg:'this_Email_is_already_Exist'})}
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
                        return res.status(200).json({msg:'Unsuccessful'})
                    }else{
                        user1.Added_Email=false
                        user1.Email_Activator_code=hash
                        sendMail(Email,'Activator link for Email',link)
                        user1.save()
                            .then(result=>{return res.status(200).json({msg:'Email_Added'})})
                            .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                    }
                })
            })
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.ActiveEmail=(req,res)=>{
    const Number=req.params.Number
    const code=req.params.code
    
    User.findOne({Number:Number})
        .then(user=>{
            bcrypt.compare(code,user.Email_Activator_code,(err,result)=>{
                if(err){return res.status(403).json({msg:'Wrong_link'})}
                else if(result){
                    user.Added_Email=true
                    user.save()
                        .then(rs=>{return res.status(200).json({msg:'Email_is_Active'})})
                        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                }
                else{return res.status(403).json({msg:'Wrong_link'})}
            })
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.SendDelLink=(req,res)=>{
    const Email=req.body.Email
    
    User.findOne({EmailAddress:Email})
        .then(user=>{
            if(user.Added_Email==false){return res.status(403).json({msg:'Email is not Active'})}
            const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
            const rnd1=Math.floor(Math.random()*26)
            let code=letters[rnd1]
            for(let i=0;i<59;i++){
                const rnd=Math.floor(Math.random()*letters.length)
                code=code+letters[rnd]
            }
            const link=`localhost:4000/DelByLink/${Email}/${code}`
            bcrypt.hash(code,12,(err,hash)=>{
                if(err){return res.status(403).json({msg:'Unsuccessful'})}
                else{
                    user.Del_Acc_Link=hash
                    user.save()
                    .then(result=>{
                        sendMail(Email,'Delete Account Link',link)
                        return res.status(200).json({msg:'link sent',link:link})
                    })
                    .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                }
            })
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.DelByLink=(req,res)=>{
    const Email=req.params.Email
    const code=req.params.code
    
    User.findOne({EmailAddress:Email})
        .then(user=>{
            bcrypt.compare(code,user.Del_Acc_Link,(err,result)=>{
                if(err){
                    return res.status(403).json({msg:'Unsuccessful'})
                }else if(result){
                    if(user.Added_Email==false){return res.status(403).json({msg:'Email is not Active'})}
                    const AllSites=[...user.sites]
                    for(let i=0;i<AllSites.length;i++){
                        Sites.findOne({Address:AllSites[i].SiteAddress})
                            .then(site=>{
                                const getUsers=[...site.users]
                                for(let j=0;j<getUsers.length;j++){
                                    if(getUsers[j].userid==Number){
                                        getUsers[j].usercode=null
                                        getUsers[j].registered=false
                                        getUsers[j].userid=null
                                        j=getUsers.length
                                    }
                                }
                                site.users=getUsers
                                site.save()
                            })
                            .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                    }
                    User.findOneAndDelete({EmailAddress:Email}, function (err, rs) { 
                        if (err){console.log(err)} 
                        else{return res.status(200).json({msg:'User_Deleted'})} 
                    });
                    return 0
                }else{
                    return res.status(403).json({msg:'Unsuccessful'})
                }
            })

        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.showQR=(req,res)=>{
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Number=decoded.Number
    
    
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
                        code:code
                    })
                })
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
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
                        .then(result=>{return res.status(200).json({msg:'changed'})})
                        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                }
                else{ return res.status(403).json({msg:'Unsuccessful'})}
            }
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.newNumber=(req,res)=>{
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Number=decoded.Number
    
    const newNumber=req.body.newNumber
    
    User.findOne({Number:Number})
        .then(user=>{
            const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
            const rnd1=Math.floor(Math.random()*26)
            let code=letters[rnd1]
            for(let i=0;i<59;i++){
                const rnd=Math.floor(Math.random()*letters.length)
                code=code+letters[rnd]
            }
            const link=`localhost:4000/ChangeNumber/${Number}/${newNumber}/${code}`
            bcrypt.hash(code,12,(err,hash)=>{
                if(err){return res.status(403).json({msg:'Unsuccessful'})}
                else{
                    user.change_Number_code=hash
                    user.save(result=>{
                        //send SMS
                        user.save()
                        .then(result=>{
                            client.sendMessage(sender,Number ,`برای تغغیر شماره روی لینک زیر کلیک کنید.\n${link}`,GroupID)
                            .then((receipt) => {return res.status(200).json({msg:'link sent'})})
                            .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                        })
                        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                    })
                }
            })
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.changeNumber=(req,res)=>{
    const Number=req.params.Number
    const newNumber=req.params.newNumber
    const code=req.params.code
    
    User.findOne({Number:Number})
        .then(user=>{
            if(user.change_Number_code=='empty'){return res.status(403).json({msg:'Unsuccessful'})}
            bcrypt.hash(code,user.change_Number_code,(err,result)=>{
                if(err){return res.status(403).json({msg:'Unsuccessful'})}
                else if(result){
                    user.Number=newNumber
                    user.change_Number_code='empty'
                    user.save()
                        .then(rs=>{return res.status(200).json({msg:'Number changed'})})
                        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                }
                else{return res.status(403).json({msg:'Unsuccessful'})}
            })
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

