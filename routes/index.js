var express = require('express');
var router = express.Router();
var contents = require("../content.json");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', contents);
});

module.exports = router;
