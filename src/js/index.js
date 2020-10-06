import Search from './models/Search';
import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import { elements, renderLoader, clearLoader } from './views/base';
import Recipe from './models/Recipe';

//Global state of the app
/*
* - Search object
* - Current recipe object
* - Shopping list object
* - Liked recipes
*/
const state = {};

// SEARCH CONTROLLER

const controlSearch = async () => {

  // 1. Get the query from the view
  const query = searchView.getInput(); 
  console.log(query);

  if (query) {
    // 2. New search object and add to state
    state.search = new Search(query);

    // 3. Prepare the UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      // 4. Search for recipes
      await state.search.getResults();

      // 5. render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (error) {
      alert('Something went wrong with the search :(')
    }
  }
};

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline')
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  };
});


// RECIPE CONTROLLER

const controlRecipe = async () => {

  // Get the ID from the URL
  const id = window.location.hash.replace('#', '');
  console.log(id);

  if (id) {
    // 1. Prepare the UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight selected search item
    if (state.search) searchView.highlightSelected(id);

    // 2. Create a new recipe object
    state.recipe = new Recipe(id);

    try {
      // 3. Get recipe data and parse the ingredients
      await state.recipe.getRecipe();
      console.log(state.recipe);
      state.recipe.parseIngredients();

      // 4. Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      // 5. Render Recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe);

    } catch (err) {
      alert('Error processing recipe');
    }
  }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    // Decrease button is clicked 
  }
});



// Однонаправенный поток данных - redux / services 
// Обязательно почитать 
// React не покрывает всех фичей
// React создан для более маленьких приложений, а angular для больших
// Flux pattern
