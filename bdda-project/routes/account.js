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

router.post('/signup', (req, res) => {
   const { firstName, lastName, email, password } = req.body;

   // Call the stored procedure
   const sql = 'CALL RegisterUser(?, ?, ?)';
   req.db.query(sql, [lastName, firstName, email], (err, result) => {
      if (err) {
         console.error(err);
         return res.sendStatus(500);
      }

      // Assign role based on firstName
      const role = (firstName.toLowerCase() === 'admin') ? 'admin' : 'user';

      // Get the inserted user ID
      const getIdSQL = 'SELECT id_user FROM Users WHERE email = ?';
      req.db.query(getIdSQL, [email], (err, results) => {
         if (err || results.length === 0) {
            console.error(err || 'User not found after insert');
            return res.sendStatus(500);
         }

         const userId = results[0].id_user;

         req.login({ id: userId, email, role }, (err) => {
            if (err) return res.sendStatus(500);
            res.redirect('/');
         });
      });
   });
});



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

   // Use GetUserCommentCount stored function to get the comment count
   const userQuery = `
      SELECT *, GetUserCommentCount(?) AS commentCount
      FROM Users
      WHERE id_user = ?
   `;

   req.db.query(userQuery, [req.user.id, req.user.id], (err, results) => {
      if (err) {
         console.error(err);
         return res.sendStatus(500);
      }

      if (results.length === 0) {
         return res.redirect('/account/login');
      }

      const user = results[0];

      // If user is admin, fetch AdminStats view
      if (req.user.role === 'admin') {
         const statsQuery = 'SELECT * FROM AdminStats';
         req.db.query(statsQuery, (err, statsResults) => {
            if (err) {
               console.error(err);
               return res.sendStatus(500);
            }

            const stats = statsResults[0];
            res.render('account', {
               user: user,
               authUser: req.user,
               stats: stats
            });
         });
      } else {
         res.render('account', {
            user: user,
            authUser: req.user,
            stats: null
         });
      }
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
