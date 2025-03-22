// FetchRecipes.js - Handles fetching recipes using TheMealDB API

/**
 * Helper function to extract ingredients from a meal object.
 * TheMealDB returns up to 20 ingredients and measures (strIngredient1..20, strMeasure1..20).
 * @param {Object} meal - The meal object from TheMealDB.
 * @returns {Array} - An array of ingredient objects with an "original" property.
 */
function getMealIngredients(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          original: `${measure ? measure.trim() : ""} ${ingredient.trim()}`.trim()
        });
      }
    }
    return ingredients;
  }
  
  /**
   * Fetch recipes from TheMealDB API by name.
   * @param {string} query - The search query.
   * @returns {Promise<Array>} - An array of recipe objects.
   */
  async function fetchMealDBRecipes(query) {
    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("TheMealDB raw data:", data);
      if (!data.meals) {
        return [];
      }
      // Map each meal into a standardized recipe object.
      return data.meals.map(meal => ({
        id: meal.idMeal,
        title: meal.strMeal,
        image: meal.strMealThumb,
        instructions: meal.strInstructions,
        source: "themealdb",
        extendedIngredients: getMealIngredients(meal)
      }));
    } catch (error) {
      console.error("Error fetching TheMealDB recipes:", error);
      return [];
    }
  }
  
  /**
   * Fetch detailed recipe information from TheMealDB API using the lookup endpoint.
   * @param {string} recipeId - The ID of the recipe.
   * @returns {Promise<Object|null>} - The recipe details or null if not found.
   */
  async function fetchMealDBRecipeDetails(recipeId) {
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(recipeId)}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("TheMealDB recipe details:", data);
      if (!data.meals) {
        return null;
      }
      const meal = data.meals[0];
      return {
        id: meal.idMeal,
        title: meal.strMeal,
        image: meal.strMealThumb,
        instructions: meal.strInstructions,
        source: "themealdb",
        extendedIngredients: getMealIngredients(meal)
      };
    } catch (error) {
      console.error("Error fetching TheMealDB recipe details:", error);
      return null;
    }
  }
  
  /**
   * Fetch recipes from TheMealDB API.
   * @param {string} query - Search query.
   * @param {number} offset - Ignored (TheMealDB doesn't support offset).
   * @returns {Promise<Array>} - Array of recipe objects.
   */
  async function fetchAllRecipes(query, offset = 0) {
    return await fetchMealDBRecipes(query);
  }
  
  /**
   * Fetch detailed recipe information.
   * @param {string} recipeId - The ID of the recipe.
   * @param {string} source - Should be "themealdb".
   * @returns {Promise<Object|null>} - Recipe details.
   */
  async function fetchRecipeDetails(recipeId, source) {
    if (source === "themealdb") {
      return await fetchMealDBRecipeDetails(recipeId);
    }
    return null;
  }
  
  export { fetchAllRecipes, fetchRecipeDetails };