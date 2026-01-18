class MealService {
  constructor() {
    this.baseUrl = 'https://www.themealdb.com/api/json/v1/1';
  }

  async getCategories() {
    try {
      const response = await fetch(this.baseUrl + '/categories.php');
      const data = await response.json();
      if(data.categories) {
        return data.categories;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getAreas() {
    try {
      const response = await fetch(this.baseUrl + '/list.php?a=list');
      const data = await response.json();
      if(data.meals) {
        return data.meals;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
      return [];
    }
  }

  async searchMeals(query) {
    try {
      const url = this.baseUrl + '/search.php?s=' + query;
      const response = await fetch(url);
      const data = await response.json();
      if(data.meals) {
        return data.meals;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error searching meals:', error);
      return [];
    }
  }

  async filterByCategory(category) {
    try {
      const url = this.baseUrl + '/filter.php?c=' + category;
      const response = await fetch(url);
      const data = await response.json();
      if(data.meals) {
        return data.meals;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error filtering by category:', error);
      return [];
    }
  }

  async filterByArea(area) {
    try {
      const url = this.baseUrl + '/filter.php?a=' + area;
      const response = await fetch(url);
      const data = await response.json();
      if(data.meals) {
        return data.meals;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error filtering by area:', error);
      return [];
    }
  }

  async getMealById(id) {
    try {
      const url = this.baseUrl + '/lookup.php?i=' + id;
      const response = await fetch(url);
      const data = await response.json();
      if(data.meals) {
        return data.meals[0];
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching meal:', error);
      return null;
    }
  }

  async getMealsByIds(ids) {
    try {
      const meals = [];
      for(let i = 0; i < ids.length; i++) {
        const meal = await this.getMealById(ids[i]);
        if(meal !== null) {
          meals.push(meal);
        }
      }
      return meals;
    } catch (error) {
      console.error('Error fetching multiple meals:', error);
      return [];
    }
  }

  async getRandomMeals(count = 25) {
    try {
      const meals = [];
      for(let i = 0; i < count; i++) {
        const response = await fetch(this.baseUrl + '/random.php');
        const data = await response.json();
        if(data.meals && data.meals[0]) {
          meals.push(data.meals[0]);
        }
      }
      return meals;
    } catch (error) {
      console.error('Error fetching random meals:', error);
      return [];
    }
  }
}

export default new MealService();