var express = require('express');
var router = express.Router();
const userController=require('../controllers/user')
const checkAuth=require('../middleware/check-auth')
/////////////////////////////////////////////USERS/////////////////////////////////////////////
router.post('/signup',userController.postSignUp);//Done
router.post('/login',userController.postLogin);//Done
router.get('/ActiveAccount/:Number/:code',userController.ActiveAccount);//DOne
router.post('/AddSiteToDb',checkAuth,userController.AddSiteToDb);//Done
router.get('/getcode',checkAuth,userController.getcode);//Done
router.post('/sendrecoverylink',userController.sendrecoveryemail);//Done
router.get('/userinfo',checkAuth,userController.getuserinfo);//Done
router.delete('/DeleteAcc',checkAuth,userController.DeleteAccount);//Done
router.post('/AddEmail',checkAuth,userController.setEmail);//Done
router.get('/ActiveEmail/:Number/:code',userController.ActiveEmail);//Done
router.get('/showQR',checkAuth,userController.showQR)//Done
router.post('/getQR',userController.getQR)//Done
router.post('/newNumber',checkAuth,userController.newNumber)//Done
router.get('/changeNumber/:Number/:newNumber/:code',userController.changeNumber)//Done
/////////////////////////////////////////////BOTH/////////////////////////////////////////////
router.get('/recovery/:mode/:ID/:code',userController.recovery);//Done
/////////////////////////////////////////////SITES/////////////////////////////////////////////
router.post('/siteregistration',userController.postSignUpForSites);//Done
router.get('/ActiveSite/:Address/:code',userController.ActiveSite);//Done
router.post('/loginForSites',userController.loginForSites);//Done
router.post('/AddUserToSiteDb',checkAuth,userController.AddUserToSiteDb);//Done
router.get('/confirm',checkAuth,userController.confirm);//Done
router.post('/sendrecoverylinkforsites',userController.sendrecoveryemailforsites);//Done
router.post('/renewal',checkAuth,userController.extention);//Done
router.post('/Addprevioususers',checkAuth,userController.AddAllUsers);//Done
router.get('/dashbord',checkAuth,userController.getsiteinfo);//Done
router.get('/getusercode',checkAuth,userController.getusercode);//Done
router.post('/sendDeleteLink',userController.SendDelLink)//Done
router.get('/DelByLink/:Email/:code',userController.DelByLink)//Done
module.exports = router;

