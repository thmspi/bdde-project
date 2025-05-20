// routes/games.js
const express = require('express');
const router = express.Router();

// Game Details Page
router.get('/:id', (req, res) => {
   const gameId = req.params.id;
   const sql = 'SELECT * FROM Game WHERE Id_game = ?';
   req.db.query(sql, [gameId], (err, games) => {
      if (err || games.length === 0) return res.status(404).send('Game not found');
      const game = games[0];
      // Retrieve comments for the game
      const commentSQL = `
      SELECT c.*, u.First_Name, u.Last_Name 
      FROM Comment c JOIN Users u ON c.id_user = u.id_user 
      WHERE c.Id_game = ?
    `;
      req.db.query(commentSQL, [gameId], (err, comments) => {
         if (err) comments = [];
         res.render('game_details', { game, comments, user: req.user });
      });
   });
});

// Submit a comment and grade
router.post('/:id/comment', (req, res) => {
   if (!req.isAuthenticated()) return res.redirect('/account/login');
   const gameId = req.params.id;
   const { note, avis } = req.body;
   if (!note || !avis) return res.status(400).send('Both grade and comment are required');
   const userId = req.user.id;
   const sql = `
    INSERT INTO Comment (Id_game, id_user, note, avis, date_note) 
    VALUES (?, ?, ?, ?, CURDATE())
  `;
   req.db.query(sql, [gameId, userId, note, avis], (err) => {
      if (err) {
         console.error(err);
         return res.sendStatus(500);
      }
      res.redirect(`/games/${gameId}`);
   });
});

// Add game to favorites
router.post('/:id/favorite', (req, res) => {
   if (!req.isAuthenticated()) return res.redirect('/account/login');

   const gameId = req.params.id;
   const userId = req.user.id;

   const checkSql = 'SELECT * FROM Favoris WHERE Id_game = ? AND id_user = ?';
   req.db.query(checkSql, [gameId, userId], (err, results) => {
      if (err) {
         console.error(err);
         return res.sendStatus(500);
      }

      if (results.length === 0) {
         // Le jeu n'est pas encore en favoris
         const insertSql = 'INSERT INTO Favoris (Id_game, id_user) VALUES (?, ?)';
         req.db.query(insertSql, [gameId, userId], (err) => {
            if (err) {
               console.error(err);
               return res.sendStatus(500);
            }
            return res.redirect(`/games/${gameId}`);
         });
      } else {
         // Le jeu est déjà en favoris, on peut rediriger directement
         return res.redirect(`/games/${gameId}`);
      }
   });
});

// Admin-only: Edit game details
router.get('/:id/edit', (req, res) => {
   if (!req.isAuthenticated() || req.user.role !== 'admin') return res.redirect('/');
   const gameId = req.params.id;
   req.db.query('SELECT * FROM Game WHERE Id_game = ?', [gameId], (err, games) => {
      if (err || games.length === 0) return res.status(404).send('Game not found');
      const game = games[0];
      res.render('game_edit', { game, user: req.user });
   });
});

router.post('/:id/edit', (req, res) => {
   if (!req.isAuthenticated() || req.user.role !== 'admin') return res.redirect('/');
   const gameId = req.params.id;
   const {
      Name_game,
      Description,
      minplayer,
      maxplayer,
      playingtime,
      minplaytime,
      maxplaytime,
      Year_published,
   } = req.body;
   const sql = `
    UPDATE Game 
    SET Name_game = ?, Description = ?, minplayer = ?, maxplayer = ?, 
        playingtime = ?, minplaytime = ?, maxplaytime = ?, Year_published = ? 
    WHERE Id_game = ?
  `;
   req.db.query(
      sql,
      [
         Name_game,
         Description,
         minplayer,
         maxplayer,
         playingtime,
         minplaytime,
         maxplaytime,
         Year_published,
         gameId,
      ],
      (err) => {
         if (err) {
            console.error(err);
            return res.sendStatus(500);
         }
         res.redirect(`/games/${gameId}`);
      }
   );
});

module.exports = router;
