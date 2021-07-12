var express = require('express');
var router = express.Router();
const userController=require('../controllers/user')
const checkAuth=require('../middleware/check-auth')
/////////////////////////////////////////////USERS/////////////////////////////////////////////
router.post('/signup',userController.postSignUp);
router.post('/login',userController.postLogin);
router.post('/AddSiteToDb',checkAuth,userController.AddSiteToDb);
router.get('/getcode',checkAuth,userController.getcode);
router.get('/sendrecoverylink',userController.sendrecoverylink);
router.get('/userinfo',checkAuth,userController.getuserinfo);
router.delete('/DeleteAcc',checkAuth,userController.DeleteAccount);
router.post('/AddEmail',checkAuth,userController.setEmail);
router.get('/ActiveEmail/:Number/:code',userController.ActiveEmail);
router.get('/showQR',checkAuth,userController.showQR)
router.post('/getQR',userController.getQR)
router.get('/newNumber',checkAuth,userController.newNumber)
router.get('/changeNumber/:Number/:newNumber/:code',userController.changeNumber)
/////////////////////////////////////////////BOTH//////////////////////////////////////////////
router.get('/recovery/:mode/:ID/:code',userController.recovery);
router.get('/active/:mode/:ID/:code',userController.active);
/////////////////////////////////////////////SITES/////////////////////////////////////////////
router.post('/siteregistration',userController.postSignUpForSites);
router.post('/siteLogin',userController.loginForSites);
router.get('/AddUserToSiteDb',checkAuth,userController.AddUserToSiteDb);
router.post('/confirm',checkAuth,userController.confirm);
router.get('/sendrecoverylinkforsites',userController.sendrecoveryemailforsites);
router.post('/Addprevioususers',checkAuth,userController.AddAllUsers);
router.get('/getusercode',checkAuth,userController.getusercode);
router.get('/sendDeleteLink',userController.SendDelLink)
router.get('/DelByLink/:Email/:code',userController.DelByLink)
module.exports = router;

