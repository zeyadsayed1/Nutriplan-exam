import api from './api/mealdb.js';
import state from './state/appState.js';
import ui from './ui/components.js';

class NutriPlanApp {
  constructor() {
    this.init();
  }

  async init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.setupGlobalEvents();
    this.handleRoute();
    await this.loadInitialData();
    ui.hidePageLoading();
  }

  async loadInitialData() {
    state.categories = await api.getCategories();
    state.areas = await api.getAreas();
    ui.renderCategories(state.categories);
    ui.renderAreaFilters(state.areas);
    const meals = await api.getRandomMeals(25);
    state.currentMeals = meals;
    state.allMeals = meals;
    ui.renderMeals(meals, state.viewMode);
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    const [page, id] = hash.split('/');
    this.showPage(page);
    if (page === 'home') ui.renderMeals(state.currentMeals, state.viewMode);
    else if (page === 'meal' && id) this.loadMealDetails(id);
    else if (page === 'foodlog') ui.renderFoodLog(state.getTodayLog(), state.getWeeklyData(), state.getStats());
  }

  showPage(page) {
    const sections = ['search-filters-section', 'meal-categories-section', 'all-recipes-section', 'meal-details', 'products-section', 'foodlog-section'];
    sections.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = 'none';
    });
    const headerTitle = document.querySelector('#header h1');
    const headerDesc = document.querySelector('#header p');
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(l => l.classList.remove('bg-emerald-50', 'text-emerald-700'));

    if (page === 'home') {
      ['search-filters-section', 'meal-categories-section', 'all-recipes-section'].forEach(s => {
          const el = document.getElementById(s);
          if (el) el.style.display = '';
      });
      headerTitle.textContent = 'Meals & Recipes';
      headerDesc.textContent = 'Discover delicious and nutritious recipes tailored for you';
      navLinks[0].classList.add('bg-emerald-50', 'text-emerald-700');
    } else if (page === 'meal') {
      document.getElementById('meal-details').style.display = '';
      headerTitle.textContent = 'Meal Details';
    } else if (page === 'products') {
      document.getElementById('products-section').style.display = '';
      headerTitle.textContent = 'Product Scanner';
      navLinks[1].classList.add('bg-emerald-50', 'text-emerald-700');
    } else if (page === 'foodlog') {
      document.getElementById('foodlog-section').style.display = '';
      headerTitle.textContent = 'Food Log';
      navLinks[2].classList.add('bg-emerald-50', 'text-emerald-700');
    }
  }

  async loadMealDetails(id) {
    window.scrollTo(0, 0);
    const meal = await api.getMealById(id);
    if (!meal) return;
    const nutrition = await api.getMealNutrition(id);
    state.currentMeal = meal;
    state.currentNutrition = nutrition;
    ui.renderMealDetails(meal, nutrition);
  }

  setupGlobalEvents() {
    document.addEventListener('click', async (e) => {
      const catCard = e.target.closest('.category-card');
      if (catCard) {
        ui.showLoading('recipes-grid');
        const meals = await api.filterByCategory(catCard.dataset.category);
        state.currentMeals = meals;
        ui.renderMeals(meals, state.viewMode);
      }

      const areaFilter = e.target.closest('.area-filter');
      if (areaFilter) {
        ui.showLoading('recipes-grid');
        const meals = await api.filterByArea(areaFilter.dataset.area);
        state.currentMeals = meals;
        ui.renderMeals(meals, state.viewMode);
      }

      if (e.target.closest('.area-filter-all')) {
        ui.showLoading('recipes-grid');
        const meals = await api.getRandomMeals(25);
        state.currentMeals = meals;
        ui.renderMeals(meals, state.viewMode);
      }

      const mealCard = e.target.closest('.recipe-card');
      if (mealCard) window.location.hash = `meal/${mealCard.dataset.mealId}`;

      const navLink = e.target.closest('.nav-link');
      if (navLink) {
          e.preventDefault();
          const links = ['home', 'products', 'foodlog'];
          const idx = Array.from(document.querySelectorAll('.nav-link')).indexOf(navLink);
          if (idx !== -1) window.location.hash = links[idx];
      }
      if (e.target.closest('#back-to-meals-btn')) window.location.hash = 'home';

      if (e.target.closest('#log-meal-btn')) {
        ui.showLogMealModal(state.currentMeal, state.currentNutrition);
      }

      const prodCard = e.target.closest('.product-card');
      if (prodCard) {
          const barcode = prodCard.dataset.barcode;
          const p = await api.getProductByBarcode(barcode);
          if (p) {
              state.currentProduct = p;
              ui.showProductDetailModal(p);
          }
      }

      const removeBtn = e.target.closest('.remove-log-item');
      if (removeBtn) {
          const timestamp = parseInt(removeBtn.dataset.timestamp);
          if (typeof Swal !== 'undefined') {
              const result = await Swal.fire({
                  title: 'Remove this item?',
                  text: "You won't be able to revert this!",
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#10b981',
                  cancelButtonColor: '#ef4444',
                  confirmButtonText: 'Yes, delete it!'
              });
              if (result.isConfirmed) {
                  state.removeItemFromLog(timestamp);
                  ui.renderFoodLog(state.getTodayLog(), state.getWeeklyData(), state.getStats());
                  Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1000, showConfirmButton: false });
              }
          } else if (confirm('Remove this item?')) {
              state.removeItemFromLog(timestamp);
              ui.renderFoodLog(state.getTodayLog(), state.getWeeklyData(), state.getStats());
          }
      }
    });

    const servantsInput = document.getElementById('meal-servings');
    if (servantsInput) {
        servantsInput.addEventListener('input', (e) => {
            ui.updateModalNutrition(state.currentNutrition, parseFloat(e.target.value) || 1);
        });
        document.getElementById('decrease-servings')?.addEventListener('click', () => {
            servantsInput.value = Math.max(0.5, (parseFloat(servantsInput.value) || 1) - 0.5);
            ui.updateModalNutrition(state.currentNutrition, parseFloat(servantsInput.value));
        });
        document.getElementById('increase-servings')?.addEventListener('click', () => {
            servantsInput.value = Math.min(10, (parseFloat(servantsInput.value) || 1) + 0.5);
            ui.updateModalNutrition(state.currentNutrition, parseFloat(servantsInput.value));
        });
    }

    document.getElementById('confirm-log-meal')?.addEventListener('click', async () => {
        const servings = parseFloat(servantsInput.value) || 1;
        const n = state.currentNutrition;
        const item = {
          name: state.currentMeal.strMeal,
          image: state.currentMeal.strMealThumb,
          servings: servings,
          calories: Math.round(n.calories.perServing * servings),
          protein: Math.round(n.macros.protein.amount * servings),
          carbs: Math.round(n.macros.carbs.amount * servings),
          fat: Math.round(n.macros.fat.amount * servings),
          fiber: Math.round(n.macros.fiber.amount * servings),
          sugar: Math.round(n.macros.sugar.amount * servings)
        };
        state.addItemToLog(item);
        document.getElementById('log-meal-modal').classList.add('hidden');
        if (typeof Swal !== 'undefined') {
            await Swal.fire({
                title: 'Meal Logged!',
                html: `<div class="text-center"><p class="text-lg font-semibold text-gray-900 mb-2">${item.name}</p><p class="text-gray-600">${item.servings} serving(s) added.</p><p class="text-3xl font-bold text-emerald-600 mt-4">+${item.calories} calories</p></div>`,
                icon: 'success',
                confirmButtonColor: '#10b981',
                timer: 2000
            });
        }
    });

    document.getElementById('cancel-log-meal')?.addEventListener('click', () => {
        document.getElementById('log-meal-modal').classList.add('hidden');
    });

    document.getElementById('modal-add-btn')?.addEventListener('click', async () => {
        const p = state.currentProduct;
        const n = p.nutriments || {};
        const item = {
            name: p.product_name,
            image: p.image_url || p.image_front_url || '',
            servings: 1,
            calories: Math.round(n['energy-kcal_100g'] || 0),
            protein: Math.round(n.proteins_100g || 0),
            carbs: Math.round(n.carbohydrates_100g || 0),
            fat: Math.round(n.fat_100g || 0),
            fiber: Math.round(n.fiber_100g || 0),
            sugar: Math.round(n.sugars_100g || 0)
        };
        state.addItemToLog(item);
        document.getElementById('product-detail-modal').classList.add('hidden');
        if (typeof Swal !== 'undefined') {
            await Swal.fire({
                title: 'Product Logged!',
                html: `<div class="text-center"><p class="text-lg font-semibold text-gray-900 mb-2">${item.name}</p><p class="text-gray-600">${item.servings} serving(s) added.</p><p class="text-3xl font-bold text-emerald-600 mt-4">+${item.calories} calories/100g</p></div>`,
                icon: 'success',
                confirmButtonColor: '#10b981',
                timer: 2000
            });
        }
    });

    document.querySelectorAll('.close-product-modal').forEach(btn => {
        btn.addEventListener('click', () => document.getElementById('product-detail-modal').classList.add('hidden'));
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let timeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                ui.showLoading('recipes-grid');
                const meals = await api.searchMeals(e.target.value);
                state.currentMeals = meals;
                ui.renderMeals(meals, state.viewMode);
            }, 500);
        });
    }

    const gridBtn = document.getElementById('grid-view-btn');
    const listBtn = document.getElementById('list-view-btn');
    if (gridBtn && listBtn) {
        gridBtn.addEventListener('click', () => {
            state.viewMode = 'grid';
            ui.renderMeals(state.currentMeals, 'grid');
        });
        listBtn.addEventListener('click', () => {
            state.viewMode = 'list';
            ui.renderMeals(state.currentMeals, 'list');
        });
    }

    const prodSearchBtn = document.getElementById('search-product-btn');
    const prodInput = document.getElementById('product-search-input');
    if (prodSearchBtn && prodInput) {
        prodSearchBtn.addEventListener('click', async () => {
            ui.showLoading('products-grid');
            const products = await api.searchProducts(prodInput.value);
            ui.renderProducts(products);
        });
    }

    const barcodeBtn = document.getElementById('lookup-barcode-btn');
    const barcodeInput = document.getElementById('barcode-input');
    if (barcodeBtn && barcodeInput) {
        barcodeBtn.addEventListener('click', async () => {
            ui.showLoading('products-grid');
            const p = await api.getProductByBarcode(barcodeInput.value);
            ui.renderProducts(p ? [p] : []);
        });
    }

    document.querySelectorAll('.nutri-score-filter').forEach(btn => {
        btn.addEventListener('click', async () => {
            ui.showLoading('products-grid');
            const products = await api.searchProducts(prodInput.value || 'a', 1, 24, btn.dataset.grade);
            ui.renderProducts(products);
        });
    });

    document.querySelectorAll('.product-category-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            ui.showLoading('products-grid');
            const products = await api.searchProductsByCategory(btn.dataset.category);
            ui.renderProducts(products);
        });
    });

    const clearLogBtn = document.getElementById('clear-foodlog');
    if (clearLogBtn) {
        clearLogBtn.addEventListener('click', async () => {
            if (typeof Swal !== 'undefined') {
                const result = await Swal.fire({
                    title: 'Clear entire log?',
                    text: "This will remove all items for today.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonColor: '#6b7280',
                    confirmButtonText: 'Yes, clear it!'
                });
                if (result.isConfirmed) {
                    state.clearTodayLog();
                    ui.renderFoodLog(state.getTodayLog(), state.getWeeklyData(), state.getStats());
                    Swal.fire({ title: 'Cleared!', icon: 'success', timer: 1000, showConfirmButton: false });
                }
            } else if (confirm('Clear entire log?')) {
                state.clearTodayLog();
                ui.renderFoodLog(state.getTodayLog(), state.getWeeklyData(), state.getStats());
            }
        });
    }

    const menuBtn = document.getElementById('header-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (menuBtn && sidebar && overlay) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.add('mobile-open');
            overlay.classList.add('active');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
        });
        const closeBtn = document.getElementById('sidebar-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                sidebar.classList.remove('mobile-open');
                overlay.classList.remove('active');
            });
        }
    }
  }
}

new NutriPlanApp();
