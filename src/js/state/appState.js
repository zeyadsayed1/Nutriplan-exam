class AppState {
  constructor() {
    this.currentMeals = [];
    this.allMeals = [];
    this.currentMeal = null;
    this.categories = [];
    this.areas = [];
    this.currentNutrition = null;
    this.currentFilter = { type: null, value: null };
    this.productFilters = { query: '', category: '', grade: '' };
    this.currentPage = 'home';
    this.viewMode = 'grid';
    this.storageKey = 'nutriplan_food_log';
  }

  getFoodLog() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {};
  }

  getTodayLog() {
    const log = this.getFoodLog();
    const today = new Date().toISOString().split('T')[0];
    if (!log[today]) {
      log[today] = { items: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 } };
    }
    return log[today];
  }

  addItemToLog(item) {
    const log = this.getFoodLog();
    const today = new Date().toISOString().split('T')[0];
    if (!log[today]) {
        log[today] = { items: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 } };
    }
    log[today].items.push({ ...item, timestamp: new Date().getTime() });
    log[today].totals.calories += item.calories;
    log[today].totals.protein += item.protein;
    log[today].totals.carbs += item.carbs;
    log[today].totals.fat += item.fat;
    log[today].totals.fiber += item.fiber;
    log[today].totals.sugar += item.sugar;
    localStorage.setItem(this.storageKey, JSON.stringify(log));
  }

  removeItemFromLog(timestamp) {
    const log = this.getFoodLog();
    const today = new Date().toISOString().split('T')[0];
    if (log[today]) {
        const itemToRemove = log[today].items.find(item => item.timestamp === timestamp);
        if (itemToRemove) {
            log[today].totals.calories -= itemToRemove.calories;
            log[today].totals.protein -= itemToRemove.protein;
            log[today].totals.carbs -= itemToRemove.carbs;
            log[today].totals.fat -= itemToRemove.fat;
            log[today].totals.fiber -= itemToRemove.fiber;
            log[today].totals.sugar -= itemToRemove.sugar;
            log[today].items = log[today].items.filter(item => item.timestamp !== timestamp);
            localStorage.setItem(this.storageKey, JSON.stringify(log));
        }
    }
  }

  clearTodayLog() {
    const log = this.getFoodLog();
    const today = new Date().toISOString().split('T')[0];
    if (log[today]) {
      log[today] = { items: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 } };
      localStorage.setItem(this.storageKey, JSON.stringify(log));
    }
  }

  getWeeklyData() {
    const log = this.getFoodLog();
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = log[dateStr] || { totals: { calories: 0 }, items: [] };
      data.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: dayData.totals.calories,
        itemCount: dayData.items.length
      });
    }
    return data;
  }

  getStats() {
    const weeklyData = this.getWeeklyData();
    const totalCalories = weeklyData.reduce((acc, day) => acc + day.calories, 0);
    const totalItems = weeklyData.reduce((acc, day) => acc + day.itemCount, 0);
    const daysOnGoal = weeklyData.filter(day => day.calories > 0 && day.calories <= 2000).length;
    
    return {
      weeklyAvg: Math.round(totalCalories / 7),
      totalItems,
      daysOnGoal: `${daysOnGoal} / 7`
    };
  }
}

export default new AppState();
