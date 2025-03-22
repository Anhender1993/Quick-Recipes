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
let currentOffset = 0; // For API pagination
const maxPagesToLoad = 5; // Pre-load up to 5 pages (max 50 recipes)

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

  // Calculate the slice of recipes for the current page.
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

    // Attach event listener to the "More information" button.
    const moreInfoBtn = recipeCard.querySelector(".more-info-btn");
    moreInfoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showRecipeDetails(recipe);
    });

    resultsContainer.appendChild(recipeCard);
  });

  renderPagination();
}

/**
 * Load more recipes from the API and append them.
 * (This function is not used during navigation now because we pre-load all recipes.)
 * @returns {Promise<Array>} - The newly loaded recipes.
 */
async function loadMoreRecipes() {
  currentOffset += resultsPerPage;
  const newRecipes = await fetchAllRecipes(currentQuery, currentOffset);
  if (newRecipes.length > 0) {
    allRecipes = allRecipes.concat(newRecipes);
  }
  return newRecipes;
}

/**
 * Render pagination controls with arrow buttons and a Home button.
 * Displays numeric page buttons based on the preloaded recipes, up to a maximum of 5.
 */
function renderPagination() {
  paginationContainer.innerHTML = "";
  
  // Compute total pages based on preloaded recipes.
  const computedTotalPages = Math.ceil(allRecipes.length / resultsPerPage);
  const totalPages = Math.min(computedTotalPages, maxPagesToLoad);

  // Create and add the Home button.
  const homeButton = document.createElement("button");
  homeButton.innerText = "Home";
  homeButton.classList.add("home-button");
  homeButton.addEventListener("click", () => {
    location.reload();
  });
  paginationContainer.appendChild(homeButton);

  // Create previous arrow button.
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

  // Determine sliding window for numeric page buttons.
  let startPage = 1;
  let endPage = totalPages;
  if (totalPages > 5) {
    startPage = Math.max(1, currentPage - 2);
    endPage = startPage + 4;
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = endPage - 4;
    }
  }

  // Numeric page buttons.
  for (let i = startPage; i <= endPage; i++) {
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

  // Create next arrow button.
  const nextButton = document.createElement("button");
  nextButton.innerHTML = "&#8594;";
  nextButton.classList.add("arrow-button");
  if (currentPage === totalPages) nextButton.disabled = true;
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderRecipes(allRecipes);
    } else {
      alert("No more recipes available.");
    }
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
 * Pre-loads recipes for up to 5 pages (max 50 recipes) upon search.
 */
async function performSearch() {
  const query = searchInput.value.trim();
  if (!query) return;
  currentQuery = query;
  currentOffset = 0;
  currentPage = 1;
  allRecipes = [];
  
  // Pre-load recipes for up to maxPagesToLoad pages concurrently.
  const promises = [];
  for (let i = 0; i < maxPagesToLoad; i++) {
    const offset = i * resultsPerPage;
    promises.push(fetchAllRecipes(query, offset));
  }
  const results = await Promise.all(promises);
  allRecipes = results.flat();
  console.log("Preloaded recipes:", allRecipes);
  renderRecipes(allRecipes);
}

// Event Listeners
searchButton.addEventListener("click", performSearch);
searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") performSearch();
});
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) {
    closeModal();
  }
});

export { performSearch };