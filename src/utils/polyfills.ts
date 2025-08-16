// src/utils/polyfills.ts
// Polyfills 配置 - 为旧版浏览器和安卓设备提供兼容性支持
// 
// 功能说明：
// 1. 提供 ES6+ 特性的 polyfills
// 2. 修复安卓 WebView 的兼容性问题
// 3. 提供 Promise、Object、Array 等方法的 polyfills
// 
// 使用方式：
// 在 app/layout.tsx 或 app/mining/layout.tsx 中导入：
// import '@/utils/polyfills'
// 
// 关联文件：
// - 被 @/app/layout.tsx 导入（全局 polyfills）
// - 被 @/app/mining/layout.tsx 导入（挖矿页面 polyfills）
// 
// 创建时间：2024-01
// 更新历史：
// - 2024-01: 创建此文件解决安卓设备兼容性问题

'use client'

// 只在客户端执行
if (typeof window !== 'undefined') {
  
  // ========== Object Polyfills ==========
  
  // Object.entries polyfill
  if (!Object.entries) {
    Object.entries = function<T>(obj: T): Array<[string, any]> {
      const ownProps = Object.keys(obj)
      let i = ownProps.length
      const resArray = new Array(i)
      while (i--) {
        resArray[i] = [ownProps[i], (obj as any)[ownProps[i]]]
      }
      return resArray
    }
  }
  
  // Object.values polyfill
  if (!Object.values) {
    Object.values = function<T>(obj: T): Array<any> {
      return Object.keys(obj).map(key => (obj as any)[key])
    }
  }
  
  // Object.assign polyfill
  if (!Object.assign) {
    Object.assign = function(target: any, ...sources: any[]) {
      if (target === null || target === undefined) {
        throw new TypeError('Cannot convert undefined or null to object')
      }
      
      const to = Object(target)
      
      for (let index = 0; index < sources.length; index++) {
        const nextSource = sources[index]
        
        if (nextSource !== null && nextSource !== undefined) {
          for (const nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey]
            }
          }
        }
      }
      return to
    }
  }
  
  // ========== Array Polyfills ==========
  
  // Array.prototype.includes polyfill
  if (!Array.prototype.includes) {
    Array.prototype.includes = function<T>(this: T[], searchElement: T, fromIndex?: number): boolean {
      const O = Object(this)
      const len = parseInt(O.length, 10) || 0
      
      if (len === 0) return false
      
      const n = fromIndex || 0
      let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0)
      
      function sameValueZero(x: any, y: any): boolean {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y))
      }
      
      while (k < len) {
        if (sameValueZero(O[k], searchElement)) {
          return true
        }
        k++
      }
      
      return false
    }
  }
  
  // Array.prototype.find polyfill
  if (!Array.prototype.find) {
    Array.prototype.find = function<T>(this: T[], predicate: (value: T, index: number, obj: T[]) => boolean): T | undefined {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined')
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function')
      }
      
      const list = Object(this)
      const length = list.length >>> 0
      const thisArg = arguments[1]
      
      for (let i = 0; i < length; i++) {
        const value = list[i]
        if (predicate.call(thisArg, value, i, list)) {
          return value
        }
      }
      
      return undefined
    }
  }
  
  // Array.prototype.findIndex polyfill
  if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function<T>(this: T[], predicate: (value: T, index: number, obj: T[]) => boolean): number {
      if (this == null) {
        throw new TypeError('Array.prototype.findIndex called on null or undefined')
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function')
      }
      
      const list = Object(this)
      const length = list.length >>> 0
      const thisArg = arguments[1]
      
      for (let i = 0; i < length; i++) {
        const value = list[i]
        if (predicate.call(thisArg, value, i, list)) {
          return i
        }
      }
      
      return -1
    }
  }
  
  // Array.from polyfill
  if (!Array.from) {
    Array.from = function<T>(arrayLike: ArrayLike<T> | Iterable<T>, mapFn?: (v: T, k: number) => any, thisArg?: any): any[] {
      const C = this
      const items = Object(arrayLike)
      
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined')
      }
      
      const mapFunction = mapFn
      const len = parseInt(items.length, 10) || 0
      const A = typeof C === 'function' ? Object(new C(len)) : new Array(len)
      
      let k = 0
      while (k < len) {
        const kValue = items[k]
        if (mapFunction) {
          A[k] = mapFunction.call(thisArg, kValue, k)
        } else {
          A[k] = kValue
        }
        k += 1
      }
      
      A.length = len
      return A
    }
  }
  
  // ========== String Polyfills ==========
  
  // String.prototype.startsWith polyfill
  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(search: string, pos?: number): boolean {
      return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search
    }
  }
  
  // String.prototype.endsWith polyfill
  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(search: string, length?: number): boolean {
      if (length === undefined || length > this.length) {
        length = this.length
      }
      return this.substring(length - search.length, length) === search
    }
  }
  
  // String.prototype.includes polyfill
  if (!String.prototype.includes) {
    String.prototype.includes = function(search: string, start?: number): boolean {
      if (typeof start !== 'number') {
        start = 0
      }
      
      if (start + search.length > this.length) {
        return false
      } else {
        return this.indexOf(search, start) !== -1
      }
    }
  }
  
  // String.prototype.repeat polyfill
  if (!String.prototype.repeat) {
    String.prototype.repeat = function(count: number): string {
      if (this == null) {
        throw new TypeError('can\'t convert ' + this + ' to object')
      }
      
      let str = '' + this
      count = +count
      
      if (count < 0 || count === Infinity) {
        throw new RangeError('Invalid count value')
      }
      
      count = Math.floor(count)
      if (str.length === 0 || count === 0) {
        return ''
      }
      
      if (str.length * count >= 1 << 28) {
        throw new RangeError('repeat count must not overflow maximum string size')
      }
      
      let result = ''
      while (count > 0) {
        if (count & 1) {
          result += str
        }
        count >>= 1
        if (count > 0) {
          str += str
        }
      }
      
      return result
    }
  }
  
  // ========== Promise Polyfill (简化版) ==========
  
  if (typeof Promise === 'undefined') {
    console.warn('[Polyfills] Promise is not defined, loading polyfill...')
    
    // 这里应该加载完整的 Promise polyfill
    // 建议使用 core-js 或 es6-promise
    // 这里只是一个占位符，实际项目中应该使用完整的 polyfill
    
    (window as any).Promise = class PromisePolyfill {
      constructor(executor: Function) {
        // 简化实现，实际应该使用完整的 Promise polyfill
        console.error('[Polyfills] Promise polyfill not fully implemented')
      }
      
      then() { return this }
      catch() { return this }
      finally() { return this }
      
      static resolve(value: any) {
        return new PromisePolyfill(() => {})
      }
      
      static reject(reason: any) {
        return new PromisePolyfill(() => {})
      }
      
      static all(promises: any[]) {
        return new PromisePolyfill(() => {})
      }
      
      static race(promises: any[]) {
        return new PromisePolyfill(() => {})
      }
    }
  }
  
  // ========== Number Polyfills ==========
  
  // Number.isNaN polyfill
  if (!Number.isNaN) {
    Number.isNaN = function(value: any): boolean {
      return typeof value === 'number' && isNaN(value)
    }
  }
  
  // Number.isFinite polyfill
  if (!Number.isFinite) {
    Number.isFinite = function(value: any): boolean {
      return typeof value === 'number' && isFinite(value)
    }
  }
  
  // Number.isInteger polyfill
  if (!Number.isInteger) {
    Number.isInteger = function(value: any): boolean {
      return typeof value === 'number' && 
             isFinite(value) && 
             Math.floor(value) === value
    }
  }
  
  // ========== Math Polyfills ==========
  
  // Math.trunc polyfill
  if (!Math.trunc) {
    Math.trunc = function(v: number): number {
      v = +v
      if (!isFinite(v)) return v
      return (v - v % 1) || (v < 0 ? -0 : v === 0 ? v : 0)
    }
  }
  
  // Math.sign polyfill
  if (!Math.sign) {
    Math.sign = function(x: number): number {
      x = +x
      if (x === 0 || isNaN(x)) {
        return x
      }
      return x > 0 ? 1 : -1
    }
  }
  
  // ========== 修复安卓 WebView 特定问题 ==========
  
  // 修复 Android 4.x 的 Function.prototype.bind
  if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis: any, ...args: any[]) {
      if (typeof this !== 'function') {
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable')
      }
      
      const aArgs = Array.prototype.slice.call(arguments, 1)
      const fToBind = this
      const fNOP = function() {}
      const fBound = function(this: any) {
        return fToBind.apply(
          this instanceof fNOP ? this : oThis,
          aArgs.concat(Array.prototype.slice.call(arguments))
        )
      }
      
      if (this.prototype) {
        fNOP.prototype = this.prototype
      }
      fBound.prototype = new (fNOP as any)()
      
      return fBound
    }
  }
  
  // 修复某些安卓设备的 Date.now
  if (!Date.now) {
    Date.now = function(): number {
      return new Date().getTime()
    }
  }
  
  // 修复 requestAnimationFrame
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function() {
      return window.webkitRequestAnimationFrame ||
             (window as any).mozRequestAnimationFrame ||
             (window as any).oRequestAnimationFrame ||
             (window as any).msRequestAnimationFrame ||
             function(callback: FrameRequestCallback): number {
               return window.setTimeout(callback, 1000 / 60)
             }
    })()
  }
  
  // 修复 cancelAnimationFrame
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (function() {
      return window.webkitCancelAnimationFrame ||
             (window as any).mozCancelAnimationFrame ||
             (window as any).oCancelAnimationFrame ||
             (window as any).msCancelAnimationFrame ||
             function(id: number): void {
               clearTimeout(id)
             }
    })()
  }
  
  // ========== 控制台日志 ==========
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Polyfills] Polyfills loaded successfully')
  }
}
