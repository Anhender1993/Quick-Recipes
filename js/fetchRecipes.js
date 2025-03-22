// FetchRecipes.js - Handles fetching recipes from APIs

const SPOONACULAR_API_KEY = "736c4b6768174668815f3bdf3c366298"; // Spoonacular API Key
const TASTY_API_KEY = "600e0d512fmsh965b7450fb4fdd8p1873e0jsn239c1a809df5"; // Tasty API Key

/**
 * Fetch recipes from Spoonacular API
 */
async function fetchSpoonacularRecipes(query) {
  const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=10&apiKey=${SPOONACULAR_API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Spoonacular API Error: ${response.status}`);
    const data = await response.json();
    return (data.results || []).map((recipe) => ({
      ...recipe,
      source: "spoonacular",
      title: recipe.title,
      image: recipe.image,
    }));
  } catch (error) {
    console.error("Error fetching Spoonacular recipes:", error);
    return [];
  }
}

/**
 * Fetch recipes from Tasty API
 */
async function fetchTastyRecipes(query) {
  const url = `https://tasty.p.rapidapi.com/recipes/list?from=0&size=10&q=${query}`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": TASTY_API_KEY,
      "X-RapidAPI-Host": "tasty.p.rapidapi.com",
    },
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Tasty API Error: ${response.status}`);
    const data = await response.json();
    return (data.results || []).map((recipe) => ({
      ...recipe,
      source: "tasty",
      image: recipe.image || recipe.thumbnail_url || "",
      title: recipe.title || recipe.name || "Untitled",
    }));
  } catch (error) {
    console.error("Error fetching Tasty recipes:", error);
    return [];
  }
}

/**
 * Fetch detailed recipe information by ID
 */
async function fetchRecipeDetails(recipeId, source) {
  let url;
  if (source === "tasty") {
    url = `https://tasty.p.rapidapi.com/recipes/get-more-info?id=${recipeId}`;
  } else {
    url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}`;
  }
  const options =
    source === "tasty"
      ? {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": TASTY_API_KEY,
            "X-RapidAPI-Host": "tasty.p.rapidapi.com",
          },
        }
      : {};
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Error fetching details from ${source}: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    return null;
  }
}

/**
 * Fetch recipes from both APIs
 */
async function fetchAllRecipes(query) {
  const [spoonacularRecipes, tastyRecipes] = await Promise.all([
    fetchSpoonacularRecipes(query),
    fetchTastyRecipes(query),
  ]);
  return [...spoonacularRecipes, ...tastyRecipes];
}

export { fetchAllRecipes, fetchRecipeDetails };