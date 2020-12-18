const express=require('express')
const router=express.Router()
const User = require('../model/user')
const bcrypt=require('bcryptjs')
const Sites = require('../model/site')
const jwt=require('jsonwebtoken')
const user = require('../model/user')

module.exports.postSignUp=(req,res)=>{
    const fullname=req.body.fullname
    const Email=req.body.Email
    const password=req.body.password

    function validateEmail(email)
    {
        var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        if (reg.test(email)){return true; }else{return false;}
    }
    
    const AddToDB=function(){
        bcrypt.hash(password,12,(err,hash)=>{
            if(err){
                return res.status(403).json({msg:'Unsuccessful'})
            }else{
                const user=new User({
                    fullName:fullname,
                    Email:Email,
                    HashingPassword:hash,
                    Uns_attempt:0,
                    is_ban:false,
                    is_google_register:false,
                    sites:[]
                })
                user.save()
                    .then(result=>{return res.status(200).json({msg:'user created'})})
                    .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
            }
        })
    }
    
    const ExistingChecker=function(){
        User.find({Email:Email})
            .then(user=>{
                if(user.length>=1){return res.status(403).json({msg:'this email is already exist'})}
                AddToDB()
            })
            .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
    }
    
    const Validator=function(){
        if(validateEmail(Email)==false){return res.status(403).json({msg:'Wrong Email format'})}
        if(password.length<8){return res.status(403).json({msg:'Enter longer password'})}
        if(fullname==' '||fullname==''||fullname.length<=2){return res.status(403).json({ msg:'enter true fullname'})}
        ExistingChecker()
    }
    Validator()
}

module.exports.postSignUpForSites=(req,res)=>{
    const Address=req.body.Address
    const Email=req.body.Email
    const password=req.body.password
    
    function validateEmail(email)
    {
        var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        if (reg.test(email)){return true; }else{return false;}
    }
    
    function validateAddress(Address)
    {
        var reg = /^\w+([-+.']\w+)*\.\w+([-.]\w+)*$/
        if (reg.test(Address)){return true; }else{return false;}
    }
    
    const AddToDB=function(){
        bcrypt.hash(password,12,(err,hash)=>{
            if(err){
                return res.status(403).json({msg:'Unsuccessful'})
            }else{
                const site =new Sites({
                    Address:Address,
                    HashingPassWord:hash,
                    Email:Email,
                    entry_code:{
                        code:0,
                        expired:false
                    },
                    is_ban:false,
                    Wrong_login_Number:0,
                    ExpireDate:{
                        year:1399,
                        month:12,
                        day:29
                    },
                    users:[]
                })
                site.save()
                    .then(result=>{return(res.status(200).json({msg:'site registred'}))})
                    .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
            }
        })

    }
    
    const ExistingChecker=function(){
        Sites.find({Address:Address})
            .then(site=>{
                if(site.length>=1){return res.status(403).json({msg:'this Address is already exist'})}
                AddToDB()
            })
            .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
    }
    
    const Validator=function(){
        if(validateEmail(Email)==false){return res.status(403).json({msg:'Wrong Email format'})}
        if(validateAddress(Address)==false){return res.status(403).json({msg:'Wrong Address'})}
        if(password.length<16){return res.status(403).json({msg:'Enter longer password'})}
        ExistingChecker()
    }
    Validator()
}

module.exports.postLogin=(req,res)=>{
    const Email=req.body.Email
    const password=req.body.password
    
    User.findOne({Email:Email})
        .then(user=>{
            bcrypt.compare(password,user.HashingPassword,(err,result)=>{
                if(err){return res.status(401).json({msg:'Auth Failed!'})}
                else if(result){
                    const token = jwt.sign({
                        Email:user.Email,
                        fullName:user.fullName
                    },'secret',{expiresIn:'1h'})
                    return res.status(200).json({
                        msg:'login_Successful!',
                        token:token
                    })
                }else{return res.status(401).json({msg:'Auth Failed!'})}
            })
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.loginForSites=(req,res)=>{
    const Address=req.body.Address
    const password=req.body.password
    
    Sites.findOne({Address:Address})
        .then(user=>{
            bcrypt.compare(password,user.HashingPassWord,(err,result)=>{
                if(err){return res.status(401).json({msg:'Auth Failed!'})}
                else if(result){
                    const token = jwt.sign({
                        Address:user.Address,
                        Email:user.Email,
                    },'secret',{expiresIn:'1y'})
                    return res.status(200).json({
                        msg:'login_Successful!',
                        token:token
                    })
                }else{return res.status(401).json({msg:'Auth Failed!'})}
            })
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.AddUserToSiteDb=(req,res)=>{
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
            const rand=Math.floor(Math.random()*100000000)
            users.push({
                username:username,
                registered:false,
                userid:null,
                usercode:rand
            })
            site.users=users
            site.save()
                .then(result=>{return(
                    res.status(200).json({
                        username:username,
                        msg:'user_Added'
                    })
                )})
                .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.AddSiteToDb=(req,res)=>{/*****************************************************/
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Email=decoded.Email
    
    const Address=req.body.Address
    const username=req.body.username
    const code=req.body.code
    
    Sites.findOne({Address:Address})
        .then(site=>{
            const AddToDb=function(k){
                User.findOne({Email:Email})
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
                                getusers[k].userid=Email
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
                return res.status(404).json({
                    msg:'need_add_to_db_from_site'
                })
            }
            siteChecker()
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.getcode=(req,res)=>{
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Email=decoded.Email
    
    const Address=req.body.Address
    
    User.findOne({Email:Email})
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

module.exports.confirm=(req,res)=>{
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Address=decoded.Address
    
    const username=req.body.username
    const code=req.body.code
    
    Sites.findOne({Address:Address})
        .then(site=>{

            const nxt=function(userid){
                
                User.findOne({Email:userid})
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
                                            res.status(200).json({
                                                msg:'login auth',
                                                username:username,
                                                authentication:true,
                                                value:'auth completed'
                                            })
                                            user.sites[num].is_expired=true
                                            user.save()
                                            return true
                                            
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
                            return res.status(404).json({msg:'wrong Address' })
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