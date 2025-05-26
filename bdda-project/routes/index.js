// routes/index.js
const express = require('express');
const router = express.Router();

// Home/Search Page
router.get('/', (req, res) => {
  const trendingSQL = 'SELECT * FROM TrendingGames';
  const favoritesSQL = 'SELECT * FROM GameFavoritesRanking ORDER BY FavoriteCount DESC LIMIT 10';

  req.db.query(trendingSQL, (err, trendingGames) => {
    if (err) {
      console.error(err);
      trendingGames = [];
    }

    req.db.query(favoritesSQL, (err, favoriteGames) => {
      if (err) {
        console.error(err);
        favoriteGames = [];
      }

      res.render('index', {
        trendingGames,
        favoriteGames,
        user: req.user
      });
    });
  });
});


// Handle search form submission
router.post('/search', (req, res) => {
   const searchQuery = req.body.search;
   const sql = 'SELECT * FROM Game WHERE Name_game LIKE ?';
   req.db.query(sql, [`%${searchQuery}%`], (err, results) => {
      if (err) {
         console.error(err);
         results = [];
      }
      res.render('index', {
         searchResults: results,
         trendingGames: [],
         user: req.user,
         text: searchQuery,
      });
   });
});

module.exports = router;
