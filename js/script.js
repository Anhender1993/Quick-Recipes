// script.js - Handles search functionality, UI updates, and modal logic

import { fetchAllRecipes, fetchRecipeDetails } from "./FetchRecipes.js";
import { exportToPDF } from "./exportToPDF.js";

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultsContainer = document.getElementById("results-container");
const paginationContainer = document.getElementById("pagination-container");
const modal = document.getElementById("recipe-modal");
const modalContent = document.getElementById("modal-content");

let currentPage = 1;
const resultsPerPage = 10;
let allRecipes = [];

/** Opens the modal by adding the "open" class. */
function openModal() {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

/** Closes the modal by removing the "open" class. */
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

/**
 * Render paginated recipe results
 */
function renderRecipes(recipes) {
  resultsContainer.innerHTML = "";

  if (recipes.length === 0) {
    resultsContainer.innerHTML = "<p>No recipes found. Try another search.</p>";
    paginationContainer.innerHTML = "";
    return;
  }

  // Calculate pagination slice
  const start = (currentPage - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  const paginatedRecipes = recipes.slice(start, end);

  paginatedRecipes.forEach((recipe) => {
    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");
    recipeCard.innerHTML = `
      <img src="${recipe.image || 'placeholder.jpg'}" alt="${recipe.title || 'Recipe'}">
      <h3>${recipe.title || 'Untitled Recipe'}</h3>
      <button class="more-info-btn">More information</button>
    `;

    // "More information" button
    const moreInfoBtn = recipeCard.querySelector(".more-info-btn");
    moreInfoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showRecipeDetails(recipe);
    });

    resultsContainer.appendChild(recipeCard);
  });

  renderPagination(recipes.length);
}

/**
 * Render pagination controls
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
 */
async function showRecipeDetails(recipe) {
  const source = recipe.source;
  const recipeId = recipe.id || recipe.slug || recipe.recipe_id || recipe.uuid; // fallback

  const details = await fetchRecipeDetails(recipeId, source);
  if (!details) {
    modalContent.innerHTML = `
      <span class="close" id="close-modal" aria-label="Close modal">&times;</span>
      <h2>Error</h2>
      <p>Unable to fetch recipe details. Please try again later.</p>
    `;
    document.getElementById("close-modal").addEventListener("click", closeModal);
    openModal();
    return;
  }

  // Build ingredients list
  const ingredientsList =
    details.extendedIngredients ||
    (details.sections && details.sections[0] && details.sections[0].components) ||
    [];

  modalContent.innerHTML = `
    <span class="close" id="close-modal" aria-label="Close modal">&times;</span>
    <h2>${details.title || details.name || "Untitled Recipe"}</h2>
    <img src="${details.image || 'placeholder.jpg'}" alt="${details.title || 'Recipe'}">
    <h3>Ingredients:</h3>
    <ul>
      ${ingredientsList
        .map((ing) => {
          if (ing.original) {
            return `<li>${ing.original}</li>`;
          } else if (ing.ingredient && ing.measurement) {
            return `<li>${ing.ingredient.name} - ${ing.measurement.quantity || ''} ${ing.measurement.unit || ''}</li>`;
          }
          return "<li>Unknown ingredient</li>";
        })
        .join("")}
    </ul>
    <h3>Instructions:</h3>
    <p>${details.instructions || details.description || "No instructions available."}</p>
    <button id="export-pdf">Export to PDF</button>
  `;

  // Re-bind the close button
  document.getElementById("close-modal").addEventListener("click", closeModal);

  // PDF export
  document.getElementById("export-pdf").addEventListener("click", () => exportToPDF(details));

  openModal();
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

// EVENT LISTENERS
searchButton.addEventListener("click", performSearch);
searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") performSearch();
});

// Close modal when clicking outside it
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Close modal on ESC key
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) {
    closeModal();
  }
});