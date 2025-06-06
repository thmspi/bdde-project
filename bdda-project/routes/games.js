// routes/games.js
const express = require('express');
const router = express.Router();

router.get('/add', (req, res) => {
   // Optionnel : vérifier si l'utilisateur est admin
   if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).send('Access denied');
   }

   // Rendre la page de formulaire d'ajout
   res.render('add_game', { user: req.user, error: null });
});
// Ajouter un nouveau jeu via la procédure stockée AddGame
router.post('/add', (req, res) => {
   if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).send('Access denied');
   }

   const {
      Name_game,
      Id_category,
      id_publisher,
      minplaytime,
      maxplaytime,
      Year_published,
      minplayer,
      maxplayer,
   } = req.body;

   if (
      !Name_game ||
      !Id_category ||
      !id_publisher ||
      !minplaytime ||
      !maxplaytime ||
      !Year_published ||
      !minplayer ||
      !maxplayer
   ) {
      return res.status(400).send('All fields are required');
   }

   const sql = 'CALL AddGame(?, ?, ?, ?, ?, ?, ?, ?)';
   req.db.query(
      sql,
      [
         Name_game,
         Id_category,
         id_publisher,
         parseInt(minplaytime),
         parseInt(maxplaytime),
         parseInt(Year_published),
         parseInt(minplayer),
         parseInt(maxplayer),
      ],
      (err) => {
         if (err) {
            console.error(err);
            return res.status(500).send('Error adding game');
         }
         res.redirect('/'); // Ou vers la liste des jeux, ou la page du jeu ajouté si tu récupères l'ID
      }
   );
});
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
         // Use stored functions GetFavoriteCount and IsRecentGame
         const favCountSQL = 'SELECT GetFavoriteCount(?) AS favCount';
         const isRecentSQL = 'SELECT IsRecentGame(?) AS isRecent';

         req.db.query(favCountSQL, [gameId], (err, favResults) => {
            const favoriteCount = err ? 0 : favResults[0].favCount;

            req.db.query(isRecentSQL, [gameId], (err, recentResults) => {
               const isRecent = err ? false : recentResults[0].isRecent;

               res.render('game_details', {
                  game,
                  comments,
                  user: req.user,
                  favoriteCount,
                  isRecent,
               });
            });
         });
      });
   });
});

// Submit a comment and grade
// Use Stored Procedure AddComment
router.post('/:id/comment', (req, res) => {
   if (!req.isAuthenticated()) return res.redirect('/account/login');

   const gameId = req.params.id;
   const { note, avis } = req.body;
   if (!note || !avis) return res.status(400).send('Both grade and comment are required');

   const userId = req.user.id;
   const callSP = 'CALL AddComment(?, ?, ?, ?, CURDATE())';

   req.db.query(callSP, [gameId, userId, note, avis], (err) => {
      if (err) {
         console.error(err);
         return res.status(500).send('Error adding comment.');
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
               if (err.sqlState === '45000') {
                  // Custom SQLSTATE for your trigger
                  return res.status(400).send('Game already in favorites.');
               }
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
