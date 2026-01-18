class FoodLogManager {
  constructor() {
    this.storageKey = 'nutriplan_foodlog';
  }

  getTodayKey() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  }

  getAllData() {
    const data = localStorage.getItem(this.storageKey);
    if(data) {
      return JSON.parse(data);
    } else {
      return {};
    }
  }

  saveAllData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  getLogForDate(dateKey) {
    const allData = this.getAllData();
    if(allData[dateKey]) {
      return allData[dateKey];
    } else {
      return { 
        items: [], 
        totals: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }
      };
    }
  }

  getTodayLog() {
    const today = this.getTodayKey();
    return this.getLogForDate(today);
  }

  addItem(item) {
    const dateKey = this.getTodayKey();
    const allData = this.getAllData();
    
    if (!allData[dateKey]) {
      allData[dateKey] = { 
        items: [], 
        totals: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }
      };
    }

    const itemId = item.sourceId || Date.now();
    item.id = item.type + '_' + itemId + '_' + Date.now();
    item.timestamp = Date.now();

    allData[dateKey].items.push(item);
    
    const newTotals = this.calculateTotals(allData[dateKey].items);
    allData[dateKey].totals = newTotals;

    this.saveAllData(allData);
    return item;
  }

  removeItem(itemId) {
    const dateKey = this.getTodayKey();
    const allData = this.getAllData();
    
    if (!allData[dateKey]) return;

    const newItems = [];
    for(let i = 0; i < allData[dateKey].items.length; i++) {
      if(allData[dateKey].items[i].id !== itemId) {
        newItems.push(allData[dateKey].items[i]);
      }
    }
    allData[dateKey].items = newItems;
    
    allData[dateKey].totals = this.calculateTotals(allData[dateKey].items);

    this.saveAllData(allData);
  }

  clearToday() {
    const dateKey = this.getTodayKey();
    const allData = this.getAllData();
    
    allData[dateKey] = { 
      items: [], 
      totals: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }
    };
    this.saveAllData(allData);
  }

  calculateTotals(items) {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    for(let i = 0; i < items.length; i++) {
      const item = items[i];
      if(item.calories) totalCalories += item.calories;
      if(item.protein) totalProtein += item.protein;
      if(item.carbs) totalCarbs += item.carbs;
      if(item.fat) totalFat += item.fat;
    }

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat
    };
  }

  getEmptyTotals() {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
  }

  getWeeklyData() {
    const days = this.getLast7Days();
    const allData = this.getAllData();
    
    const weeklyData = [];
    for(let i = 0; i < days.length; i++) {
      const dateKey = days[i];
      let log = allData[dateKey];
      
      if(!log) {
        log = { items: [], totals: this.getEmptyTotals() };
      }
      
      const itemsCount = log.items ? log.items.length : 0;
      
      weeklyData.push({
        date: dateKey,
        itemsCount: itemsCount,
        calories: log.totals.calories,
        protein: log.totals.protein,
        carbs: log.totals.carbs,
        fat: log.totals.fat
      });
    }

    return weeklyData;
  }
}

export default new FoodLogManager();