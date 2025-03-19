// script.js - Handles search functionality and UI updates

import { fetchAllRecipes, fetchRecipeDetails } from "./fetchRecipes.js";

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultsContainer = document.getElementById("results-container");
const paginationContainer = document.getElementById("pagination-container");
const modal = document.getElementById("recipe-modal");
const modalContent = document.getElementById("modal-content");
const closeModal = document.getElementById("close-modal");

let currentPage = 1;
const resultsPerPage = 10;
let allRecipes = [];

/**
 * Render paginated recipe results
 * @param {Array} recipes - List of recipes to display
 */
function renderRecipes(recipes) {
    resultsContainer.innerHTML = "";

    if (recipes.length === 0) {
        resultsContainer.innerHTML = "<p>No recipes found. Try another search.</p>";
        paginationContainer.innerHTML = "";
        return;
    }

    const start = (currentPage - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    const paginatedRecipes = recipes.slice(start, end);

    paginatedRecipes.forEach(recipe => {
        const recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");
        recipeCard.innerHTML = `
            <img src="${recipe.image || 'placeholder.jpg'}" alt="${recipe.title || recipe.name}">
            <h3>${recipe.title || recipe.name}</h3>
        `;
        recipeCard.addEventListener("click", () => showRecipeDetails(recipe));
        resultsContainer.appendChild(recipeCard);
    });

    renderPagination(recipes.length);
}

/**
 * Render pagination controls
 * @param {number} totalResults - Total number of recipes
 */
function renderPagination(totalResults) {
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(totalResults / resultsPerPage);
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.innerText = i;
        pageButton.classList.add("page-button");
        if (i === currentPage) pageButton.classList.add("active");
        pageButton.addEventListener("click", () => {
            currentPage = i;
            renderRecipes(allRecipes);
        });
        paginationContainer.appendChild(pageButton);
    }
}

/**
 * Show recipe details in a modal
 * @param {Object} recipe - Recipe details object
 */
async function showRecipeDetails(recipe) {
    const source = recipe.id ? "spoonacular" : "tasty";
    const recipeId = recipe.id || recipe.slug;

    const details = await fetchRecipeDetails(recipeId, source);
    if (!details) return;

    modalContent.innerHTML = `
        <h2>${details.title || details.name}</h2>
        <img src="${details.image || 'placeholder.jpg'}" alt="${details.title || details.name}">
        <h3>Ingredients:</h3>
        <ul>
            ${(details.extendedIngredients || details.sections[0]?.components || []).map(ing =>
                `<li>${ing.original || `${ing.ingredient?.name} - ${ing.measurement?.quantity} ${ing.measurement?.unit}`}</li>`
            ).join("")}
        </ul>
        <h3>Instructions:</h3>
        <p>${details.instructions || details.description || "No instructions available."}</p>
        <button id="export-pdf">Export to PDF</button>
    `;

    document.getElementById("export-pdf").addEventListener("click", () => exportToPDF(details));
    
    modal.style.display = "block";
}

/**
 * Perform search and update UI
 */
async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    currentPage = 1;
    allRecipes = await fetchAllRecipes(query);
    renderRecipes(allRecipes);
}

// Event Listeners
searchButton.addEventListener("click", performSearch);
searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") performSearch();
});
closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (event) => {
    if (event.target === modal) modal.style.display = "none";
});

export { performSearch };
