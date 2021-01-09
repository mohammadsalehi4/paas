var express = require('express');
var router = express.Router();
const userController=require('../controllers/user')
const checkAuth=require('../middleware/check-auth')

router.post('/signup',userController.postSignUp);//sabte nam karbaran jadid
router.post('/login',userController.postLogin);
router.post('/AddSiteToDb',checkAuth,userController.AddSiteToDb);
router.get('/getcode',checkAuth,userController.getcode);
router.post('/sendrecoveryemail',userController.sendrecoveryemail);
router.post('/recovery/:Email/:code',userController.recovery);
router.post('/changepassword',userController.changepassword);
router.get('/userinfo',checkAuth,userController.getuserinfo);

router.post('/sendemail',userController.sendemail);

router.post('/signupForSites',userController.postSignUpForSites);//sabte nam site ha
router.post('/loginForSites',userController.loginForSites);
router.post('/AddUserToSiteDb',checkAuth,userController.AddUserToSiteDb);
router.get('/confirm',checkAuth,userController.confirm);
router.post('/sendrecoveryemailforsites',userController.sendrecoveryemailforsites);
router.post('/recoverysite/:Address/:code',userController.recoverysite);
router.post('/changepasswordforsite',userController.changepasswordforsite);
router.post('/extention',checkAuth,userController.extention);
router.post('/AddAllUsers',checkAuth,userController.AddAllUsers);
router.get('/dashbord',checkAuth,userController.getsiteinfo);
router.get('/getusercode',checkAuth,userController.getusercode);

module.exports = router;

