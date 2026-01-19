class UIRenderer {
  constructor() {
    this.CATEGORY_ICONS = {
      'Beef': 'fa-drumstick-bite', 'Chicken': 'fa-drumstick-bite', 'Dessert': 'fa-cake-candles',
      'Lamb': 'fa-drumstick-bite', 'Miscellaneous': 'fa-bowl-rice', 'Pasta': 'fa-bowl-food',
      'Pork': 'fa-bacon', 'Seafood': 'fa-fish', 'Side': 'fa-plate-wheat', 'Starter': 'fa-utensils',
      'Vegan': 'fa-leaf', 'Vegetarian': 'fa-seedling', 'Breakfast': 'fa-mug-hot', 'Goat': 'fa-drumstick-bite'
    };
    this.categoryColors = {
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
    this.loadingSpinner = `<div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>`;
  }

  showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = this.loadingSpinner;
  }

  hidePageLoading() {
    const overlay = document.getElementById('app-loading-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  renderCategories(categories) {
    const container = document.getElementById('categories-grid');
    if (!container) return;
    const defaultColors = { bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200 hover:border-emerald-400', icon: 'from-emerald-400 to-green-500' };
    container.innerHTML = categories.slice(0, 12).map(cat => {
      const colors = this.categoryColors[cat.strCategory] || defaultColors;
      const icon = this.CATEGORY_ICONS[cat.strCategory] || 'fa-utensils';
      return `<div class="category-card bg-gradient-to-br ${colors.bg} rounded-xl p-3 border ${colors.border} hover:shadow-md cursor-pointer transition-all group" data-category="${cat.strCategory}"><div class="flex items-center gap-2.5"><div class="text-white w-9 h-9 bg-gradient-to-br ${colors.icon} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"><i class="fa-solid ${icon} text-sm"></i></div><div><h3 class="text-sm font-bold text-gray-900">${cat.strCategory}</h3></div></div></div>`;
    }).join('');
  }

  renderAreaFilters(areas) {
    const container = document.querySelector('#search-filters-section .flex.items-center.gap-3');
    if (!container) return;
    const allBtn = `<button class="area-filter-all px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all">All Cuisines</button>`;
    const areaBtns = areas.slice(0, 8).map(area => `<button class="area-filter px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all" data-area="${area.strArea}">${area.strArea}</button>`).join('');
    container.innerHTML = allBtn + areaBtns;
  }

  renderMeals(meals, viewMode = 'grid') {
    const container = document.getElementById('recipes-grid');
    const countEl = document.getElementById('recipes-count');
    if (!container) return;
    if (!meals || meals.length === 0) {
      container.innerHTML = `<div class="flex flex-col items-center justify-center py-12 text-center w-full"><div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><i class="fa-solid fa-utensils text-gray-400 text-2xl"></i></div><p class="text-gray-500 text-lg">No recipes found</p></div>`;
      if (countEl) countEl.textContent = 'No recipes found';
      return;
    }
    const html = meals.slice(0, 25).map(meal => {
      if (viewMode === 'list') {
        return `<div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-row h-40" data-meal-id="${meal.idMeal}"><div class="relative overflow-hidden w-48 h-full"><img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy" /></div><div class="p-4 flex-1"><h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${meal.strMeal}</h3><p class="text-xs text-gray-600 mb-3 line-clamp-2">${meal.strInstructions || 'Delicious recipe to try!'}</p><div class="flex items-center justify-between text-xs"><span class="font-semibold text-gray-900"><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${meal.strCategory || 'Food'}</span><span class="font-semibold text-gray-500"><i class="fa-solid fa-globe text-blue-500 mr-1"></i>${meal.strArea || ''}</span></div></div></div>`;
      }
      return `<div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-meal-id="${meal.idMeal}"><div class="relative h-48 overflow-hidden"><img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy" /><div class="absolute bottom-3 left-3 flex gap-2"><span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">${meal.strCategory || 'Food'}</span><span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">${meal.strArea || ''}</span></div></div><div class="p-4"><h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${meal.strMeal}</h3><p class="text-xs text-gray-600 mb-3 line-clamp-2">Delicious recipe to try!</p><div class="flex items-center justify-between text-xs"><span class="font-semibold text-gray-900"><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${meal.strCategory || 'Food'}</span><span class="font-semibold text-gray-500"><i class="fa-solid fa-globe text-blue-500 mr-1"></i>${meal.strArea || ''}</span></div></div></div>`;
    }).join('');
    container.className = viewMode === 'list' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'grid grid-cols-2 lg:grid-cols-4 gap-5';
    container.innerHTML = html;
    if (countEl) countEl.textContent = `Showing ${meals.length} recipes`;
  }

  renderMealDetails(meal, nutrition) {
    const container = document.getElementById('meal-details');
    if (!container) return;
    container.querySelector('.relative.h-80 img').src = meal.strMealThumb;
    container.querySelector('h1').textContent = meal.strMeal;
    document.getElementById('hero-servings').textContent = `${nutrition.servings} servings`;
    document.getElementById('hero-calories').textContent = `${Math.round(nutrition.calories.perServing)} cal/serving`;
    const tags = container.querySelector('.flex.items-center.gap-3.mb-3');
    tags.innerHTML = `<span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${meal.strCategory}</span><span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.strArea}</span>`;
    const ingEl = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.gap-3');
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) ingredients.push({ name: meal[`strIngredient${i}`], measure: meal[`strMeasure${i}`] });
    }
    ingEl.innerHTML = ingredients.map(ing => `<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors"><input type="checkbox" class="w-5 h-5 text-emerald-600 rounded border-gray-300" /><span class="text-gray-700"><span class="font-medium text-gray-900">${ing.measure || ''}</span> ${ing.name}</span></div>`).join('');
    container.querySelector('h2 span').textContent = `${ingredients.length} items`;
    const instEl = container.querySelector('.space-y-4');
    instEl.innerHTML = (meal.strInstructions || '').split(/\r\n|\n/).filter(s => s.trim().length > 0).map((step, i) => `<div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"><div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${i + 1}</div><p class="text-gray-700 leading-relaxed pt-2">${step}</p></div>`).join('');
    const ytId = (meal.strYoutube || '').match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (ytId) container.querySelector('iframe').src = `https://www.youtube.com/embed/${ytId[1]}`;
    this.renderNutritionFacts(nutrition);
    const logBtn = document.getElementById('log-meal-btn');
    if (logBtn) {
        logBtn.disabled = false;
        logBtn.className = 'flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all';
        logBtn.innerHTML = `<i class="fa-solid fa-clipboard-list"></i><span>Log This Meal</span>`;
    }
  }

  renderNutritionFacts(n) {
    const container = document.getElementById('nutrition-facts-container');
    if (!container) return;
    const renderBar = (label, val, color, dv) => `<div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-${color}-500"></div><span class="text-gray-700">${label}</span></div><span class="font-bold text-gray-900">${Math.round(val)}g</span></div><div class="w-full bg-gray-100 rounded-full h-2 mb-4"><div class="bg-${color}-500 h-2 rounded-full" style="width: ${Math.min(dv, 100)}%"></div></div>`;
    container.innerHTML = `<p class="text-sm text-gray-500 mb-4">Per serving</p><div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl"><p class="text-sm text-gray-600">Calories per serving</p><p class="text-4xl font-bold text-emerald-600">${Math.round(n.calories.perServing)}</p><p class="text-xs text-gray-500 mt-1">Total: ${Math.round(n.calories.total)} cal</p></div><div class="space-y-4">${renderBar('Protein', n.macros.protein.amount, 'emerald', n.macros.protein.dailyValue)}${renderBar('Carbs', n.macros.carbs.amount, 'blue', n.macros.carbs.dailyValue)}${renderBar('Fat', n.macros.fat.amount, 'purple', n.macros.fat.dailyValue)}${renderBar('Fiber', n.macros.fiber.amount, 'orange', n.macros.fiber.dailyValue)}${renderBar('Sugar', n.macros.sugar.amount, 'pink', n.macros.sugar.dailyValue)}</div>`;
  }

  showLogMealModal(meal, nutrition) {
    const modal = document.getElementById('log-meal-modal');
    if (!modal) return;
    document.getElementById('modal-meal-image').src = meal.strMealThumb;
    document.getElementById('modal-meal-name').textContent = meal.strMeal;
    document.getElementById('meal-servings').value = 1;
    this.updateModalNutrition(nutrition, 1);
    modal.classList.remove('hidden');
  }

  updateModalNutrition(n, servings) {
    document.getElementById('modal-calories').textContent = Math.round(n.calories.perServing * servings);
    document.getElementById('modal-protein').textContent = Math.round(n.macros.protein.amount * servings) + 'g';
    document.getElementById('modal-carbs').textContent = Math.round(n.macros.carbs.amount * servings) + 'g';
    document.getElementById('modal-fat').textContent = Math.round(n.macros.fat.amount * servings) + 'g';
  }

  renderProducts(products) {
    const container = document.getElementById('products-grid');
    const countEl = document.getElementById('products-count');
    if (!container) return;
    if (!products || products.length === 0) {
      container.className = "flex flex-col items-center justify-center py-20 text-center w-full";
      container.innerHTML = `<div class="text-center"><div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><i class="fa-solid fa-box-open text-3xl text-gray-400"></i></div><p class="text-gray-500 text-lg mb-2">No products to display</p><p class="text-gray-400 text-sm">Search for a product or browse by category</p></div>`;
      if (countEl) countEl.textContent = 'Search for products';
      return;
    }
    container.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5";
    container.innerHTML = products.map(p => {
      const g = (p.nutrition_grades || '').toUpperCase();
      const n = p.nutriments || {};
      const cal = n['energy-kcal_100g'] || 0;
      return `<div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-barcode="${p.code}"><div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden"><img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" src="${p.image_url || p.image_front_url || ''}" alt="${p.product_name}" loading="lazy" onerror="this.src='https://via.placeholder.com/200'">${g ? `<div class="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">Nutri-Score ${g}</div>` : ''}</div><div class="p-4"><p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${p.brands || ''}</p><h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">${p.product_name || ''}</h3><div class="flex items-center gap-3 text-xs text-gray-500 mb-3"><span><i class="fa-solid fa-fire mr-1"></i>${Math.round(cal)} kcal/100g</span></div><div class="grid grid-cols-4 gap-1 text-center"><div class="bg-emerald-50 rounded p-1.5"><p class="text-xs font-bold text-emerald-700">${(n.proteins_100g || 0).toFixed(1)}g</p><p class="text-[10px]">Protein</p></div><div class="bg-blue-50 rounded p-1.5"><p class="text-xs font-bold text-blue-700">${(n.carbohydrates_100g || 0).toFixed(1)}g</p><p class="text-[10px]">Carbs</p></div><div class="bg-purple-50 rounded p-1.5"><p class="text-xs font-bold text-purple-700">${(n.fat_100g || 0).toFixed(1)}g</p><p class="text-[10px]">Fat</p></div><div class="bg-orange-50 rounded p-1.5"><p class="text-xs font-bold text-orange-700">${(n.sugars_100g || 0).toFixed(1)}g</p><p class="text-[10px]">Sugar</p></div></div></div></div>`;
    }).join('');
    if (countEl) countEl.textContent = `Found ${products.length} products`;
  }

  showProductDetailModal(p) {
    const modal = document.getElementById('product-detail-modal');
    if (!modal) return;
    const n = p.nutriments || {};
    document.getElementById('modal-product-image').src = p.image_url || p.image_front_url || 'https://via.placeholder.com/200';
    document.getElementById('modal-product-brand').textContent = p.brands || 'Unknown Brand';
    document.getElementById('modal-product-name').textContent = p.product_name || 'Unknown Product';
    document.getElementById('modal-product-quantity').textContent = p.quantity || '';
    document.getElementById('modal-calories').textContent = Math.round(n['energy-kcal_100g'] || 0);
    document.getElementById('modal-protein').textContent = (n.proteins_100g || 0).toFixed(1) + 'g';
    document.getElementById('modal-carbs').textContent = (n.carbohydrates_100g || 0).toFixed(1) + 'g';
    document.getElementById('modal-fat').textContent = (n.fat_100g || 0).toFixed(1) + 'g';
    document.getElementById('modal-sugar').textContent = (n.sugars_100g || 0).toFixed(1) + 'g';
    document.getElementById('modal-sat-fat').textContent = (n['saturated-fat_100g'] || 0).toFixed(1) + 'g';
    document.getElementById('modal-fiber').textContent = (n.fiber_100g || 0).toFixed(1) + 'g';
    document.getElementById('modal-salt').textContent = (n.salt_100g || 0).toFixed(1) + 'g';
    document.getElementById('modal-ingredients').textContent = p.ingredients_text || 'No ingredients information available.';
    modal.classList.remove('hidden');
  }

  renderFoodLog(log, weeklyData, stats) {
    const container = document.getElementById('logged-items-list');
    if (!container) return;
    const renderTotal = (id, val, goal, u) => {
        const el = document.getElementById(`card-${id}`);
        if (!el) return;
        el.querySelector('.value').textContent = `${Math.round(val)} ${u}`;
        el.querySelector('.percentage').textContent = `${Math.round((val / goal) * 100)}%`;
        el.querySelector('.bar').style.width = `${Math.min((val / goal) * 100, 100)}%`;
    };
    renderTotal('calories', log.totals.calories, 2000, 'kcal');
    renderTotal('protein', log.totals.protein, 50, 'g');
    renderTotal('carbs', log.totals.carbs, 250, 'g');
    renderTotal('fat', log.totals.fat, 65, 'g');
    if (!log.items || log.items.length === 0) {
      container.innerHTML = `<div class="py-12 text-center text-gray-400">No items logged today</div>`;
      document.getElementById('clear-foodlog').style.display = 'none';
    } else {
      container.innerHTML = log.items.map(item => `
        <div class="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm group">
          <img src="${item.image}" class="w-12 h-12 rounded-lg object-cover">
          <div class="flex-1">
            <h4 class="font-bold text-gray-900">${item.name}</h4>
            <p class="text-xs text-gray-500">${item.servings} serving(s)</p>
          </div>
          <div class="text-right flex items-center gap-4">
            <div>
              <p class="font-bold text-gray-900">${item.calories} kcal</p>
              <p class="text-xs text-emerald-600">${item.protein}g protein</p>
            </div>
            <button class="remove-log-item text-gray-400 hover:text-red-500 transition-colors" data-timestamp="${item.timestamp}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `).join('');
      document.getElementById('clear-foodlog').style.display = 'block';
    }
    document.getElementById('foodlog-date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    document.getElementById('stat-weekly-avg').textContent = `${stats.weeklyAvg} kcal`;
    document.getElementById('stat-total-items').textContent = `${stats.totalItems} items`;
    document.getElementById('stat-days-on-goal').textContent = stats.daysOnGoal;
    this.renderChart(weeklyData);
  }

  renderChart(data) {
    const el = document.getElementById('weekly-chart');
    if (el && typeof Plotly !== 'undefined') {
        const trace = { x: data.map(d => d.day), y: data.map(d => d.calories), type: 'bar', marker: { color: '#10b981' } };
        Plotly.newPlot(el, [trace], { margin: { t: 10, b: 40, l: 40, r: 10 }, height: 250, xaxis: { fixedrange: true }, yaxis: { fixedrange: true } }, { responsive: true, displayModeBar: false });
    }
    const grid = document.getElementById('weekly-grid');
    if (grid) {
        grid.innerHTML = data.map(d => `<div class="flex flex-col items-center"><div class="w-full bg-gray-100 rounded-lg overflow-hidden h-24 flex flex-col justify-end"><div class="bg-emerald-500 w-full" style="height: ${Math.min((d.calories / 2000) * 100, 100)}%"></div></div><p class="text-[10px] text-gray-500 mt-2 lowercase">${d.day}</p></div>`).join('');
    }
  }
}

export default new UIRenderer();
