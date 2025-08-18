// src/utils/warningPolyfill.ts
// 修复 warning 函数不存在的问题
// 
// 这个文件提供了一个 polyfill 来修复某些库期望的 warning 函数不存在的问题

/**
 * 创建全局 warning 函数 polyfill
 */
export function setupWarningPolyfill() {
  // 检查是否在浏览器环境
  if (typeof window === 'undefined') {
    return
  }

  // 为 console 添加 warning 方法（如果不存在）
  if (!console.warning) {
    console.warning = console.warn || console.log
  }

  // 修复可能的 rc-util warning 问题
  try {
    // 尝试获取 rc-util
    const rcUtil = (window as any)['rc-util']
    if (rcUtil && !rcUtil.warning) {
      rcUtil.warning = (condition: boolean, format: string, ...args: any[]) => {
        if (!condition) {
          console.warn(`Warning: ${format}`, ...args)
        }
      }
    }
  } catch (e) {
    // 忽略错误
  }

  // 添加全局 warning 函数
  if (!(window as any).warning) {
    (window as any).warning = (condition: boolean, format: string, ...args: any[]) => {
      if (!condition) {
        console.warn(`Warning: ${format}`, ...args)
      }
    }
  }
}

/**
 * 修复可能的库依赖问题
 */
export function patchLibraryWarnings() {
  // 修复可能的 antd 相关库问题
  const libs = ['rc-util', 'rc-field-form', 'rc-table', 'rc-select', 'rc-tree', 'rc-upload']
  
  libs.forEach(libName => {
    try {
      const lib = (window as any)[libName]
      if (lib) {
        // 确保 warning 函数存在
        if (!lib.warning) {
          lib.warning = (condition: boolean, format: string, ...args: any[]) => {
            if (!condition && process.env.NODE_ENV !== 'production') {
              console.warn(`[${libName}] Warning: ${format}`, ...args)
            }
          }
        }
        
        // 如果有 ZP 属性，也添加 warning
        if (lib.ZP && !lib.ZP.warning) {
          lib.ZP.warning = lib.warning
        }
      }
    } catch (e) {
      // 忽略错误
    }
  })
}

/**
 * 创建代理来捕获 warning 调用
 */
export function createWarningProxy() {
  if (typeof Proxy === 'undefined') {
    return null
  }

  return new Proxy({}, {
    get(target, prop) {
      if (prop === 'warning') {
        return (condition: boolean, format: string, ...args: any[]) => {
          if (!condition && process.env.NODE_ENV !== 'production') {
            console.warn(`Warning: ${format}`, ...args)
          }
        }
      }
      return undefined
    }
  })
}

/**
 * 安装所有 warning 相关的修复
 */
export function installWarningFixes() {
  // 设置基础 polyfill
  setupWarningPolyfill()
  
  // 修补库的 warning 函数
  patchLibraryWarnings()
  
  // 监听动态加载的模块
  if (typeof window !== 'undefined') {
    // 使用 MutationObserver 监听 DOM 变化（可能有动态加载的脚本）
    const observer = new MutationObserver(() => {
      patchLibraryWarnings()
    })
    
    // 只观察 script 标签的添加
    observer.observe(document.head, {
      childList: true,
      subtree: false
    })
    
    // 5秒后停止观察（避免性能问题）
    setTimeout(() => {
      observer.disconnect()
    }, 5000)
  }
}

// 自动安装修复（在导入时）
if (typeof window !== 'undefined') {
  // 尽早安装修复
  installWarningFixes()
  
  // DOM 加载完成后再次安装（确保所有库都已加载）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installWarningFixes)
  } else {
    // DOM 已经加载完成
    setTimeout(installWarningFixes, 0)
  }
}

export default installWarningFixes
