class MealRenderer {
  constructor() {
    this.CATEGORY_ICONS = {
      'Beef': 'fa-drumstick-bite',
      'Chicken': 'fa-drumstick-bite',
      'Dessert': 'fa-cake-candles',
      'Lamb': 'fa-drumstick-bite',
      'Miscellaneous': 'fa-bowl-rice',
      'Pasta': 'fa-bowl-food',
      'Pork': 'fa-bacon',
      'Seafood': 'fa-fish',
      'Side': 'fa-plate-wheat',
      'Starter': 'fa-utensils',
      'Vegan': 'fa-leaf',
      'Vegetarian': 'fa-seedling',
      'Breakfast': 'fa-mug-hot',
      'Goat': 'fa-drumstick-bite'
    };
    
    this.LoadingSpinner = `
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    `;
  }

  parseIngredients(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal['strIngredient' + i];
      const measure = meal['strMeasure' + i];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: measure ? measure.trim() : ''
        });
      }
    }
    return ingredients;
  }

  parseInstructions(instructions) {
    if (!instructions) return [];
    
    const lines = instructions.split(/\r\n|\n/);
    const steps = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length > 0) {
        const cleanLine = line.replace(/^STEP \d+/i, '').trim();
        if (cleanLine.length > 0) {
          steps.push(cleanLine);
        }
      }
    }
    
    return steps;
  }

  extractYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  }

  EmptyState(message, icon = 'fa-search') {
    return `
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="fa-solid ${icon} text-gray-400 text-2xl"></i>
        </div>
        <p class="text-gray-500 text-lg">${message}</p>
      </div>
    `;
  }
  // Render category cards
  renderCategories(categories) {
    const container = document.getElementById('categories-grid');
    if (!container) return;

    // Define specific gradient colors for each category (matching reference site)
    const categoryColors = {
      'Beef': { bg: 'from-red-50 to-rose-50', border: 'border-red-200 hover:border-red-400', icon: 'from-red-400 to-rose-500' },
      'Chicken': { bg: 'from-amber-50 to-orange-50', border: 'border-amber-200 hover:border-amber-400', icon: 'from-amber-400 to-orange-500' },
      'Dessert': { bg: 'from-pink-50 to-rose-50', border: 'border-pink-200 hover:border-pink-400', icon: 'from-pink-400 to-rose-500' },
      'Lamb': { bg: 'from-orange-50 to-amber-50', border: 'border-orange-200 hover:border-orange-400', icon: 'from-orange-400 to-amber-500' },
      'Miscellaneous': { bg: 'from-slate-50 to-gray-50', border: 'border-slate-200 hover:border-slate-400', icon: 'from-slate-400 to-gray-500' },
      'Pasta': { bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-200 hover:border-yellow-400', icon: 'from-yellow-400 to-amber-500' },
      'Pork': { bg: 'from-rose-50 to-red-50', border: 'border-rose-200 hover:border-rose-400', icon: 'from-rose-400 to-red-500' },
      'Seafood': { bg: 'from-cyan-50 to-blue-50', border: 'border-cyan-200 hover:border-cyan-400', icon: 'from-cyan-400 to-blue-500' },
      'Side': { bg: 'from-green-50 to-emerald-50', border: 'border-green-200 hover:border-green-400', icon: 'from-green-400 to-emerald-500' },
      'Starter': { bg: 'from-teal-50 to-cyan-50', border: 'border-teal-200 hover:border-teal-400', icon: 'from-teal-400 to-cyan-500' },
      'Vegan': { bg: 'from-emerald-50 to-green-50', border: 'border-emerald-200 hover:border-emerald-400', icon: 'from-emerald-400 to-green-500' },
      'Vegetarian': { bg: 'from-lime-50 to-green-50', border: 'border-lime-200 hover:border-lime-400', icon: 'from-lime-400 to-green-500' },
      'Breakfast': { bg: 'from-orange-50 to-yellow-50', border: 'border-orange-200 hover:border-orange-400', icon: 'from-orange-400 to-yellow-500' },
      'Goat': { bg: 'from-amber-50 to-orange-50', border: 'border-amber-200 hover:border-amber-400', icon: 'from-amber-400 to-orange-500' }
    };

    // Default colors for categories not in the map
    const defaultColors = { bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200 hover:border-emerald-400', icon: 'from-emerald-400 to-green-500' };

    let htmlContent = '';
    const categoriesToShow = categories.slice(0, 12);
    for (let i = 0; i < categoriesToShow.length; i++) {
      const cat = categoriesToShow[i];
      const colors = categoryColors[cat.strCategory] || defaultColors;
      const icon = this.CATEGORY_ICONS[cat.strCategory] || 'fa-utensils';
      htmlContent += '<div class="category-card bg-gradient-to-br ' + colors.bg + ' rounded-xl p-3 border ' + colors.border + ' hover:shadow-md cursor-pointer transition-all group" data-category="' + cat.strCategory + '">';
      htmlContent += '<div class="flex items-center gap-2.5">';
      htmlContent += '<div class="text-white w-9 h-9 bg-gradient-to-br ' + colors.icon + ' rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">';
      htmlContent += '<i class="fa-solid ' + icon + ' text-sm"></i>';
      htmlContent += '</div>';
      htmlContent += '<div>';
      htmlContent += '<h3 class="text-sm font-bold text-gray-900">' + cat.strCategory + '</h3>';
      htmlContent += '</div>';
      htmlContent += '</div>';
      htmlContent += '</div>';
    }
    container.innerHTML = htmlContent;
  }

  // Render area filter buttons
  renderAreaFilters(areas) {
    const container = document.querySelector('#search-filters-section .flex.items-center.gap-3');
    if (!container) return;

    // Keep "All Recipes" button and add area filters
    const allButton = container.querySelector('button');
    let areaButtons = '';
    const areasToShow = areas.slice(0, 8);
    for (let i = 0; i < areasToShow.length; i++) {
      const area = areasToShow[i];
      areaButtons += '<button class="area-filter px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all" data-area="' + area.strArea + '">';
      areaButtons += area.strArea;
      areaButtons += '</button>';
    }

    container.innerHTML = allButton.outerHTML + areaButtons;
  }

  // Render meal cards (grid or list view)
  renderMeals(meals, limit = 25, viewMode = 'grid') {
    const container = document.getElementById('recipes-grid');
    const countElement = document.getElementById('recipes-count');
    
    if (!container) return;

    if (!meals || meals.length === 0) {
      container.innerHTML = this.EmptyState('No recipes found', 'fa-utensils');
      if (countElement) countElement.textContent = 'No recipes found';
      return;
    }

    const mealsToShow = meals.slice(0, limit);
    
    if (viewMode === 'list') {
      this.renderMealsListView(mealsToShow, container);
    } else {
      this.renderMealsGridView(mealsToShow, container);
    }

    if (countElement) {
      countElement.textContent = `Showing ${mealsToShow.length} recipe${mealsToShow.length !== 1 ? 's' : ''}`;
    }
  }

  // Render meals in grid view
  renderMealsGridView(meals, container) {
    container.className = 'grid grid-cols-2 lg:grid-cols-4 gap-5';
    container.innerHTML = meals.map(meal => `
      <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
           data-meal-id="${meal.idMeal}">
        <div class="relative h-48 overflow-hidden">
          <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
               src="${meal.strMealThumb}"
               alt="${meal.strMeal}"
               loading="lazy" />
          <div class="absolute bottom-3 left-3 flex gap-2">
            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">
              ${meal.strCategory || 'Food'}
            </span>
            ${meal.strArea ? `
              <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">
                ${meal.strArea}
              </span>
            ` : ''}
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
            ${meal.strMeal}
          </h3>
          <p class="text-xs text-gray-600 mb-3 line-clamp-2">
            Delicious recipe to try!
          </p>
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-gray-900">
              <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
              ${meal.strCategory || 'Food'}
            </span>
            ${meal.strArea ? `
              <span class="font-semibold text-gray-500">
                <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
                ${meal.strArea}
              </span>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  // Render meals in list view
  renderMealsListView(meals, container) {
    container.className = 'grid grid-cols-2 gap-4';
    container.innerHTML = meals.map(meal => `
      <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-row h-40"
           data-meal-id="${meal.idMeal}">
        <div class="relative overflow-hidden w-48 h-full">
          <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
               src="${meal.strMealThumb}"
               alt="${meal.strMeal}"
               loading="lazy" />
          <div class="absolute bottom-3 left-3 flex gap-2 hidden">
            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-lg">
              <i class="fa-solid fa-tag text-emerald-600 mr-1"></i>${meal.strCategory || 'Food'}
            </span>
            ${meal.strArea ? `
              <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-lg">
                <i class="fa-solid fa-globe text-blue-600 mr-1"></i>${meal.strArea}
              </span>
            ` : ''}
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
            ${meal.strMeal}
          </h3>
          <p class="text-xs text-gray-600 mb-3 line-clamp-2">
            ${meal.strInstructions ? meal.strInstructions.substring(0, 120) + '...' : 'Delicious recipe to try!'}
          </p>
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-gray-900">
              <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
              ${meal.strCategory || 'Food'}
            </span>
            ${meal.strArea ? `
              <span class="font-semibold text-gray-500">
                <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
                ${meal.strArea}
              </span>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  // Show loading state
  showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = this.LoadingSpinner;
    }
  }

  // Render meal details page
  renderMealDetails(meal, nutrition) {
    const container = document.getElementById('meal-details');
    if (!container) return;

    const ingredients = this.parseIngredients(meal);
    const instructions = this.parseInstructions(meal.strInstructions);
    const youtubeId = this.extractYouTubeId(meal.strYoutube);

    // Update hero section
    const heroImg = container.querySelector('.relative.h-80 img');
    const heroTitle = container.querySelector('h1');
    const heroServings = document.getElementById('hero-servings');
    const heroCalories = document.getElementById('hero-calories');

    if (heroImg) heroImg.src = meal.strMealThumb;
    if (heroImg) heroImg.alt = meal.strMeal;
    if (heroTitle) heroTitle.textContent = meal.strMeal;
    let servings = 4;
    if(nutrition && nutrition.servings) {
      servings = nutrition.servings;
    }
    if (heroServings) heroServings.textContent = servings + ' servings';
    
    let perServingCalories = 485;
    if(nutrition && nutrition.calories && nutrition.calories.perServing) {
      perServingCalories = nutrition.calories.perServing;
    }
    if (heroCalories) heroCalories.textContent = perServingCalories + ' cal/serving';

    // Update tags
    const tagsContainer = container.querySelector('.flex.items-center.gap-3.mb-3');
    if (tagsContainer) {
      tagsContainer.innerHTML = `
        ${meal.strCategory ? `<span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${meal.strCategory}</span>` : ''}
        ${meal.strArea ? `<span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.strArea}</span>` : ''}
        ${meal.strTags ? meal.strTags.split(',').slice(0, 1).map(tag => 
          `<span class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">${tag.trim()}</span>`
        ).join('') : ''}
      `;
    }

    // Render ingredients
    this.renderIngredients(ingredients);

    // Render instructions
    this.renderInstructions(instructions);

    // Render video
    if (youtubeId) {
      const videoContainer = container.querySelector('.relative.aspect-video iframe');
      if (videoContainer) {
        videoContainer.src = `https://www.youtube.com/embed/${youtubeId}`;
      }
    }

    // Render nutrition
    this.renderNutrition(nutrition);

    // Update Log Meal button and enable it
    const logBtn = document.getElementById('log-meal-btn');
    if (logBtn) {
      logBtn.dataset.mealId = meal.idMeal;
      logBtn.dataset.mealName = meal.strMeal;
      logBtn.dataset.mealImage = meal.strMealThumb;
      
      // Enable button after nutrition loads
      logBtn.disabled = false;
      logBtn.className = 'flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all';
      logBtn.title = '';
      logBtn.innerHTML = `
        <i class="fa-solid fa-clipboard-list"></i>
        <span>Log This Meal</span>
      `;
    }
  }

  // Render ingredients list
  renderIngredients(ingredients) {
    const container = document.querySelector('#meal-details .grid.grid-cols-1.md\\:grid-cols-2.gap-3');
    if (!container) return;

    container.innerHTML = ingredients.map(ing => `
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
        <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
        <span class="text-gray-700">
          ${ing.measure ? `<span class="font-medium text-gray-900">${ing.measure}</span>` : ''}
          ${ing.ingredient}
        </span>
      </div>
    `).join('');

    // Update count
    const countSpan = document.querySelector('#meal-details h2 span');
    if (countSpan) countSpan.textContent = `${ingredients.length} items`;
  }

  // Render instructions
  renderInstructions(instructions) {
    const container = document.querySelector('#meal-details .space-y-4');
    if (!container) return;

    if (instructions.length === 0) {
      container.innerHTML = '<p class="text-gray-500">No instructions available</p>';
      return;
    }

    container.innerHTML = instructions.map((step, index) => `
      <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
        <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
          ${index + 1}
        </div>
        <p class="text-gray-700 leading-relaxed pt-2">${step}</p>
      </div>
    `).join('');
  }

  // Render nutrition facts
  renderNutrition(nutrition) {
    const container = document.getElementById('nutrition-facts-container');
    if (!container) {
      return;
    }

    let macros = {};
    if(nutrition && nutrition.macros) {
      macros = nutrition.macros;
    }
    
    let vitamins = {};
    if(nutrition && nutrition.vitamins) {
      vitamins = nutrition.vitamins;
    }
    
    let calories = {};
    if(nutrition && nutrition.calories) {
      calories = nutrition.calories;
    }
    
    let caloriesPerServing = 485;
    if(calories.perServing) {
      caloriesPerServing = calories.perServing;
    }
    
    let servings = 4;
    if(nutrition && nutrition.servings) {
      servings = nutrition.servings;
    }
    
    let caloriesTotal = caloriesPerServing * servings;
    if(calories.total) {
      caloriesTotal = calories.total;
    }
    
    let proteinAmount = 42;
    if(macros.protein && macros.protein.amount) {
      proteinAmount = macros.protein.amount;
    }
    
    let proteinDV = 84;
    if(macros.protein && macros.protein.dailyValue) {
      proteinDV = macros.protein.dailyValue;
    }
    
    let carbsAmount = 52;
    if(macros.carbs && macros.carbs.amount) {
      carbsAmount = macros.carbs.amount;
    }
    
    let carbsDV = 17;
    if(macros.carbs && macros.carbs.dailyValue) {
      carbsDV = macros.carbs.dailyValue;
    }
    
    let fatAmount = 8;
    if(macros.fat && macros.fat.amount) {
      fatAmount = macros.fat.amount;
    }
    
    let fatDV = 12;
    if(macros.fat && macros.fat.dailyValue) {
      fatDV = macros.fat.dailyValue;
    }
    
    let fiberAmount = 4;
    if(macros.fiber && macros.fiber.amount) {
      fiberAmount = macros.fiber.amount;
    }
    
    let fiberDV = 14;
    if(macros.fiber && macros.fiber.dailyValue) {
      fiberDV = macros.fiber.dailyValue;
    }
    
    let sugarAmount = 12;
    if(macros.sugar && macros.sugar.amount) {
      sugarAmount = macros.sugar.amount;
    }
    
    let sugarDV = 24;
    if(macros.sugar && macros.sugar.dailyValue) {
      sugarDV = macros.sugar.dailyValue;
    }

    container.innerHTML = `
      <p class="text-sm text-gray-500 mb-4">Per serving</p>
      
      <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
        <p class="text-sm text-gray-600">Calories per serving</p>
        <p class="text-4xl font-bold text-emerald-600">${Math.round(caloriesPerServing)}</p>
        <p class="text-xs text-gray-500 mt-1">Total: ${Math.round(caloriesTotal)} cal</p>
      </div>

      <div class="space-y-4">
        ${this.renderMacroBar('Protein', proteinAmount, 'emerald', proteinDV)}
        ${this.renderMacroBar('Carbs', carbsAmount, 'blue', carbsDV)}
        ${this.renderMacroBar('Fat', fatAmount, 'purple', fatDV)}
        ${this.renderMacroBar('Fiber', fiberAmount, 'orange', fiberDV)}
        ${this.renderMacroBar('Sugar', sugarAmount, 'pink', sugarDV)}
      </div>

      <div class="mt-6 pt-6 border-t border-gray-100">
        <h3 class="text-sm font-semibold text-gray-900 mb-3">Vitamins & Minerals (% Daily Value)</h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Vitamin A</span>
            <span class="font-medium">${vitamins.vitaminA || 15}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Vitamin C</span>
            <span class="font-medium">${vitamins.vitaminC || 25}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Calcium</span>
            <span class="font-medium">${vitamins.calcium || 4}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Iron</span>
            <span class="font-medium">${vitamins.iron || 12}%</span>
          </div>
        </div>
      </div>
    `;
  }

  // Helper to render macro bar
  renderMacroBar(name, amount, color, dailyValue) {
    return `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-${color}-500"></div>
          <span class="text-gray-700">${name}</span>
        </div>
        <span class="font-bold text-gray-900">${Math.round(amount)}g</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2">
        <div class="bg-${color}-500 h-2 rounded-full" style="width: ${Math.min(Math.round(dailyValue), 100)}%"></div>
      </div>
    `;
  }
}

