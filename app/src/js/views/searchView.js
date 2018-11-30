import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
  elements.searchInput.value = '';
};

export const clearResults = () => {
  elements.searchResultList.innerHTML = '';
  elements.searchResPages.innerHTML = '';
};

export const highlightSelected = id => {
  // Remove all previous highlighted recipes
  // Create an array from all DOM objects with the specified class name
  const resultsArr = Array.from(document.querySelectorAll('.results__link'));
  // Remove the highlighted class from each one
  resultsArr.forEach(el => {
    el.classList.remove('results__link--active');
  });

  // Now highlight the selected recipe
  document
    .querySelector(`.results__link[href="#${id}"]`)
    .classList.add('results__link--active');
};

// function to limit the characters displayed from the title
export const limitRecipeTitle = (title, limit = 17) => {
  const newTitle = [];
  if (title.length > limit) {
    // Break the title into an array of words
    // Use the reduce method of the array to loop through the array
    // and check if adding the next word will go over the character limit
    // If it doesn't then add the word to the new title array
    title.split(' ').reduce((acc, cur) => {
      if (acc + cur.length <= limit) {
        newTitle.push(cur);
      }
      return acc + cur.length;
    }, 0);

    // Expand out the newTitle array into a single string seperated by spaces
    return `${newTitle.join(' ')} ...`;
  }
  return title;
};

const renderRecipe = recipe => {
  const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(
                      recipe.title
                    )}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
  elements.searchResultList.insertAdjacentHTML('beforeend', markup);
};

const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${
  type === 'prev' ? page - 1 : page + 1
}>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${
              type === 'prev' ? 'left' : 'right'
            }"></use>
        </svg>
    </button>
`;

const renderButtons = (page, numOfResults, resPerPage) => {
  const pages = Math.ceil(numOfResults / resPerPage);

  let button;
  if (page === 1 && pages > 1) {
    // Only show next page button
    button = createButton(page, 'next');
  } else if (page < pages) {
    // Both buttons
    button = `
        ${createButton(page, 'prev')}
        ${createButton(page, 'next')}
      `;
  } else if (page === pages && pages > 1) {
    // Only show previous page button
    button = createButton(page, 'prev');
  }

  elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page = 1, resPerPge = 10) => {
  // render results of current page
  const start = (page - 1) * resPerPge;
  const end = page * resPerPge;

  recipes.slice(start, end).forEach(renderRecipe);

  // render pagination buttons
  renderButtons(page, recipes.length, resPerPge);
};
