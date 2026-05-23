// server.js
const express = require('express');
const cors = require('cors');

// ✅ LOAD DATA AT TOP LEVEL — never inside a route handler
const recipes = require('./data/recipes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const normalize = (str) => str.trim().toLowerCase();

// 🔍 INGREDIENT SEARCH
app.post('/api/recipes/search', (req, res) => {
  const selectedIngredients = (req.body.selectedIngredients || []).map(normalize);
  const pantryItems = (req.body.pantryItems || []).map(normalize);
  const userIngredients = [...selectedIngredients, ...pantryItems];

  const exactMatches = [];
  const partialMatches = [];

  recipes.forEach(recipe => {
    const requiredIngredients = recipe.ingredients.map(normalize);
    const missingIngredients = requiredIngredients.filter(
      reqIng => !userIngredients.includes(reqIng)
    );
    const missingCount = missingIngredients.length;
    const totalIngredients = requiredIngredients.length;
    const matchPercent = Math.round(
      ((totalIngredients - missingCount) / totalIngredients) * 100
    );
    const hasSelectedIngredient =
      selectedIngredients.length === 0 ||
      selectedIngredients.some(ing => requiredIngredients.includes(ing));

    if (hasSelectedIngredient) {
      const matchData = { ...recipe, missingCount, missingIngredients, matchPercent };
      if (matchPercent >= 50) exactMatches.push(matchData);
      else partialMatches.push(matchData);
    }
  });

  exactMatches.sort((a, b) => b.matchPercent - a.matchPercent);
  partialMatches.sort((a, b) => b.matchPercent - a.matchPercent);

  res.json({ exactMatches, partialMatches });
});

// ⚡ QUICK (≤10 min)
app.get('/api/recipes/quick', (req, res) => {
  res.json(recipes.filter(r => r.prepTime <= 10));
});

// 🍱 MEAL PREP (recipes with storage field)
app.get('/api/recipes/mealprep', (req, res) => {
  res.json(recipes.filter(r => r.storage));
});

// 🌍 BY CUISINE
app.get('/api/recipes/cuisine/:type', (req, res) => {
  const type = req.params.type.toLowerCase();
  res.json(recipes.filter(r => r.cuisine.toLowerCase() === type));
});

// 🔥 TOP PICKS
app.get('/api/recipes/toppicks', (req, res) => {
  res.json(recipes.slice(0, 6));
});

// 🎲 RANDOM
app.get('/api/recipes/random', (req, res) => {
  res.json(recipes[Math.floor(Math.random() * recipes.length)]);
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});