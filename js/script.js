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
let currentQuery = "";
let currentOffset = 0; // Used for API pagination

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
 * Render paginated recipe results.
 * @param {Array} recipes - List of recipes to display.
 */
function renderRecipes(recipes) {
  resultsContainer.innerHTML = "";

  if (recipes.length === 0) {
    resultsContainer.innerHTML = "<p>No recipes found. Try another search.</p>";
    paginationContainer.innerHTML = "";
    return;
  }

  // Calculate slice of recipes for current page.
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

    // Attach event listener to "More information" button.
    const moreInfoBtn = recipeCard.querySelector(".more-info-btn");
    moreInfoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showRecipeDetails(recipe);
    });

    resultsContainer.appendChild(recipeCard);
  });

  renderPagination(allRecipes.length);
}

/**
 * Load more recipes from the API and append them.
 */
async function loadMoreRecipes() {
  // Increase offset by 10.
  currentOffset += 10;
  const newRecipes = await fetchAllRecipes(currentQuery, currentOffset);
  allRecipes = allRecipes.concat(newRecipes);
}

/**
 * Render pagination controls with arrow buttons.
 * @param {number} totalResults - Total number of recipes available.
 */
function renderPagination(totalResults) {
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  // Previous arrow button.
  const prevButton = document.createElement("button");
  prevButton.innerHTML = "&#8592;";
  prevButton.classList.add("arrow-button");
  if (currentPage === 1) prevButton.disabled = true;
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderRecipes(allRecipes);
    }
  });
  paginationContainer.appendChild(prevButton);

  // Numeric page buttons.
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

  // Next arrow button.
  const nextButton = document.createElement("button");
  nextButton.innerHTML = "&#8594;";
  nextButton.classList.add("arrow-button");
  nextButton.addEventListener("click", async () => {
    // If the next page index exceeds currently loaded recipes, load more.
    if (currentPage * resultsPerPage >= allRecipes.length) {
      await loadMoreRecipes();
    }
    currentPage++;
    renderRecipes(allRecipes);
  });
  paginationContainer.appendChild(nextButton);
}

/**
 * Show recipe details in a modal.
 * @param {Object} recipe - Recipe details object.
 */
async function showRecipeDetails(recipe) {
  const source = recipe.source;
  const recipeId = recipe.id || recipe.slug || recipe.recipe_id || recipe.uuid;
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
          if (ing.original) return `<li>${ing.original}</li>`;
          if (ing.ingredient && ing.measurement)
            return `<li>${ing.ingredient.name} - ${ing.measurement.quantity || ''} ${ing.measurement.unit || ''}</li>`;
          return "<li>Unknown ingredient</li>";
        })
        .join("")}
    </ul>
    <h3>Instructions:</h3>
    <p>${details.instructions || details.description || "No instructions available."}</p>
    <button id="export-pdf">Export to PDF</button>
  `;

  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("export-pdf").addEventListener("click", () => exportToPDF(details));
  openModal();
}

/**
 * Perform search and update UI.
 */
async function performSearch() {
  const query = searchInput.value.trim();
  if (!query) return;
  currentQuery = query;
  currentOffset = 0;
  currentPage = 1;
  allRecipes = await fetchAllRecipes(query, currentOffset);
  renderRecipes(allRecipes);
}

// Event Listeners
searchButton.addEventListener("click", performSearch);
searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") performSearch();
});
window.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
});

export { performSearch };