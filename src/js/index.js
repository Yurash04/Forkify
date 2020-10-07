import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
// import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';


//Global state of the app
/*
* - Search object
* - Current recipe object
* - Shopping list object
* - Liked recipes
*/
const state = {};
window.state = state;

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


// LIST CONTROLLER

const controlList = () => {
  // 1. Create a new list in case there is none
  if (!state.list) state.list = new List();

  // 2. Add each ingredient to the list and UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

// Handle, delete and update list item events
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  // Handle the delete event
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    // delete it from state
    state.list.deleteItem(id);

    // delete it from UI
    listView.deleteItem(id);

    // handle the count update
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value);
    state.list.updateCount(id, val);
  }
});


// LIKE CONTROLLER
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  // User has not yet liked current recipe
  if (!state.likes.isLiked(currentID)) {
    // 1. Add like to the state
    const newLike = state.likes.addLike(
        currentID,
        state.recipe.title,
        state.recipe.author,
        state.recipe.img
    );
    // 2. Toggle the like button

    // 3. Add like to the UI list
    console.log(state.likes);

  // User has liked current recipe
  } else {
    // 1. Remove like to the state
    state.likes.deleteLike(currentID)

    // 2. Toggle the like button

    // 3. Remove like from the UI list
    console.log(state.likes);
  }
};


// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    // Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    // Decrease button is clicked
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    // Add ingredients to shopping list
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    // Like controller
    controlLike();
  }
});

window.l = new List();



// Однонаправенный поток данных - redux / services 
// Обязательно почитать 
// React не покрывает всех фичей
// React создан для более маленьких приложений, а angular для больших
// Flux pattern
