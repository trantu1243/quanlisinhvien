const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

/* GET home page. */
router.get('/', authMiddleware, function(req, res, next) {
  res.render('index', { user: req.session.user });
});

module.exports = router;
