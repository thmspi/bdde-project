// routes/index.js
const express = require('express');
const router = express.Router();

// Home/Search Page
router.get('/', (req, res) => {
  // Get a list of trending board games (example: using rank_game)
  const trendingSQL = 'SELECT * FROM Game ORDER BY rank_game LIMIT 5';
  req.db.query(trendingSQL, (err, trendingGames) => {
    if (err) {
      console.error(err);
      trendingGames = [];
    }
    res.render('index', { trendingGames, user: req.user });
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
    res.render('index', { searchResults: results, trendingGames: [], user: req.user });
  });
});

module.exports = router;


