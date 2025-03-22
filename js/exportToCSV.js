// exportToCSV.js - Handles exporting recipe details to a CSV file

/**
 * Helper function to remove HTML tags from a string using a regular expression.
 * @param {string} html - The HTML string.
 * @returns {string} - The plain text without HTML tags.
 */
function stripHtmlTags(html) {
    return html.replace(/<[^>]*>/g, "");
  }
  
  /**
   * Processes the instructions to separate them into steps on different lines.
   * If the instructions contain <li> tags, it extracts each step.
   * Otherwise, it strips HTML and adds a newline after each period.
   * @param {string} instructions - The HTML instructions string.
   * @returns {string} - The processed instructions with steps separated by newlines.
   */
  function processInstructions(instructions) {
    if (instructions.includes("<li>")) {
      // Match all <li>...</li> content.
      const matches = instructions.match(/<li>(.*?)<\/li>/g);
      if (matches) {
        return matches
          .map(item => item.replace(/<\/?li>/g, '').trim())
          .join("\n");
      }
    }
    // Otherwise, strip HTML tags and add newlines after periods.
    const plainText = stripHtmlTags(instructions);
    // Replace period-space with period and newline.
    return plainText.replace(/\. /g, ".\n");
  }
  
  /**
   * Exports a recipe's details to a CSV file.
   * The CSV will have columns: Title, Ingredients, Instructions.
   * @param {Object} recipe - Recipe details containing title, ingredients, and instructions.
   */
  function exportToCSV(recipe) {
    // Extract title.
    const title = recipe.title || recipe.name || "Recipe";
    
    // Process ingredients.
    let ingredientsList = "";
    if (recipe.extendedIngredients && recipe.extendedIngredients.length) {
      ingredientsList = recipe.extendedIngredients.map(ing => ing.original).join("; ");
    } else if (recipe.sections && recipe.sections[0] && recipe.sections[0].components) {
      ingredientsList = recipe.sections[0].components
        .map(ing => ing.original || (ing.ingredient ? ing.ingredient.name : "Unknown"))
        .join("; ");
    } else {
      ingredientsList = "No ingredients available";
    }
    
    // Process instructions.
    const rawInstructions = recipe.instructions || recipe.description || "No instructions available";
    const processedInstructions = processInstructions(rawInstructions);
    
    // Create a CSV row, escaping quotes properly.
    const escapeCSV = (text) => `"${text.replace(/"/g, '""')}"`;
    const row = [title, ingredientsList, processedInstructions].map(escapeCSV).join(",");
    
    // CSV headers.
    const headers = ['Title', 'Ingredients', 'Instructions'].map(escapeCSV).join(",");
    const csvContent = headers + "\n" + row;
    
    // Create a Blob and trigger download.
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  export { exportToCSV };