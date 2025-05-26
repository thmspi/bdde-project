// app.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();

// Set up view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Static files and middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Session and Passport config
app.use(
   session({
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: false,
   })
);
app.use(passport.initialize());
app.use(passport.session());

// Dummy local strategy for demonstration.
// In production, validate user credentials against your database.
passport.use(
   new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      const sql = 'SELECT * FROM Users WHERE email = ?';
      db.query(sql, [email], (err, results) => {
         if (err) return done(err);
         if (results.length === 0) return done(null, false, { message: 'Utilisateur introuvable' });

         const user = results[0];
         var role_user = 'user';
         if (user.First_Name.substr(0, 5) == 'admin') {
            role_user = 'admin';
         }

         return done(null, {
            id: user.id_user,
            email: user.email,
            role: user.role || role_user,
         });
      });
   })
);

passport.serializeUser((user, done) => {
   done(null, user.id);
});
passport.deserializeUser((id, done) => {
   const sql = 'SELECT * FROM Users WHERE id_user = ?';
   db.query(sql, [id], (err, results) => {
      if (err) return done(err);
      if (results.length === 0) return done(null, false);

      const user = results[0];
      var role_user = 'user';
      if (user.First_Name.substr(0, 5) == 'admin') {
         role_user = 'admin';
      }
      done(null, {
         id: user.id_user,
         email: user.email,
         role: user.role || role_user,
      });
   });
});

// Database connection (adjust with your own credentials)
const db = mysql.createConnection({
   host: 'localhost',
   user: 'root',
   database: 'BDDA-project',
   password: '_Th40!Do61',
});
db.connect((err) => {
   if (err) console.error('Database connection error:', err);
   else console.log('Connected to database');
});

// Make the db connection accessible in req.db
app.use((req, res, next) => {
   req.db = db;
   next();
});

// Import routes
const indexRoutes = require('./routes/index');
const gameRoutes = require('./routes/games');
const accountRoutes = require('./routes/account');

app.use('/', indexRoutes);
app.use('/games', gameRoutes);
app.use('/account', accountRoutes);

// Favorites page route
app.get('/favorites', (req, res) => {
   if (!req.isAuthenticated()) return res.redirect('/account/login');
   const userId = req.user.id;
   const sql = `
    SELECT g.* FROM Favoris f 
    JOIN Game g ON f.Id_game = g.Id_game 
    WHERE f.id_user = ?
  `;
   req.db.query(sql, [userId], (err, results) => {
      if (err) {
         console.error(err);
         return res.sendStatus(500);
      }
      res.render('favorites', { games: results, user: req.user });
   });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
   console.log(`Server running on port http://localhost:${PORT}`);
});