class ProductRenderer {
  constructor() {
    this.LoadingSpinner = `
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    `;
  }

  EmptyState(message, icon = 'fa-search') {
    return `
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="fa-solid ${icon} text-gray-400 text-2xl"></i>
        </div>
        <p class="text-gray-500 text-lg">${message}</p>
      </div>
    `;
  }

  renderProducts(products) {
    const container = document.getElementById('products-grid');
    const countElement = document.getElementById('products-count');
    
    if (!container) return;

    try {
      if (!products || products.length === 0) {
        container.className = "flex flex-col items-center justify-center py-20 text-center w-full";
        container.innerHTML = `
          <div class="text-center">
              <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fa-solid fa-box-open text-3xl text-gray-400"></i>
              </div>
              <p class="text-gray-500 text-lg mb-2">No products to display</p>
              <p class="text-gray-400 text-sm">Search for a product or browse by category</p>
          </div>
        `;
        if (countElement) countElement.textContent = 'Search for products to see results';
        return;
      }


      container.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5";

      const htmlContent = products.map(product => {
        try {
          if(!product) return '';
          
          const nutriScore = (product.nutrition_grades || '').toUpperCase();
          const novaGroup = product.nova_group || 0;
          const nutriments = product.nutriments || {};
          
          const calories = nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0;
          const protein = nutriments.proteins_100g || nutriments.proteins || 0;
          const carbs = nutriments.carbohydrates_100g || nutriments.carbohydrates || 0;
          const fat = nutriments.fat_100g || nutriments.fat || 0;
          const sugar = nutriments.sugars_100g || nutriments.sugars || 0;
          
          const satFat = nutriments['saturated-fat_100g'] || nutriments['saturated-fat'] || 0;
          const fiber = nutriments.fiber_100g || nutriments.fiber || 0;
          const salt = nutriments.salt_100g || nutriments.salt || 0;
          const ingredients = product.ingredients_text || 'Ingredients not available';
          const quantity = product.quantity || '';

          const productData = encodeURIComponent(JSON.stringify({
             barcode: product.code || product._id,
             name: product.product_name || 'Unknown',
             brand: product.brands || 'Unknown Brand',
             image: product.image_url || product.image_front_url || '',
             quantity,
             nutriScore,
             novaGroup,
             calories, protein, carbs, fat, sugar,
             satFat, fiber, salt,
             ingredients
          }));

          return `
            <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" 
                 data-product="${productData}">
                <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" 
                         src="${product.image_url || product.image_front_url || 'https://via.placeholder.com/200'}" 
                         alt="${product.product_name || 'Product'}" 
                         loading="lazy" 
                         onerror="this.parentElement.innerHTML='<div class=\\'w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center\\'><i class=\\'fa-solid fa-box text-gray-400 text-2xl\\'></i></div>'">
                    
                    ${nutriScore ? `
                        <div class="absolute top-2 left-2 bg-${this.getNutriScoreColor(nutriScore)}-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">
                            Nutri-Score ${nutriScore}
                        </div>
                    ` : ''}
                    
                    ${novaGroup > 0 ? `
                        <div class="absolute top-2 right-2 bg-${this.getNovaColor(novaGroup)}-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" title="NOVA ${novaGroup}">
                            ${novaGroup}
                        </div>
                    ` : ''}
                </div>
                
                <div class="p-4">
                    <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${product.brands || 'Unknown Brand'}</p>
                    <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        ${product.product_name || 'Unknown Product'}
                    </h3>
                    
                    <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        ${quantity ? `<span><i class="fa-solid fa-weight-scale mr-1"></i>${quantity}</span>` : ''}
                        <span><i class="fa-solid fa-fire mr-1"></i>${Math.round(calories)} kcal/100g</span>
                    </div>
                    
                    <div class="grid grid-cols-4 gap-1 text-center">
                        <div class="bg-emerald-50 rounded p-1.5">
                            <p class="text-xs font-bold text-emerald-700">${protein.toFixed(1)}g</p>
                            <p class="text-[10px] text-gray-500">Protein</p>
                        </div>
                        <div class="bg-blue-50 rounded p-1.5">
                            <p class="text-xs font-bold text-blue-700">${carbs.toFixed(1)}g</p>
                            <p class="text-[10px] text-gray-500">Carbs</p>
                        </div>
                        <div class="bg-purple-50 rounded p-1.5">
                            <p class="text-xs font-bold text-purple-700">${fat.toFixed(1)}g</p>
                            <p class="text-[10px] text-gray-500">Fat</p>
                        </div>
                        <div class="bg-orange-50 rounded p-1.5">
                            <p class="text-xs font-bold text-orange-700">${sugar.toFixed(1)}g</p>
                            <p class="text-[10px] text-gray-500">Sugar</p>
                        </div>
                    </div>
                </div>
            </div>
          `;
        } catch(err) {
          console.error('Error rendering individual product:', err);
          return '';
        }
      }).join('');

      container.innerHTML = htmlContent;

      if (countElement) {
        countElement.textContent = `Found ${products.length} product${products.length !== 1 ? 's' : ''}`;
      }
    } catch (error) {
      console.error('Error in renderProducts:', error);
      container.innerHTML = `
        <div class="text-center py-10">
            <p class="text-red-500">Something went wrong while displaying products.</p>
            <p class="text-gray-400 text-sm">${error.message}</p>
        </div>
      `;
    }
  }


