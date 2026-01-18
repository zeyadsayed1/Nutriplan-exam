import MealService from './services/MealService.js';
import ProductService from './services/ProductService.js';
import NutritionService from './services/NutritionService.js';
import FoodLogManager from './services/FoodLogManager.js';
import { MealRenderer, ProductRenderer, FoodLogRenderer } from './View.js';

class App {
  constructor() {
    this.currentMeals = [];
    this.allMeals = [];
    this.currentMeal = null;
    this.categories = [];
    this.areas = [];
    this.currentNutrition = null;
    this.currentFilter = { type: null, value: null };
    this.productFilters = {
      query: '',
      category: '',
      grade: ''
    };
    this.currentPage = '';
    this.routes = {
      '': 'home',
      'home': 'home',
      'products': 'products',
      'foodlog': 'foodlog',
      'meal': 'meal-details'
    };
  }

  async init() {
    const self = this;
    
    window.addEventListener('hashchange', function() {
      self.handleRoute();
    });
    
    this.handleRoute();

    this.setupEventListeners();

    await this.loadInitialData();

    this.hideLoadingOverlay();
  }

  handleRoute() {
    const hash = window.location.hash.slice(1);
    const parts = hash.split('/');
    const page = parts[0];
    const params = parts.slice(1);
    
    let route = this.routes[page];
    if(!route) {
      route = this.routes[''];
    }
    
    this.showPage(route);
    this.handleRouteChange(route, params);
  }

  async handleRouteChange(page, params) {
    if (page === 'home') {
      if (this.currentMeals.length === 0) {
        await this.loadInitialData();
      }
    } else if (page === 'meal-details') {
      if (params[0]) {
        await this.loadMealDetails(params[0]);
      }
    } else if (page === 'foodlog') {
      this.loadFoodLog();
    } else if (page === 'products') {
      
    }
  }

  navigate(page, params) {
    if (!params) {
      params = [];
    }
    let hash = page;
    if(params.length > 0) {
      hash = page + '/' + params.join('/');
    }
    window.location.hash = hash;
  }

  showPage(pageName) {
    this.currentPage = pageName;

    const searchFilters = document.getElementById('search-filters-section');
    const mealCategories = document.getElementById('meal-categories-section');
    const allRecipes = document.getElementById('all-recipes-section');
    const mealDetails = document.getElementById('meal-details');
    const products = document.getElementById('products-section');
    const foodlog = document.getElementById('foodlog-section');

    if(searchFilters) searchFilters.style.display = 'none';
    if(mealCategories) mealCategories.style.display = 'none';
    if(allRecipes) allRecipes.style.display = 'none';
    if(mealDetails) mealDetails.style.display = 'none';
    if(products) products.style.display = 'none';
    if(foodlog) foodlog.style.display = 'none';

    const headerTitle = document.querySelector('#header h1');
    const headerDesc = document.querySelector('#header p');

    if (pageName === 'home') {
      if(searchFilters) searchFilters.style.display = '';
      if(mealCategories) mealCategories.style.display = '';
      if(allRecipes) allRecipes.style.display = '';
      if (headerTitle) headerTitle.textContent = 'Meals & Recipes';
      if (headerDesc) headerDesc.textContent = 'Discover delicious and nutritious recipes tailored for you';
      this.updateNavActive(0);
    }
    else if(pageName === 'meal-details') {
      if(mealDetails) mealDetails.style.display = '';
      if (headerTitle) headerTitle.textContent = 'Meal Details';
      if (headerDesc) headerDesc.textContent = 'View complete recipe information and nutrition';
    }
    else if(pageName === 'products') {
      if(products) products.style.display = '';
      if (headerTitle) headerTitle.textContent = 'Product Scanner';
      if (headerDesc) headerDesc.textContent = 'Search for packaged food products';
      this.updateNavActive(1);
    }
    else if(pageName === 'foodlog') {
      if(foodlog) foodlog.style.display = '';
      if (headerTitle) headerTitle.textContent = 'Food Log';
      if (headerDesc) headerDesc.textContent = 'Track your daily nutrition';
      this.updateNavActive(2);
    }
  }

