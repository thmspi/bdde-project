// routes/account.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

// Render login page
router.get('/login', (req, res) => {
   res.render('login', { user: req.user });
});

// Render signup page
router.get('/signup', (req, res) => {
   res.render('signup', { user: req.user });
});

// Process login using Passport
router.post(
   '/login',
   passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/account/login',
   })
);

// Process signup (this example omits password hashing for brevity)
router.post('/signup', (req, res) => {
   const { firstName, lastName, email, password } = req.body;
   if (firstName.substr(0, 5) == 'admin') {
      /* Si le gars est un admin */
      const sql = 'INSERT INTO Users (First_Name, Last_Name, email) VALUES (?, ?, ?)';
      req.db.query(sql, [firstName, lastName, email], (err, result) => {
         if (err) {
            console.error(err);
            return res.sendStatus(500);
         }
         req.login({ id: result.insertId, email, role: 'admin' }, (err) => {
            if (err) return res.sendStatus(500);
            res.redirect('/');
         });
      });
   } else {
      const sql = 'INSERT INTO Users (First_Name, Last_Name, email) VALUES (?, ?, ?)';
      req.db.query(sql, [firstName, lastName, email], (err, result) => {
         if (err) {
            console.error(err);
            return res.sendStatus(500);
         }
         req.login({ id: result.insertId, email, role: 'user' }, (err) => {
            if (err) return res.sendStatus(500);
            res.redirect('/');
            req.user.id = id;
         });
      });
   }
});

// Logout route
// Logout route – version compatible Passport >= 0.6
router.get('/logout', (req, res, next) => {
   req.logout((err) => {
      if (err) return next(err);
      res.redirect('/account/login');
   });
});

// Account details page with option to update information
router.get('/', (req, res) => {
   if (!req.user) return res.redirect('/account/login'); // sécurité

   const sql = 'SELECT * FROM Users WHERE id_user = ?';
   req.db.query(sql, [req.user.id], (err, results) => {
      if (err) {
         console.error(err);
         return res.sendStatus(500);
      }

      if (results.length === 0) {
         return res.redirect('/account/login'); // utilisateur inexistant
      }

      const user = results[0];
      res.render('account', {
         user: user, // Données de la BDD
         authUser: req.user, // Données de session (role, id, etc.)
      });
   });
});

router.post('/update', (req, res) => {
   if (!req.isAuthenticated()) return res.redirect('/account/login');
   const { firstName, lastName, email } = req.body;
   const userId = req.user.id;
   const sql = 'UPDATE Users SET First_Name = ?, Last_Name = ?, email = ? WHERE id_user = ?';
   req.db.query(sql, [firstName, lastName, email, userId], (err) => {
      if (err) {
         console.error(err);
         return res.sendStatus(500);
      }
      res.redirect('/account');
   });
});

module.exports = router;
