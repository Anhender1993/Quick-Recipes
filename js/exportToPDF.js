// exportToPDF.js - Handles exporting recipe details to PDF using the jsPDF library

const jsPDF = (typeof window !== "undefined" && window.jspdf) ? window.jspdf.jsPDF : null;
if (!jsPDF) {
  console.error("jsPDF library is not loaded. Please include it to enable PDF export.");
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

  // Title
  doc.setFontSize(20);
  doc.text(title, 10, 20);

  // Ingredients
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

      // Add new page if near bottom
      if (yOffset > 280) {
        doc.addPage();
        yOffset = 20;
      }
    });
  }

  // Instructions
  doc.setFontSize(14);
  doc.text("Instructions:", 10, yOffset + 10);
  doc.setFontSize(12);
  yOffset += 20;
  const instructions = recipe.instructions || recipe.description || "No instructions available.";
  const lines = doc.splitTextToSize(instructions, 180);
  doc.text(lines, 10, yOffset);

  // Save the PDF
  doc.save(`${title}.pdf`);
}

export { exportToPDF };