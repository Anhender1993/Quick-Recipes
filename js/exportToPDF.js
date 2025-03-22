// exportToPDF.js - Handles exporting recipe details to PDF using the jsPDF library
// Ensure the jsPDF library is included via CDN in your HTML.

const jsPDF = (typeof window !== "undefined" && window.jspdf) ? window.jspdf.jsPDF : null;
if (!jsPDF) {
  console.error("jsPDF library is not loaded. Please include it to enable PDF export.");
}

/**
 * Removes HTML tags from a string using a regular expression.
 * @param {string} html - The HTML string.
 * @returns {string} - The plain text without HTML tags.
 */
function stripHtmlTags(html) {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Exports a recipe's details to a PDF file.
 * @param {Object} recipe - Recipe details containing title, ingredients, and instructions.
 */
function exportToPDF(recipe) {
  if (!jsPDF) {
    console.error("jsPDF library is not loaded. Please include it to enable PDF export.");
    return;
  }
  const doc = new jsPDF();
  const title = recipe.title || recipe.name || "Recipe";
  doc.setFontSize(20);
  doc.text(title, 10, 20);
  
  doc.setFontSize(14);
  doc.text("Ingredients:", 10, 30);
  doc.setFontSize(12);
  let yOffset = 40;
  const ingredients =
    recipe.extendedIngredients ||
    (recipe.sections && recipe.sections[0] && recipe.sections[0].components) ||
    [];
    
  if (ingredients.length === 0) {
    doc.text("No ingredients available.", 10, yOffset);
    yOffset += 10;
  } else {
    ingredients.forEach((ing) => {
      let line = "";
      if (ing.original) {
        line = ing.original;
      } else if (ing.ingredient && ing.measurement) {
        line = `${ing.ingredient.name} - ${ing.measurement.quantity || ""} ${ing.measurement.unit || ""}`;
      } else {
        line = "Unknown ingredient";
      }
      doc.text(line, 10, yOffset);
      yOffset += 10;
      if (yOffset > 280) {
        doc.addPage();
        yOffset = 20;
      }
    });
  }
  
  doc.setFontSize(14);
  doc.text("Instructions:", 10, yOffset + 10);
  doc.setFontSize(12);
  yOffset += 20;
  
  // Remove HTML tags from instructions using regex.
  const rawInstructions = recipe.instructions || recipe.description || "No instructions available.";
  const plainInstructions = stripHtmlTags(rawInstructions);
  const lines = doc.splitTextToSize(plainInstructions, 180);
  doc.text(lines, 10, yOffset);
  
  doc.save(`${title}.pdf`);
}

export { exportToPDF };