  getNutriScoreColor(grade) {
    if(!grade) return 'gray';
    const colors = {
      'A': 'green',
      'B': 'lime',
      'C': 'yellow',
      'D': 'orange',
      'E': 'red'
    };
    return colors[grade] || 'gray';
  }


  getNovaColor(group) {
    if(!group) return 'gray';
    const colors = {
      1: 'green',
      2: 'lime',
      3: 'orange',
      4: 'red'
    };
    return colors[group] || 'gray';
  }


  showLoading() {
    const container = document.getElementById('products-grid');
    if (container) {
      container.innerHTML = this.LoadingSpinner;
    }
  }
}

class FoodLogRenderer {
  constructor() {
    this.DAILY_GOALS = {
      calories: 2000,
      protein: 50,
      carbs: 250,
      fat: 65
    };
  }

  calculateProgress(current, goal) {
    if (goal === 0) return 0;
    const percentage = (current / goal) * 100;
    return percentage > 100 ? 100 : percentage;
  }

  formatDate(date) {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  renderTodaySummary(totals) {
    this.updateProgressBar('calories', totals.calories, this.DAILY_GOALS.calories, 'kcal');
    this.updateProgressBar('protein', totals.protein, this.DAILY_GOALS.protein, 'g');
    this.updateProgressBar('carbs', totals.carbs, this.DAILY_GOALS.carbs, 'g');
    this.updateProgressBar('fat', totals.fat, this.DAILY_GOALS.fat, 'g');
  }

  updateProgressBar(nutrient, current, goal, unit) {
    const cardId = 'card-' + nutrient;
    const card = document.getElementById(cardId);
    if (!card) return;

    const percentage = this.calculateProgress(current, goal);
    const percentageEl = card.querySelector('.percentage');
    const progressBar = card.querySelector('.bar');
    const valueEl = card.querySelector('.value');
    const goalEl = card.querySelector('.goal');

    if (percentageEl) {
      percentageEl.textContent = Math.round(percentage) + '%';
    }
    if (valueEl) {
      valueEl.textContent = Math.round(current) + ' ' + unit;
    }
    if (goalEl) {
      goalEl.textContent = '/ ' + goal + ' ' + unit;
    }

    if (progressBar) {
      let barWidth = percentage;
      if(barWidth > 100) {
        barWidth = 100;
      }
      progressBar.style.width = barWidth + '%';
      
      const color = this.getNutrientColor(nutrient);
      const colorClass = 'bg-' + color + '-500';
      
      if (current > goal) {
        progressBar.classList.remove(colorClass);
        progressBar.classList.add('bg-red-500');
      } else {
        progressBar.classList.add(colorClass);
        progressBar.classList.remove('bg-red-500');
      }
    }
  }

  getNutrientColor(nutrient) {
    if(nutrient === 'calories') {
      return 'emerald';
    } else if(nutrient === 'protein') {
      return 'blue';
    } else if(nutrient === 'carbs') {
      return 'amber';
    } else if(nutrient === 'fat') {
      return 'purple';
    } else {
      return 'gray';
    }
  }

  renderLoggedItems(items) {
    const container = document.getElementById('logged-items-list');
    const countElement = document.getElementById('logged-items-count');
    const clearButton = document.getElementById('clear-foodlog');

    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fa-solid fa-utensils text-3xl text-gray-300"></i>
            </div>
            <p class="text-gray-500 font-medium mb-2">No food logged today</p>
            <p class="text-gray-400 text-sm mb-4">Start tracking your nutrition by logging meals or scanning products</p>
            <div class="flex justify-center gap-3">
                <a href="#meals" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all">
                    <i class="fa-solid fa-plus"></i>
                    Browse Recipes
                </a>
                <a href="#products" class="nav-link inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                    <i class="fa-solid fa-barcode"></i>
                    Scan Product
                </a>
            </div>
        </div>
      `;
      
      if (clearButton) clearButton.style.display = 'none';
      if (countElement) countElement.textContent = 'Logged Items (0)';
      return;
    }

    let itemsHtml = '';
    for(let i = 0; i < items.length; i++) {
      const item = items[i];
      
      let image = item.image;
      if(!image) {
        image = 'https://via.placeholder.com/60';
      }
      
      let itemType = 'Product';
      if(item.type === 'meal') {
        itemType = 'Meal';
      }
      
      let servingsText = '100g';
      if(item.servings) {
        servingsText = item.servings + ' serving';
        if(item.servings !== 1) {
          servingsText = servingsText + 's';
        }
      }
      
      let perServingHtml = '';
      if(item.perServingCalories) {
        perServingHtml = '<p class="text-xs text-gray-400 mt-0.5">' + Math.round(item.perServingCalories) + ' cal/serving</p>';
      }
      
      itemsHtml += '<div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">';
      itemsHtml += '<img src="' + image + '" alt="' + item.name + '" class="w-14 h-14 rounded-lg object-cover" onerror="this.src=\'https://via.placeholder.com/60\'" />';
      itemsHtml += '<div class="flex-1">';
      itemsHtml += '<h4 class="font-semibold text-gray-900">' + item.name + '</h4>';
      itemsHtml += '<p class="text-xs text-gray-500 mt-0.5">' + itemType + ' • ' + servingsText + ' • ' + Math.round(item.protein) + 'g protein</p>';
      itemsHtml += perServingHtml;
      itemsHtml += '</div>';
      itemsHtml += '<div class="text-right">';
      itemsHtml += '<p class="text-sm font-bold text-emerald-600">' + Math.round(item.calories) + ' cal</p>';
      itemsHtml += '<button class="remove-item-btn text-xs text-red-500 hover:text-red-700 mt-1" data-item-id="' + item.id + '" data-item-name="' + item.name + '" data-item-calories="' + Math.round(item.calories) + '">';
      itemsHtml += '<i class="fa-solid fa-trash mr-1"></i>Remove';
      itemsHtml += '</button>';
      itemsHtml += '</div>';
      itemsHtml += '</div>';
    }
    
    container.innerHTML = itemsHtml;

    if (clearButton) {
      if(items.length > 0) {
        clearButton.style.display = 'block';
      } else {
        clearButton.style.display = 'none';
      }
    }
    if (countElement) {
      countElement.textContent = 'Logged Items (' + items.length + ')';
    }
  }

  renderWeeklyChart(weeklyData) {
    this.renderWeeklyGrid(weeklyData);
    this.renderSummaryStats(weeklyData);
  }

  renderWeeklyGrid(weeklyData) {
    const grid = document.getElementById('weekly-grid');
    if (!grid) return;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().toDateString();

    let gridHtml = '';
    for(let i = 0; i < weeklyData.length; i++) {
      const dayData = weeklyData[i];
      const date = new Date(dayData.date);
      const isToday = date.toDateString() === today;
      const dayName = days[date.getDay()];
      const dayNum = date.getDate();
      const kcal = Math.round(dayData.calories);

      let containerClass = 'text-center p-2';
      if(isToday) {
        containerClass = 'text-center bg-indigo-100 rounded-xl p-2';
      }
      
      let caloriesColor = 'text-gray-300';
      if(kcal > 0) {
        caloriesColor = 'text-emerald-600';
      }

      gridHtml += '<div class="' + containerClass + '">';
      gridHtml += '<p class="text-xs text-gray-500 mb-1">' + dayName + '</p>';
      gridHtml += '<p class="text-sm font-medium text-gray-900">' + dayNum + '</p>';
      gridHtml += '<div class="mt-2 ' + caloriesColor + '">';
      gridHtml += '<p class="text-lg font-bold">' + kcal + '</p>';
      gridHtml += '<p class="text-xs">kcal</p>';
      gridHtml += '</div>';
      gridHtml += '</div>';
    }
    
    grid.innerHTML = gridHtml;
  }

  renderSummaryStats(weeklyData) {
    const avgEl = document.getElementById('stat-weekly-avg');
    const totalItemsEl = document.getElementById('stat-total-items');
    const daysOnGoalEl = document.getElementById('stat-days-on-goal');

    let totalCalories = 0;
    for(let i = 0; i < weeklyData.length; i++) {
      totalCalories += weeklyData[i].calories;
    }
    
    let avgCalories = 0;
    if(weeklyData.length > 0) {
      avgCalories = totalCalories / weeklyData.length;
    }
    
    let totalItems = 0;
    for(let i = 0; i < weeklyData.length; i++) {
      const itemsCount = weeklyData[i].itemsCount;
      if(itemsCount) {
        totalItems += itemsCount;
      }
    }
    
    let daysOnGoal = 0;
    for(let i = 0; i < weeklyData.length; i++) {
      const dayCals = weeklyData[i].calories;
      if(dayCals > 0 && dayCals <= this.DAILY_GOALS.calories) {
        daysOnGoal++;
      }
    }

    if (avgEl) {
      avgEl.textContent = Math.round(avgCalories) + ' kcal';
    }
    if (totalItemsEl) {
      totalItemsEl.textContent = totalItems + ' items';
    }
    if (daysOnGoalEl) {
      daysOnGoalEl.textContent = daysOnGoal + ' / 7';
    }
  }

  updateDate() {
    const dateElement = document.getElementById('foodlog-header-date');
    if (dateElement) {
      dateElement.textContent = this.formatDate(new Date());
    }
  }
}

const MealRendererInstance = new MealRenderer();
const ProductRendererInstance = new ProductRenderer();
const FoodLogRendererInstance = new FoodLogRenderer();

export { MealRendererInstance as MealRenderer, ProductRendererInstance as ProductRenderer, FoodLogRendererInstance as FoodLogRenderer };
