var express = require('express');
var router = express.Router();
const userController=require('../controllers/user')
const checkAuth=require('../middleware/check-auth')
/////////////////////////////////////////////USERS/////////////////////////////////////////////
router.post('/signup',userController.postSignUp);/*Done*/
router.post('/login',userController.postLogin);/*Done*/
router.post('/AddSiteToDb',checkAuth,userController.AddSiteToDb);/*Done*/
router.get('/getcode',checkAuth,userController.getcode);/*Done*/
router.post('/sendrecoverylink',userController.sendrecoveryemail);
router.get('/userinfo',checkAuth,userController.getuserinfo);
router.delete('/DeleteAcc',checkAuth,userController.DeleteAccount);
router.post('/setMail',checkAuth,userController.setEmail);
router.get('/Active/:Number/:code',userController.ActiveEmail);
router.get('/showQR',checkAuth,userController.showQR)
router.post('/getQR',userController.getQR)
router.post('/newNumber',checkAuth,userController.newNumber)
router.get('/changeNumber/:Number/:newNumber/:code',userController.changeNumber)
/////////////////////////////////////////////BOTH/////////////////////////////////////////////
router.get('/recovery/:mode/:ID/:code',userController.recovery);
/////////////////////////////////////////////SITES/////////////////////////////////////////////
router.post('/signupForSites',userController.postSignUpForSites);
router.post('/loginForSites',userController.loginForSites);
router.post('/AddUserToSiteDb',checkAuth,userController.AddUserToSiteDb);
router.get('/confirm',checkAuth,userController.confirm);
router.post('/sendrecoverylinkforsites',userController.sendrecoveryemailforsites);
router.post('/extention',checkAuth,userController.extention);
router.post('/AddAllUsers',checkAuth,userController.AddAllUsers);
router.get('/dashbord',checkAuth,userController.getsiteinfo);
router.get('/getusercode',checkAuth,userController.getusercode);
router.post('/sendDeleteLink',userController.SendDelLink)
router.get('/DelByLink/:Email/:code',userController.DelByLink)
module.exports = router;