  updateNavActive(index) {
    const navLinks = document.querySelectorAll('.nav-link');
    for(let i = 0; i < navLinks.length; i++) {
      if (i === index) {
        navLinks[i].className = 'nav-link flex items-center gap-3 px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg transition-all';
      } else {
        navLinks[i].className = 'nav-link flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all';
      }
    }
  }

  async loadInitialData() {
    try {
      const categories = await MealService.getCategories();
      const areas = await MealService.getAreas();

      this.categories = categories;
      this.areas = areas;

      MealRenderer.renderCategories(categories);
      MealRenderer.renderAreaFilters(areas);

      await this.loadRandomMeals();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }

  async loadRandomMeals() {
    MealRenderer.showLoading('recipes-grid');
    const meals = await MealService.getRandomMeals(25);
    this.currentMeals = meals;
    this.allMeals = meals;
    MealRenderer.renderMeals(meals, 25, this.viewMode);
  }

  async loadMealDetails(mealId) {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      const nutritionContainer = document.getElementById('nutrition-facts-container');
      if (nutritionContainer) {
        nutritionContainer.innerHTML = '<div class="text-center py-8"><div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4"><i class="fa-solid fa-calculator animate-pulse text-emerald-600 text-xl"></i></div><p class="text-gray-700 font-medium mb-1">Calculating Nutrition</p><p class="text-sm text-gray-500">Analyzing ingredients...</p><div class="mt-4 flex justify-center"><div class="flex space-x-1"><div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div><div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div><div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div></div></div></div>';
      }
      
      const logBtn = document.getElementById('log-meal-btn');
      if (logBtn) {
        logBtn.disabled = true;
        logBtn.className = 'flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed transition-all';
        logBtn.title = 'Waiting for nutrition data...';
        logBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Calculating...</span>';
      }
      
      const meal = await MealService.getMealById(mealId);
      if (!meal) {
        return;
      }

      this.currentMeal = meal;
      const nutrition = await NutritionService.getMealNutrition(mealId);
      this.currentNutrition = nutrition;
      MealRenderer.renderMealDetails(meal, nutrition);
    } catch (error) {
      console.error('Error loading meal details:', error);
    }
  }

  loadFoodLog() {
    const todayLog = FoodLogManager.getTodayLog();
    const weeklyData = FoodLogManager.getWeeklyData();

    FoodLogRenderer.updateDate();
    FoodLogRenderer.renderTodaySummary(todayLog.totals);
    FoodLogRenderer.renderLoggedItems(todayLog.items);
    FoodLogRenderer.renderWeeklyChart(weeklyData);
  }

  setupEventListeners() {
    this.setupSidebarNav();
    this.setupMobileMenu();
    this.setupViewToggle();
    this.setupSearch();
    this.setupCategoryFilters();
    this.setupAreaFilters();
    this.setupMealCardClicks();
    this.setupBackButton();
    this.setupLogMealButton();
    this.setupProductSearch();
    this.setupProductNutriScoreFilters();
    this.setupProductCategoryFilters();
    this.setupProductCardClicks();
    this.setupFoodLogActions();
  }

