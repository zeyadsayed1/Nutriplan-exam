class ProductService {
  constructor() {
    this.baseUrl = 'https://world.openfoodfacts.org';
  }

  async searchProducts(query, page = 1, pageSize = 24, nutritionGrade = '') {
    try {
      const encodedQuery = encodeURIComponent(query);
      let url = this.baseUrl + '/cgi/search.pl?search_terms=' + encodedQuery + '&json=1&page=' + page + '&page_size=' + pageSize;
      
      if (nutritionGrade) {
        const grade = nutritionGrade.toLowerCase();
        url = url + '&nutrition_grades=' + grade;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if(data.products) {
        return data.products;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  async searchProductsByCategory(category, page = 1, pageSize = 24, nutritionGrade = '') {
    try {
      let searchTerm = category;
      
      if(category === 'breakfast_cereals') {
        searchTerm = 'cereals';
      } else if(category === 'beverages') {
        searchTerm = 'beverages drinks';
      } else if(category === 'snacks') {
        searchTerm = 'snacks chips cookies';
      } else if(category === 'dairy') {
        searchTerm = 'milk cheese yogurt';
      } else if(category === 'fruits') {
        searchTerm = 'fruits';
      } else if(category === 'vegetables') {
        searchTerm = 'vegetables';
      } else if(category === 'breads') {
        searchTerm = 'bread';
      } else if(category === 'meats') {
        searchTerm = 'meat chicken beef';
      } else if(category === 'frozen_foods') {
        searchTerm = 'frozen';
      } else if(category === 'sauces') {
        searchTerm = 'sauce ketchup';
      }

      return await this.searchProducts(searchTerm, page, pageSize, nutritionGrade);
    } catch (error) {
      console.error('Error searching by category:', error);
      return [];
    }
  }

  async getProductByBarcode(barcode) {
    try {
      const url = this.baseUrl + '/api/v0/product/' + barcode + '.json';
      const response = await fetch(url);
      const data = await response.json();
      
      if(data.status === 1) {
        return data.product;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  parseNutrition(product) {
    let nutriments = product.nutriments;
    if(!nutriments) {
      nutriments = {};
    }
    
    let calories = 0;
    if(nutriments['energy-kcal_100g']) {
      calories = nutriments['energy-kcal_100g'];
    } else if(nutriments['energy-kcal']) {
      calories = nutriments['energy-kcal'];
    }
    
    let protein = 0;
    if(nutriments.proteins_100g) {
      protein = nutriments.proteins_100g;
    } else if(nutriments.proteins) {
      protein = nutriments.proteins;
    }
    
    let carbs = 0;
    if(nutriments.carbohydrates_100g) {
      carbs = nutriments.carbohydrates_100g;
    } else if(nutriments.carbohydrates) {
      carbs = nutriments.carbohydrates;
    }
    
    let fat = 0;
    if(nutriments.fat_100g) {
      fat = nutriments.fat_100g;
    } else if(nutriments.fat) {
      fat = nutriments.fat;
    }
    
    let sugar = 0;
    if(nutriments.sugars_100g) {
      sugar = nutriments.sugars_100g;
    } else if(nutriments.sugars) {
      sugar = nutriments.sugars;
    }
    
    let fiber = 0;
    if(nutriments.fiber_100g) {
      fiber = nutriments.fiber_100g;
    } else if(nutriments.fiber) {
      fiber = nutriments.fiber;
    }
    
    let sodium = 0;
    if(nutriments.sodium_100g) {
      sodium = nutriments.sodium_100g;
    } else if(nutriments.sodium) {
      sodium = nutriments.sodium;
    }
    
    return {
      calories: calories,
      protein: protein,
      carbs: carbs,
      fat: fat,
      sugar: sugar,
      fiber: fiber,
      sodium: sodium
    };
  }

  getProductData(product) {
    let barcode = product.code;
    if(!barcode) {
      barcode = product._id;
    }
    
    let name = product.product_name;
    if(!name) {
      name = 'Unknown Product';
    }
    
    let brand = product.brands;
    if(!brand) {
      brand = 'Unknown Brand';
    }
    
    let image = product.image_url;
    if(!image) {
      image = product.image_front_url;
    }
    if(!image) {
      image = '';
    }
    
    let quantity = product.quantity;
    if(!quantity) {
      quantity = '';
    }
    
    let nutriScore = product.nutrition_grades;
    if(!nutriScore) {
      nutriScore = '';
    }
    nutriScore = nutriScore.toUpperCase();
    
    let novaGroup = product.nova_group;
    if(!novaGroup) {
      novaGroup = 0;
    }
    
    const nutrition = this.parseNutrition(product);
    
    return {
      barcode: barcode,
      name: name,
      brand: brand,
      image: image,
      quantity: quantity,
      nutriScore: nutriScore,
      novaGroup: novaGroup,
      nutrition: nutrition
    };
  }
}

export default new ProductService();