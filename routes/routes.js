var express = require('express');
var router = express.Router();
const userController=require('../controllers/user')
const checkAuth=require('../middleware/check-auth')
/////////////////////////////////////////////USERS/////////////////////////////////////////////
router.post('/signup',userController.postSignUp);
router.post('/login',userController.postLogin);
router.post('/AddSiteToDb',checkAuth,userController.AddSiteToDb);//ok
router.post('/getcode',checkAuth,userController.getcode);//ok
router.post('/sendrecoverylink',userController.sendrecoverylink);
router.post('/userinfo',checkAuth,userController.getuserinfo);//ok
router.delete('/DeleteAcc',checkAuth,userController.DeleteAccount);//ok
router.post('/AddEmail',checkAuth,userController.setEmail);//ok
router.get('/ActiveEmail/:Number/:code',userController.ActiveEmail);
router.get('/showQR',checkAuth,userController.showQR)//ok
router.post('/getQR',userController.getQR)
router.post('/newNumber',checkAuth,userController.newNumber)//ok
router.post('/autologin',userController.AutoLogin)//ok
router.get('/changeNumber/:Number/:newNumber/:code',userController.changeNumber)
/////////////////////////////////////////////BOTH//////////////////////////////////////////////
router.post('/recovery/:mode/:ID/:code',userController.recovery);
router.get('/active/:mode/:ID/:code',userController.active);
/////////////////////////////////////////////SITES/////////////////////////////////////////////
router.post('/siteregistration',userController.postSignUpForSites);
router.post('/getdata',userController.getData);
router.post('/siteLogin',userController.loginForSites);
router.post('/AddUserToSiteDb',checkAuth,userController.AddUserToSiteDb);//ok
router.post('/confirm',checkAuth,userController.confirm);//ok
router.post('/sendrecoverylinkforsites',userController.sendrecoveryemailforsites);
router.post('/Addprevioususers',checkAuth,userController.AddAllUsers);//ok
router.post('/getusercode',checkAuth,userController.getusercode);//ok
router.post('/sendDeleteLink',userController.SendDelLink)
router.post('/getToken',checkAuth,userController.getSiteToken)//ok
router.post('/checkcode',checkAuth,userController.AutoLoginAuth)//ok
router.get('/DelByLink/:Email/:code',userController.DelByLink)
module.exports = router;

