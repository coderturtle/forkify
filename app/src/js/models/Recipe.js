import axios from 'axios';
import { apiKey } from '../../config';

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = await axios(
        `https://www.food2fork.com/api/get?key=${apiKey}&rId=${this.id}`
      );
      res.data.recipe.title
        ? (this.title = res.data.recipe.title)
        : (this.title = '');
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (error) {
      console.log(error);
      alert('Something went wrong :(');
    }
  }

  calcTime() {
    // Assuming need 15 mins for every 3 ingredients
    const numIng = this.ingredients.length;
    const periods = Math.ceil(numIng / 3);
    this.time = periods * 15;
  }

  calcServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitsLong = [
      'tablespoons',
      'tablespoon',
      'ounce',
      'ounces',
      'teaspoons',
      'teaspoon',
      'cups',
      'pounds'
    ];
    const unitsShort = [
      'tbsp',
      'tbsp',
      'oz',
      'oz',
      'tsp',
      'tsp',
      'cup',
      'pound'
    ];
    const units = [...unitsShort, 'kg', 'g'];

    const newIngredients = this.ingredients.map(el => {
      // 1) All units should be the same
      let ingredient = el.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, units[i]);
      });

      // 2) Remove paretheses
      ingredient = ingredient.replace(/ *\([^)]*\) */g, '');

      // 3) Parse ingredients into count, unit and ingredient
      const arrofIngredients = ingredient.split(' ');
      const unitIndex = arrofIngredients.findIndex(el2 =>
        unitsShort.includes(el2)
      );

      let objIngredient;
      if (unitIndex > -1) {
        // There is a unit
        // Ex 4 1/2 cups, arrCount = [ 4, 1/2] --> eval("4+1/2") --> 4.5
        // Ex 3 ounces, arrCount = [3]
        const arrCount = arrofIngredients.slice(0, unitIndex);
        let count;
        if (arrCount.length === 1) {
          count = eval(arrofIngredients[0].replace('-', '+'));
        } else {
          count = eval(arrofIngredients.slice(0, unitIndex).join('+'));
        }

        objIngredient = {
          count,
          unit: arrofIngredients[unitIndex],
          ingredient: arrofIngredients.slice(unitIndex + 1).join(' ')
        };
      } else if (parseInt(arrofIngredients[0], 10)) {
        // There is NO unit specified but ingredient starts with a measurement
        objIngredient = {
          count: parseInt(arrofIngredients[0], 10),
          unit: '',
          ingredient: arrofIngredients.slice(1).join(' ')
        };
      } else if (unitIndex === -1) {
        // There is NO unit
        objIngredient = {
          count: 1,
          unit: '',
          ingredient
        };
      }
      return objIngredient;
    });
    this.ingredients = newIngredients;
  }
}