import uniqid from 'uniqid';

export default class ShoppingList {
  constructor() {
    this.items = [];
  }

  addItem(amount, unit, ingredient) {
    const item = {
      id: uniqid(),
      amount,
      unit,
      ingredient
    };
    this.items.push(item);
    return item;
  }

  deleteItem(id) {
    const index = this.items.findIndex(el => el.id === id);
    this.items.splice(index, 1);
  }

  updateAmount(id, newAmount) {
    if (newAmount > 0) {
      this.items.find(el => el.id === id).amount = newAmount;
    }
  }
}
