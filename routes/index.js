var express = require('express');
var router = express.Router();
var fs = require("fs");
var contents = fs.readFileSync("content.json");
var jsonContent = JSON.parse(contents);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', jsonContent);
});

module.exports = router;
