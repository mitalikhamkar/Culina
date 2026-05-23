const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_KEY = 'OppHY0b45ue06arfmgLhIVtFENUgLDpzer2pLopUJTg9D4dkRnztYYAH';

const recipesPath = path.join(__dirname, 'data', 'recipes.js');

let recipes = require(recipesPath);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchImage(query) {
  try {
    const response = await axios.get(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query + ' food')}&per_page=1`,
      {
        headers: {
          Authorization: API_KEY,
        },
      }
    );

    if (response.data.photos.length > 0) {
      return response.data.photos[0].src.large;
    }

    return '';
  } catch (error) {
    console.log('❌ Error fetching image:', query);
    return '';
  }
}

async function updateRecipes() {
  for (let recipe of recipes) {

    // Skip recipes that already have images
    if (recipe.image && recipe.image.trim() !== '') {
      console.log(`✅ Skipping: ${recipe.title}`);
      continue;
    }

    console.log(`🔍 Fetching image for: ${recipe.title}`);

    const imageUrl = await fetchImage(recipe.title);

    if (imageUrl) {
      recipe.image = imageUrl;
      console.log(`✅ Added image for: ${recipe.title}`);
    } else {
      console.log(`❌ Failed: ${recipe.title}`);
    }

    // Delay to avoid rate limit
    await sleep(1500);
  }

  const fileContent =
    'const recipes = ' +
    JSON.stringify(recipes, null, 2) +
    ';\n\nmodule.exports = recipes;';

  fs.writeFileSync(recipesPath, fileContent);

  console.log('🎉 Recipe image update completed!');
}

updateRecipes();