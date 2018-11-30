import Search from './models/Search';
import Recipe from './models/Recipe';
import ShoppingList from './models/ShoppingList';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as shoppingListView from './views/shoppingListView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';
import List from './models/ShoppingList';

/** Global state
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};

/**
 * Search Controller
 */
const controlSearch = async () => {
  // 1) Get query from view
  const query = searchView.getInput();

  if (query) {
    // 2) New search object and add to state
    state.search = new Search(query);

    // 3) Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      // 4) Search for recipes
      await state.search.getResults();

      // 5) Render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (err) {
      alert('Error occurred with the search...');
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/**
 * Recipe Controller
 */
const controlRecipe = async () => {
  // Get the ID from the url
  const id = window.location.hash.replace('#', '');

  if (id) {
    // Prepare the UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight selected recipe
    if (state.search) searchView.highlightSelected(id);

    // Create new recipe object
    state.recipe = new Recipe(id);

    // Testing
    // window.r = state.recipe;

    try {
      // Get recipe data and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      // Render recipe
      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes ? state.likes.isLiked(id) : false
      );
    } catch (err) {
      alert('Error processing recipe');
      console.log(err);
    }
  }
};

// ShoppingList Controller
const controlShoppinglist = () => {
  // Create a new list if there is no current list
  if (!state.list) state.list = new ShoppingList();

  // Add each ingredient to the list
  state.recipe.ingredients.forEach(el => {
    // Update the model with the new ingredient
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    // Update the UI with the new ingredient
    shoppingListView.renderItem(item);
  });
};

// Like Controller
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currId = state.recipe.id;

  // Current recipe is not in the favorites
  if (!state.likes.isLiked(currId)) {
    // Add like to the recipe state
    const newLike = state.likes.addLike(
      currId,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    // Toggle the like button
    likesView.toggleLikeBtn(true);

    // Add like to UI list
    likesView.renderLike(newLike);

    // Current recipe is already in the favorites
  } else {
    // Remove like from the recipe state
    state.likes.deleteLike(currId);

    // Toggle the like button
    likesView.toggleLikeBtn(false);

    // Remove like from UI list
    likesView.deleteLike(currId);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
  state.likes = new Likes();
  // Restore likes
  state.likes.readStorage();
  // Toggle likes menu
  likesView.toggleLikeMenu(state.likes.getNumLikes());
  // Add existing likes to the UI
  state.likes.likes.forEach(el => {
    likesView.renderLike(el);
  });
});

['hashchange', 'load'].forEach(event =>
  window.addEventListener(event, controlRecipe)
);

// Handle delete and update shopping list item events
elements.shoppingList.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;
  // Handle the delete event
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    // Delete from the state
    state.list.deleteItem(id);

    // Delete from UI
    shoppingListView.deleteItem(id);
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value, 10);
    if (val > 0) state.list.updateAmount(id, val);
  }
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    // Decrease btn is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      // Update the recipe view
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    // Increase btn is clicked
    state.recipe.updateServings('inc');
    // Update the recipe view
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    // Add ingredients to shopping list button
    controlShoppinglist();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    // Add recipe to favorites button
    controlLike();
  }
});
