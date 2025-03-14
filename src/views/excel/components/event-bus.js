export const EventBus = new (class {
  constructor() {
    this.events = new Map();
  }
  // 监听指定事件
  $on(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    // 确保同一个事件不会被重复添加
    if (!this.events.get(eventName).includes(callback)) {
      this.events.get(eventName).push(callback);
    }
  }

  // 触发指定事件
  $emit(eventName, ...args) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).forEach((callback) => {
        callback(...args);
      });
    }
  }

  // 移除指定事件的监听器
  // 如果没有提供回调函数，则移除该事件的所有监听器
  $off(eventName, callback) {
    if (this.events.has(eventName)) {
      if (callback) {
        const index = this.events.get(eventName).indexOf(callback);
        if (index > -1) {
          this.events.get(eventName).splice(index, 1);
        }
      } else {
        // 如果没有提供回调函数，则移除所有监听器
        this.events.delete(eventName);
      }
    }
  }
})();
