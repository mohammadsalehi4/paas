const express=require('express')
const router=express.Router()
const User = require('../model/user')
const bcrypt=require('bcryptjs')
const Sites = require('../model/site')
const jwt=require('jsonwebtoken')
const nodemailer = require('nodemailer');


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
        if (error) {
            return res.status(200).json({msg:'not sent'})
        } else {
            return res.status(200).json({msg:'sent'})
        }
      });
}

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
        if(Address[0]!='w'||Address[1]!='w'||Address[2]!='w'||Address[3]!='.'){
            return false
        }
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
                    recoverycode:'0',
                    is_ban:false,
                    Uns_attempt:0,
                    enable_to_change_password:false,
                    AddedUsers:false,
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
            if(user.is_ban==true){return res.status(403).json({msg:'ban'})}
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
                        Email:user.Email,
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

module.exports.loginForSites=(req,res)=>{
    const Address=req.body.Address
    const password=req.body.password
    
    Sites.findOne({Address:Address})
        .then(user=>{
            if(user.is_ban==true){return res.status(403).json({msg:'ban'})}
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
                        Email:user.Email,
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

module.exports.sendrecoveryemail=(req,res)=>{
    const Email=req.body.Email
    
    User.findOne({Email:Email})
        .then(user=>{
            let code
            const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
            const rnd1=Math.floor(Math.random()*26)
            code=letters[rnd1]
            for(let i=0;i<40;i++){
                const rnd=Math.floor(Math.random()*letters.length)
                code=code+letters[rnd]
            }
            const link=`localhost:4000/recovery/${Email}/${code}`
            bcrypt.hash(code,12,(err,hash)=>{
                if(err){
                    return res.status(403).json({msg:'Unsuccessful'})
                }else{
                    user.recoverycode=hash
                    user.save()
                        .then(result=>{
                            return res.status(200).json({
                                msg:'Email sent',
                                link:link
                            })
                        })
                        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                }
            })
            return true
        })
        .catch(err=>{return res.status(403).json({msg:'wrong Email'})})
}

module.exports.recovery=(req,res)=>{
    const Email=req.params.Email
    const code=req.params.code
    
    User.findOne({Email:Email})
        .then(user=>{
            if(user.recoverycode==0){
                return res.status(403).json({msg:'Unsuccessful'})
            }
            bcrypt.compare(code,user.recoverycode,(err,result)=>{
                if(err){
                    return res.status(403).json({msg:'Unsuccessful'})
                }else if(result){
                    user.enable_to_change_password=true
                    user.save()
                        .then(rs=>{
                            const token = jwt.sign({
                                Email:Email,
                                message:'enable to change password',
                                code:code
                            },'secret',{expiresIn:'1h'})
                            return res.status(200).json({
                                msg:'enable to change password',
                                token:token
                            })
                        })
                        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                }else{
                    return res.status(403).json({msg:'Unsuccessful'})
                }
            })
        })
        .catch(err=>{return res.status(403).json({msg:'wrong Email'})})
}

module.exports.changepassword=(req,res)=>{
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const message=decoded.message
    const Email=decoded.Email
    const code=decoded.code
    let newPassword=req.body.newPassword
    
    if(message!='enable to change password'){
        return res.status(403).json({msg:'Unsuccessful1'})
    }
    
    newPassword=String(newPassword)
    if(newPassword.length<8){
        return res.status(403).json({msg:'select longer password'})
    }
    
    User.findOne({Email:Email})
        .then(user=>{
            bcrypt.compare(code,user.recoverycode,(err,result)=>{
                if(err){return res.status(403).json({msg:'Unsuccessful'})}
                    else if(result){
                    if(user.enable_to_change_password==true){
                        bcrypt.hash(newPassword,12,(err,hash)=>{
                            if(err){return res.status(403).json({msg:'Unsuccessful'})}
                            else{
                                user.HashingPassword=hash
                                user.is_ban=false
                                user.enable_to_change_password=false
                                user.recoverycode=0
                                user.Uns_attempt=0
                                user.save()
                                    .then(rs=>{
                                        return res.status(200).json({msg:'Done'})
                                    })
                                    .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                            }
                        })
                    }else{return res.status(403).json({msg:'Unsuccessful'})}
                }else{return res.status(403).json({msg:'Unsuccessful'})}
            })
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.sendrecoveryemailforsites=(req,res)=>{
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
            const link=`localhost:4000/recoverysite/${Address}/${code}`
            bcrypt.hash(code,12,(err,hash)=>{
                if(err){
                    return res.status(403).json({msg:'Unsuccessful1'})
                }else{
                    site.recoverycode=hash
                    site.save()
                    return res.status(200).json({
                        msg:'Email sent',
                        link:link
                    })
                }
            })
            return true
        })
        .catch(err=>{return res.status(403).json({msg:'wrong Address'})})
}

module.exports.recoverysite=(req,res)=>{
    const Address=req.params.Address
    const code=req.params.code
    
    Sites.findOne({Address:Address})
        .then(site=>{
            if(site.recoverycode==0){
                return res.status(403).json({msg:'Unsuccessful'})
            }
            bcrypt.compare(code,site.recoverycode,(err,result)=>{
                if(err){
                    return res.status(403).json({msg:'Unsuccessful'})
                }else if(result){
                    site.enable_to_change_password=true
                    site.save()
                        .then(rs=>{
                            const token = jwt.sign({
                                Address:Address,
                                message:'enable to change password',
                                code:code
                            },'secret',{expiresIn:'1h'})
                            return res.status(200).json({
                                msg:'enable to change password',
                                token:token
                            })
                        })
                        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                }else{
                    return res.status(403).json({msg:'Unsuccessful'})
                }
            })
        })
        .catch(err=>{return res.status(403).json({msg:'wrong Address'})})
}

module.exports.changepasswordforsite=(req,res)=>{
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const message=decoded.message
    const Address=decoded.Address
    const code=decoded.code
    let newPassword=req.body.newPassword
    
    if(message!='enable to change password'){
        return res.status(403).json({msg:'Unsuccessful'})
    }
    
    newPassword=String(newPassword)
    if(newPassword.length<16){
        return res.status(403).json({msg:'select longer password'})
    }
    
    Sites.findOne({Address:Address})
        .then(site=>{
            bcrypt.compare(code,site.recoverycode,(err,result)=>{
                if(err){return res.status(403).json({msg:'Unsuccessful'})}
                    else if(result){
                    if(site.enable_to_change_password==true){
                        bcrypt.hash(newPassword,12,(err,hash)=>{
                            if(err){return res.status(403).json({msg:'Unsuccessful'})}
                            else{
                                site.HashingPassword=hash
                                site.is_ban=false
                                site.enable_to_change_password=false
                                site.recoverycode=0
                                site.Uns_attempt=0
                                site.save()
                                    .then(rs=>{
                                        return res.status(200).json({msg:'Done'})
                                    })
                                    .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
                            }
                        })
                    }else{return res.status(403).json({msg:'Unsuccessful'})}
                }else{return res.status(403).json({msg:'Unsuccessful'})}
            })
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.extention=(req,res)=>{
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Address=decoded.Address
    
    const mode=req.body.mode
    
    Sites.findOne({Address:Address})//1 mahe- 3 mahe- 6 mahe- 1 sale
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

module.exports.AddAllUsers=(req,res)=>{
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

module.exports.getuserinfo=(req,res)=>{
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Email=decoded.Email
    
    User.findOne({Email:Email})
        .then(user=>{
            const fullName=user.fullName
            const Email=user.Email
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
                Email:Email,
                sites:postsites
            })
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.getsiteinfo=(req,res)=>{
    const token=(req.headers.authorization.slice(7))
    const decoded =jwt.verify(token,'secret')
    const Address=decoded.Address
    
    Sites.findOne({Address:Address})
        .then(site=>{
            const getAddress=site.Address
            const Email=site.Email
            const ExpireDate=site.ExpireDate
            
            return res.status(200).json({
                msg:'Done',
                Address:getAddress,
                Email:Email,
                ExpireDate:ExpireDate
            })
            
        })
        .catch(err=>{return res.status(403).json({msg:'Unsuccessful'})})
}

module.exports.getusercode=(req,res)=>{
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