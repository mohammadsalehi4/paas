var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('admin is sterted');
});

router.get('/test', function(req, res, next) {
  res.send('test admin is sterted');
});


module.exports = router;