  setupSidebarNav() {
    const self = this;
    const navLinks = document.querySelectorAll('.nav-link');
    for(let i = 0; i < navLinks.length; i++) {
      const link = navLinks[i];
      const index = i;
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const pages = ['home', 'products', 'foodlog'];
        self.navigate(pages[index]);
      });
    }
  }

  setupMobileMenu() {
    const menuBtn = document.getElementById('header-menu-btn');
    const closeBtn = document.getElementById('sidebar-close-btn');
    const overlay = document.getElementById('sidebar-overlay');
    const sidebar = document.getElementById('sidebar');

    const openSidebar = function() {
      if(sidebar) sidebar.classList.add('mobile-open');
      if(overlay) overlay.classList.add('active');
    };

    const closeSidebar = function() {
      if(sidebar) sidebar.classList.remove('mobile-open');
      if(overlay) overlay.classList.remove('active');
    };

    if(menuBtn) menuBtn.addEventListener('click', openSidebar);
    if(closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if(overlay) overlay.addEventListener('click', closeSidebar);
  }

  setupViewToggle() {
    const gridBtn = document.getElementById('grid-view-btn');
    const listBtn = document.getElementById('list-view-btn');

    if (!gridBtn || !listBtn) return;

    const self = this;
    
    gridBtn.addEventListener('click', function() {
      self.viewMode = 'grid';
      gridBtn.className = 'px-3 py-1.5 bg-white rounded-md shadow-sm';
      gridBtn.querySelector('i').className = 'text-gray-700';
      listBtn.className = 'px-3 py-1.5';
      listBtn.querySelector('i').className = 'text-gray-500';
      MealRenderer.renderMeals(self.currentMeals, 25, 'grid');
    });

    listBtn.addEventListener('click', function() {
      self.viewMode = 'list';
      listBtn.className = 'px-3 py-1.5 bg-white rounded-md shadow-sm';
      listBtn.querySelector('i').className = 'text-gray-700';
      gridBtn.className = 'px-3 py-1.5';
      gridBtn.querySelector('i').className = 'text-gray-500';
      MealRenderer.renderMeals(self.currentMeals, 25, 'list');
    });
  }

  debounce(func, delay) {
    let timeoutId;
    const self = this;
    return function() {
      const args = arguments;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function() {
        func.apply(self, args);
      }, delay);
    };
  }

  setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    const self = this;
    const debouncedSearch = self.debounce(async function(query) {
      if (!query.trim()) {
        MealRenderer.renderMeals(self.allMeals);
        return;
      }

      MealRenderer.showLoading('recipes-grid');
      const meals = await MealService.searchMeals(query);
      self.currentMeals = meals || [];
      MealRenderer.renderMeals(self.currentMeals, 25, self.viewMode);
    }, 500);

    searchInput.addEventListener('input', function(e) {
      debouncedSearch(e.target.value);
    });
  }

  setupCategoryFilters() {
    const self = this;
    document.addEventListener('click', async function(e) {
      const categoryCard = e.target.closest('.category-card');
      if (!categoryCard) return;

      const category = categoryCard.dataset.category;
      
      MealRenderer.showLoading('recipes-grid');
      const meals = await MealService.filterByCategory(category);
      self.currentMeals = meals || [];
      MealRenderer.renderMeals(self.currentMeals, 25, self.viewMode);

      self.updateFilterButtons('category', category);
    });
  }

  setupAreaFilters() {
    const self = this;
    document.addEventListener('click', async function(e) {
      const areaBtn = e.target.closest('.area-filter');
      if (!areaBtn) return;

      const area = areaBtn.dataset.area;
      
      MealRenderer.showLoading('recipes-grid');
      const meals = await MealService.filterByArea(area);
      self.currentMeals = meals || [];
      MealRenderer.renderMeals(self.currentMeals, 25, self.viewMode);

      self.updateFilterButtons('area', area);
    });

    const allBtn = document.querySelector('#search-filters-section button:first-child');
    if(allBtn) {
      allBtn.addEventListener('click', async function() {
        await self.loadRandomMeals();
        self.updateFilterButtons('all', null);
      });
    }
  }

  updateFilterButtons(type, value) {
    const areaButtons = document.querySelectorAll('.area-filter');
    for(let i = 0; i < areaButtons.length; i++) {
      const btn = areaButtons[i];
      if (type === 'area' && btn.dataset.area === value) {
        btn.className = 'area-filter px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all';
      } else {
        btn.className = 'area-filter px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all';
      }
    }

    const allBtn = document.querySelector('#search-filters-section button:first-child');
    if (allBtn) {
      if (type === 'all') {
        allBtn.className = 'px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all';
      } else {
        allBtn.className = 'px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all';
      }
    }
  }

  setupMealCardClicks() {
    const self = this;
    document.addEventListener('click', function(e) {
      const mealCard = e.target.closest('.recipe-card');
      if (!mealCard) return;

      const mealId = mealCard.dataset.mealId;
      if (!mealId) return;

      self.navigate('meal', [mealId]);
    });
  }

  setupBackButton() {
    const backBtn = document.getElementById('back-to-meals-btn');
    const self = this;
    if(backBtn) {
      backBtn.addEventListener('click', function() {
        self.navigate('home');
      });
    }
  }

  setupLogMealButton() {
    const modal = document.getElementById('log-meal-modal');
    const modalImage = document.getElementById('modal-meal-image');
    const modalName = document.getElementById('modal-meal-name');
    const servingsInput = document.getElementById('meal-servings');
    const confirmBtn = document.getElementById('confirm-log-meal');
    const cancelBtn = document.getElementById('cancel-log-meal');
    
    let activeMeal = null;
    let activeNutrition = null;

    const self = this;
    
    document.addEventListener('click', function(e) {
      const logBtn = e.target.closest('#log-meal-btn');
      if (!logBtn) return;

      let meal = self.currentMeal;
      if(!meal) {
        meal = {
          idMeal: logBtn.dataset.mealId,
          strMeal: logBtn.dataset.mealName,
          strMealThumb: logBtn.dataset.mealImage
        };
      }

      const nutrition = self.currentNutrition;

      if (!meal.idMeal || !meal.strMeal) {
        return;
      }

      if (!nutrition) {
        return;
      }

      activeMeal = meal;
      activeNutrition = nutrition;

      if (modalImage) modalImage.src = meal.strMealThumb;
      if (modalName) modalName.textContent = meal.strMeal;
      if (servingsInput) servingsInput.value = 1;

      self.updateModalNutrition(nutrition, 1);

      if (modal) {
        modal.classList.remove('hidden');
      }
    });

    const decreaseBtn = document.getElementById('decrease-servings');
    const increaseBtn = document.getElementById('increase-servings');

    if(decreaseBtn) {
      decreaseBtn.addEventListener('click', function() {
        if (!servingsInput || !activeNutrition) return;
        const current = parseFloat(servingsInput.value);
        let newValue = current - 0.5;
        if(newValue < 0.5) {
          newValue = 0.5;
        }
        servingsInput.value = newValue;
        self.updateModalNutrition(activeNutrition, newValue);
      });
    }

    if(increaseBtn) {
      increaseBtn.addEventListener('click', function() {
        if (!servingsInput || !activeNutrition) return;
        const current = parseFloat(servingsInput.value);
        let newValue = current + 0.5;
        if(newValue > 10) {
          newValue = 10;
        }
        servingsInput.value = newValue;
        self.updateModalNutrition(activeNutrition, newValue);
      });
    }

    if(servingsInput) {
      servingsInput.addEventListener('input', function() {
        if (!servingsInput || !activeNutrition) return;
        const value = parseFloat(servingsInput.value);
        if (value > 0 && value <= 10) {
          self.updateModalNutrition(activeNutrition, value);
        }
      });
    }

    if(confirmBtn) {
      confirmBtn.addEventListener('click', async function() {
        if (!activeMeal || !activeNutrition || !servingsInput) {
          return;
        }

        const servings = parseFloat(servingsInput.value);
        const nutritionData = NutritionService.parseForFoodLog(activeNutrition, servings);

        let perServingCalories = 485;
        if(activeNutrition.calories && activeNutrition.calories.perServing) {
          perServingCalories = activeNutrition.calories.perServing;
        }

        const item = {
          type: 'meal',
          sourceId: activeMeal.idMeal,
          name: activeMeal.strMeal,
          image: activeMeal.strMealThumb,
          servings: servings,
          perServingCalories: perServingCalories,
          calories: nutritionData.calories,
          protein: nutritionData.protein,
          carbs: nutritionData.carbs,
          fat: nutritionData.fat,
          fiber: nutritionData.fiber,
          sugar: nutritionData.sugar
        };

        FoodLogManager.addItem(item);

        if(modal) {
          modal.classList.add('hidden');
        }

        if(modal) {
          modal.classList.add('hidden');
        }

        if (typeof Swal !== 'undefined') {
          let servingText = servings + ' serving';
          if(servings !== 1) {
            servingText = servingText + 's';
          }
          
          await Swal.fire({
            title: 'Meal Logged!',
            html: '<div class="text-center"><p class="text-lg font-semibold text-gray-900 mb-2">' + item.name + '</p><p class="text-gray-600">' + servingText + ' added.</p><p class="text-3xl font-bold text-emerald-600 mt-4">+' + item.calories + ' calories</p></div>',
            icon: 'success',
            confirmButtonColor: '#10b981',
            timer: 2000
          });
        } else {
          alert('Logged: ' + item.name + ' (+' + item.calories + ' cal)');
        }
      });
    }

    if(cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        if(modal) {
          modal.classList.add('hidden');
        }
      });
    }

    if(modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    }
  }

  updateModalNutrition(nutrition, servings) {
    if (!nutrition) return;

    const nutritionData = NutritionService.parseForFoodLog(nutrition, servings);

    const modalCalories = document.getElementById('modal-calories');
    const modalProtein = document.getElementById('modal-protein');
    const modalCarbs = document.getElementById('modal-carbs');
    const modalFat = document.getElementById('modal-fat');
    
    if(modalCalories) modalCalories.textContent = nutritionData.calories;
    if(modalProtein) modalProtein.textContent = nutritionData.protein + 'g';
    if(modalCarbs) modalCarbs.textContent = nutritionData.carbs + 'g';
    if(modalFat) modalFat.textContent = nutritionData.fat + 'g';
  }

  setupProductSearch() {
    const searchBtn = document.getElementById('search-product-btn');
    const barcodeBtn = document.getElementById('lookup-barcode-btn');
    const searchInput = document.getElementById('product-search-input');
    const barcodeInput = document.getElementById('barcode-input');

    const self = this;

    if(searchBtn) {
      searchBtn.addEventListener('click', async function() {
        const query = searchInput ? searchInput.value.trim() : '';
        if (!query) return;

        self.productFilters.query = query;
        self.productFilters.category = '';
        self.updateProductCategoriesUI('');

        ProductRenderer.showLoading();
        const products = await ProductService.searchProducts(query, 1, 24, self.productFilters.grade);
        ProductRenderer.renderProducts(products);
      });
    }

    if(barcodeBtn) {
      barcodeBtn.addEventListener('click', async function() {
        const barcode = barcodeInput ? barcodeInput.value.trim() : '';
        if (!barcode) return;

        ProductRenderer.showLoading();
        const product = await ProductService.getProductByBarcode(barcode);
        if(product) {
          ProductRenderer.renderProducts([product]);
        } else {
          ProductRenderer.renderProducts([]);
        }
      });
    }

    if(searchInput) {
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && searchBtn) searchBtn.click();
      });
    }

    if(barcodeInput) {
      barcodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && barcodeBtn) barcodeBtn.click();
      });
    }
  }

  setupProductNutriScoreFilters() {
    const filters = document.querySelectorAll('.nutri-score-filter');
    const self = this;
    
    for(let i = 0; i < filters.length; i++) {
      const btn = filters[i];
      btn.addEventListener('click', async function() {
        const grade = btn.dataset.grade;
        self.productFilters.grade = grade;

        for(let j = 0; j < filters.length; j++) {
          filters[j].className = 'nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-gray-100 text-gray-500 hover:bg-gray-200';
        }
        
        let colorClass = 'bg-emerald-600 text-white';
        if(grade === 'a') {
          colorClass = 'bg-green-500 text-white';
        } else if(grade === 'b') {
          colorClass = 'bg-lime-500 text-white';
        } else if(grade === 'c') {
          colorClass = 'bg-yellow-500 text-white';
        } else if(grade === 'd') {
          colorClass = 'bg-orange-500 text-white';
        } else if(grade === 'e') {
          colorClass = 'bg-red-500 text-white';
        }
        
        btn.className = 'nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all ' + colorClass;

        ProductRenderer.showLoading();
        let products = [];
        if (self.productFilters.category) {
          products = await ProductService.searchProductsByCategory(self.productFilters.category, 1, 24, grade);
        } else if (self.productFilters.query) {
          products = await ProductService.searchProducts(self.productFilters.query, 1, 24, grade);
        } else {
          ProductRenderer.renderProducts([]);
          return;
        }
        ProductRenderer.renderProducts(products);
      });
    }
  }

  setupProductCategoryFilters() {
    const categoryButtons = document.querySelectorAll('.product-category-btn');
    const self = this;
    
    for(let i = 0; i < categoryButtons.length; i++) {
      const btn = categoryButtons[i];
      btn.addEventListener('click', async function() {
        const category = btn.dataset.category;
        self.productFilters.category = category;
        self.productFilters.query = '';
        
        self.updateProductCategoriesUI(category);
        
        ProductRenderer.showLoading();
        const products = await ProductService.searchProductsByCategory(category, 1, 24, self.productFilters.grade);
        ProductRenderer.renderProducts(products);
      });
    }
  }

  updateProductCategoriesUI(activeCategory) {
    const categoryButtons = document.querySelectorAll('.product-category-btn');
    for(let i = 0; i < categoryButtons.length; i++) {
      const b = categoryButtons[i];
      if (b.dataset.category === activeCategory) {
        b.classList.remove('opacity-60');
        b.classList.add('shadow-xl', '-translate-y-0.5');
      } else {
        b.classList.add('opacity-60');
        b.classList.remove('shadow-xl', '-translate-y-0.5');
      }
    }
  }

  setupProductCardClicks() {
    const modal = document.getElementById('product-detail-modal');
    if (!modal) return;

    const closeBtns = document.querySelectorAll('.close-product-modal');
    for (let i = 0; i < closeBtns.length; i++) {
      closeBtns[i].addEventListener('click', function() {
        modal.classList.add('hidden');
      });
    }



    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });

    document.addEventListener('click', async function(e) {
      if (e.target.closest('.add-product-btn')) {
        const addBtn = e.target.closest('.add-product-btn');
        const productCard = addBtn.closest('.product-card');
        if (!productCard) return;
      }

      const productCard = e.target.closest('.product-card');
      if (!productCard) return;
      
      const productDataStr = decodeURIComponent(productCard.dataset.product);
      const product = JSON.parse(productDataStr);
      
      const imgEl = document.getElementById('modal-product-image');
      const brandEl = document.getElementById('modal-product-brand');
      const nameEl = document.getElementById('modal-product-name');
      const qtyEl = document.getElementById('modal-product-quantity');
      const badgesEl = document.getElementById('modal-product-badges');
      
      const calEl = document.getElementById('modal-calories');
      const protEl = document.getElementById('modal-protein');
      const carbEl = document.getElementById('modal-carbs');
      const fatEl = document.getElementById('modal-fat');
      const sugarEl = document.getElementById('modal-sugar');
      
      const protBar = document.getElementById('modal-protein-bar');
      const carbBar = document.getElementById('modal-carbs-bar');
      const fatBar = document.getElementById('modal-fat-bar');
      const sugarBar = document.getElementById('modal-sugar-bar');

      const satFatEl = document.getElementById('modal-sat-fat');
      const fiberEl = document.getElementById('modal-fiber');
      const saltEl = document.getElementById('modal-salt');
      const ingredEl = document.getElementById('modal-ingredients');
      const addBtn = document.getElementById('modal-add-btn');

      if(imgEl) imgEl.src = product.image || 'https://via.placeholder.com/200';
      if(brandEl) brandEl.textContent = product.brand;
      if(nameEl) nameEl.textContent = product.name;
      if(qtyEl) qtyEl.textContent = product.quantity || '';
      
      if(badgesEl) {
        let badgesHtml = '';
        if(product.nutriScore) {
          const score = product.nutriScore;
          const colors = { A: '#16a34a', B: '#84cc16', C: '#fecb02', D: '#f97316', E: '#ef4444' };
          const color = colors[score] || '#9ca3af';
          badgesHtml += `
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: ${color}20">
                <span class="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style="background-color: ${color}">
                    ${score}
                </span>
                <div>
                    <p class="text-xs font-bold" style="color: ${color}">Nutri-Score</p>
                </div>
            </div>
          `;
        }
        if(product.novaGroup) {
          const group = product.novaGroup;
          const colors = { 1: '#16a34a', 2: '#84cc16', 3: '#f97316', 4: '#ef4444' };
          const color = colors[group] || '#9ca3af';
          badgesHtml += `
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: ${color}20">
                <span class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style="background-color: ${color}">
                    ${group}
                </span>
                <div>
                    <p class="text-xs font-bold" style="color: ${color}">NOVA</p>
                </div>
            </div>
          `;
        }
        badgesEl.innerHTML = badgesHtml;
      }

      if(calEl) calEl.textContent = Math.round(product.calories);
      
      if(calEl) calEl.textContent = Math.round(product.calories);
      
      const self2 = this;
      const updateMacro = function(el, bar, value, unit) {
        if (!unit) {
          unit = 'g';
        }
        if(el) el.textContent = value.toFixed(1) + unit;
        if(bar) bar.style.width = Math.min(value, 100) + '%';
      };

      updateMacro(protEl, protBar, product.protein);
      updateMacro(carbEl, carbBar, product.carbs);
      updateMacro(fatEl, fatBar, product.fat);
      updateMacro(sugarEl, sugarBar, product.sugar);

      if(satFatEl) satFatEl.textContent = (product.satFat || 0).toFixed(1) + 'g';
      if(fiberEl) fiberEl.textContent = (product.fiber || 0).toFixed(1) + 'g';
      if(saltEl) saltEl.textContent = (product.salt || 0).toFixed(2) + 'g';
      
      if(ingredEl) ingredEl.textContent = product.ingredients;

      if(addBtn) {
        addBtn.onclick = async function() {
            const item = {
                type: 'product',
                sourceId: product.barcode,
                name: product.name,
                image: product.image,
                servings: 1,
                perServingCalories: product.calories,
                calories: product.calories,
                protein: product.protein,
                carbs: product.carbs,
                fat: product.fat,
                fiber: product.fiber,
                sugar: product.sugar
            };

            FoodLogManager.addItem(item);
            
            modal.classList.add('hidden');

            await Swal.fire({
                title: 'Product Logged!',
                html: '<div class="text-center"><p class="text-lg font-semibold text-gray-900 mb-2">' + product.name + '</p><p class="text-gray-600">100g has been added to your daily log.</p><p class="text-3xl font-bold text-emerald-600 mt-4">+' + Math.round(product.calories) + ' calories</p></div>',
                icon: 'success',
                confirmButtonText: 'Great!',
                confirmButtonColor: '#10b981',
                timer: 3000,
                timerProgressBar: true
            });
            
            const foodLogSection = document.getElementById('foodlog-section');
            if (foodLogSection && foodLogSection.style.display !== 'none') {
            }
        };
      }

      modal.classList.remove('hidden');
    });
  }

  setupFoodLogActions() {
    const self = this;
    document.addEventListener('click', async function(e) {
      const removeBtn = e.target.closest('.remove-item-btn');
      if (!removeBtn) return;

      const itemId = removeBtn.dataset.itemId;
      const itemName = removeBtn.dataset.itemName;
      const itemCalories = removeBtn.dataset.itemCalories;

      const result = await Swal.fire({
        title: 'Remove from log?',
        html: '<div class="text-center"><p class="text-gray-700 mb-2">Are you sure you want to remove:</p><p class="font-semibold text-gray-900 text-lg">' + itemName + '</p><p class="text-sm text-gray-600 mt-1">' + itemCalories + ' calories</p></div>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, remove it',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280'
      });

      if (!result.isConfirmed) return;

      FoodLogManager.removeItem(itemId);
      self.loadFoodLog();

      await Swal.fire({
        title: 'Removed!',
        text: 'Item has been removed from your food log.',
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    });

    const clearBtn = document.getElementById('clear-foodlog');
    if(clearBtn) {
      clearBtn.addEventListener('click', async function() {
        const result = await Swal.fire({
          title: 'Clear entire log?',
          text: 'This will remove all items from today\'s food log.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, clear all',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#6b7280'
        });

        if (!result.isConfirmed) return;

        FoodLogManager.clearToday();
        self.loadFoodLog();

        await Swal.fire({
          title: 'Cleared!',
          text: 'Your food log has been cleared.',
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      });
    }
  }

  hideLoadingOverlay() {
    const overlay = document.getElementById('app-loading-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(function() {
        overlay.style.display = 'none';
      }, 500);
    }
  }

  showToast(message, type = 'success') {
    if (window.Swal) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: type,
        title: message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    } else {
      alert(message);
    }
  }
}


const app = new App();

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

export default app;