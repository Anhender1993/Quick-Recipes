// exportToPDF.js - Handles exporting recipe details to PDF using the jsPDF library
// Make sure to include the jsPDF library in your HTML. For example, add the following script tag in your HTML file:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

// Check if jsPDF is available globally (via the CDN script) or try to import it if using modules.
let jsPDF;
if (typeof window !== "undefined" && window.jspdf) {
    jsPDF = window.jspdf.jsPDF;
} else {
    try {
        // If you're using a bundler or module system, ensure jspdf is installed and imported.
        import { jsPDF as importedJsPDF } from "jspdf";
        jsPDF = importedJsPDF;
    } catch (e) {
        console.error("jsPDF library is not available. Please include the jsPDF library to enable PDF export.");
    }
}

/**
 * Exports a recipe's details to a PDF file.
 * @param {Object} recipe - Recipe details object containing title, ingredients, and instructions.
 */
function exportToPDF(recipe) {
    if (!jsPDF) {
        console.error("jsPDF library is not loaded. Please include it to enable PDF export.");
        return;
    }

    // Create a new PDF document.
    const doc = new jsPDF();

    // Set the title of the PDF.
    const title = recipe.title || recipe.name || "Recipe";
    doc.setFontSize(20);
    doc.text(title, 10, 20);

    // Insert ingredients section.
    doc.setFontSize(14);
    doc.text("Ingredients:", 10, 30);
    doc.setFontSize(12);
    let yOffset = 40;
    const ingredients = recipe.extendedIngredients || (recipe.sections && recipe.sections[0] && recipe.sections[0].components) || [];

    if (ingredients.length === 0) {
        doc.text("No ingredients available.", 10, yOffset);
        yOffset += 10;
    } else {
        ingredients.forEach(ing => {
            // Build the ingredient text. Adjust the text based on available properties.
            const text = ing.original || (ing.ingredient?.name ? `${ing.ingredient.name} - ${ing.measurement?.quantity || ""} ${ing.measurement?.unit || ""}` : "");
            doc.text(text, 10, yOffset);
            yOffset += 10;
            // Add a new page if yOffset approaches the bottom of the page.
            if (yOffset > 280) {
                doc.addPage();
                yOffset = 20;
            }
        });
    }

    // Insert instructions section.
    doc.setFontSize(14);
    doc.text("Instructions:", 10, yOffset + 10);
    doc.setFontSize(12);
    yOffset += 20;
    const instructions = recipe.instructions || recipe.description || "No instructions available.";
    const lines = doc.splitTextToSize(instructions, 180);
    doc.text(lines, 10, yOffset);

    // Save the PDF file.
    doc.save(`${title}.pdf`);
}

export { exportToPDF };