var express = require('express');
var router = express.Router();
const userController=require('../controllers/user')
const checkAuth=require('../middleware/check-auth')

router.post('/signup',userController.postSignUp);//sabte nam karbaran jadid
router.post('/signupForSites',userController.postSignUpForSites);//sabte nam site ha
router.post('/login',userController.postLogin);
router.post('/loginForSites',userController.loginForSites);
router.post('/AddUserToSiteDb',checkAuth,userController.AddUserToSiteDb);
router.post('/AddSiteToDb',checkAuth,userController.AddSiteToDb);
router.get('/getcode',checkAuth,userController.getcode);
router.get('/confirm',checkAuth,userController.confirm);

module.exports = router;

