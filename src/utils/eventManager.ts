/*
 * @Author: yy
 * @Date: 2025-09-21 22:29:04
 * @LastEditTime: 2025-09-21 22:31:21
 * @LastEditors: yy
 * @Description: 
 */
type EventCallback = (data?: any) => void;

class EventManager {
    private events: Map<string, EventCallback[]>;

    constructor() {
        this.events = new Map();
    }

    // 注册事件监听
    on(event: string, callback: EventCallback): void {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)?.push(callback);
    }

    // 注册一次性事件监听
    once(event: string, callback: EventCallback): void {
        const onceCallback = (data?: any) => {
            callback(data);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }

    // 触发事件
    emit(event: string, data?: any): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    // 移除事件监听
    off(event: string, callback?: EventCallback): void {
        if (!callback) {
            this.events.delete(event);
            return;
        }

        const callbacks = this.events.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // 移除所有事件监听
    clear(): void {
        this.events.clear();
    }
}

// 创建全局事件管理器实例
export const eventManager = new EventManager();
