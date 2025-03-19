// fetchRecipes.js - Handles fetching recipes from APIs

const SPOONACULAR_API_KEY = "736c4b6768174668815f3bdf3c366298"; // Spoonacular API Key
const TASTY_API_KEY = "600e0d512fmsh965b7450fb4fdd8p1873e0jsn239c1a809df5"; // Tasty API Key

/**
 * Fetch recipes from Spoonacular API
 * @param {string} query - Search query (recipe name, ingredient, or cuisine)
 * @returns {Promise<Array>} - List of recipes
 */
async function fetchSpoonacularRecipes(query) {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=10&apiKey=${SPOONACULAR_API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Spoonacular API Error: ${response.status}`);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Error fetching Spoonacular recipes:", error);
        return [];
    }
}

/**
 * Fetch recipes from Tasty API
 * @param {string} query - Search query (recipe name, ingredient, or cuisine)
 * @returns {Promise<Array>} - List of recipes
 */
async function fetchTastyRecipes(query) {
    const url = `https://tasty.p.rapidapi.com/recipes/list?from=0&size=10&q=${query}`;
    
    const options = {
        method: "GET",
        headers: {
            "X-RapidAPI-Key": TASTY_API_KEY,
            "X-RapidAPI-Host": "tasty.p.rapidapi.com"
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`Tasty API Error: ${response.status}`);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Error fetching Tasty recipes:", error);
        return [];
    }
}

/**
 * Fetch detailed recipe information by ID
 * @param {string} recipeId - The ID of the recipe
 * @param {string} source - The source of the recipe ("spoonacular" or "tasty")
 * @returns {Promise<Object>} - Recipe details
 */
async function fetchRecipeDetails(recipeId, source) {
    let url;

    if (source === "tasty") {
        url = `https://tasty.p.rapidapi.com/recipes/get-more-info?id=${recipeId}`;
    } else {
        url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}`;
    }

    const options = source === "tasty" ? {
        method: "GET",
        headers: {
            "X-RapidAPI-Key": TASTY_API_KEY,
            "X-RapidAPI-Host": "tasty.p.rapidapi.com"
        }
    } : {};

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
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Combined list of recipes
 */
async function fetchAllRecipes(query) {
    const [spoonacularRecipes, tastyRecipes] = await Promise.all([
        fetchSpoonacularRecipes(query),
        fetchTastyRecipes(query)
    ]);

    return [...spoonacularRecipes, ...tastyRecipes];
}

export { fetchAllRecipes, fetchRecipeDetails };
