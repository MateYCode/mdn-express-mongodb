let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect(200,'/catalog'); //default code is 302
});
module.exports = router;
