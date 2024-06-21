const express = require('express');
const router = express.Router();

const User = require('../models/User');

router.get('/login', function(req, res, next) {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.send('User not found');
      }
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.send('Invalid password');
      }
      req.session.user = user;
      res.redirect('/diem');
    } catch (error) {
      res.send('Error: ' + error.message);
    }
  });
  
  router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
  });

module.exports = router;