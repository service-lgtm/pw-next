// src/utils/debugWarning.ts
// 用于调试和定位 warning 错误的工具

/**
 * 劫持 console.error 以获取更多错误信息
 */
export function setupErrorInterceptor() {
  const originalError = console.error
  
  console.error = function(...args: any[]) {
    // 检查是否是 warning 相关错误
    if (args[0]?.toString?.().includes('warning is not a function') || 
        args[0]?.message?.includes('warning is not a function')) {
      
      console.log('%c🔍 Warning Error Detected!', 'color: red; font-size: 16px; font-weight: bold;')
      console.log('Error details:', args[0])
      
      // 尝试从错误堆栈中提取组件信息
      if (args[0]?.stack) {
        const stack = args[0].stack
        console.log('Stack trace:', stack)
        
        // 尝试找到具体的组件名
        const componentMatch = stack.match(/at (\w+) \(/g)
        if (componentMatch) {
          console.log('Possible components involved:', componentMatch)
        }
      }
      
      // 检查 React 的 componentStack
      if (args[1]?.componentStack) {
        console.log('%c📍 Component Stack:', 'color: blue; font-weight: bold;')
        console.log(args[1].componentStack)
      }
      
      // 尝试获取当前渲染的组件
      try {
        // React DevTools 集成
        const reactDevTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
        if (reactDevTools) {
          const renderers = reactDevTools.renderers
          if (renderers && renderers.size > 0) {
            console.log('%c🎯 React DevTools Info:', 'color: green; font-weight: bold;')
            renderers.forEach((renderer: any, id: any) => {
              console.log(`Renderer ${id}:`, renderer)
            })
          }
        }
      } catch (e) {
        // 忽略
      }
    }
    
    // 调用原始的 console.error
    originalError.apply(console, args)
  }
}

/**
 * 创建一个代理来包装可能有问题的组件
 */
export function createComponentProxy<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  return (props: P) => {
    try {
      // 在渲染前注入 warning 函数
      if (typeof window !== 'undefined') {
        // 确保全局 warning 存在
        (window as any).warning = (window as any).warning || function(condition: boolean, format: string, ...args: any[]) {
          if (!condition) {
            console.warn(`[${componentName}] Warning: ${format}`, ...args)
          }
        }
        
        // 为 rc-util 添加 warning
        if ((window as any)['rc-util']) {
          const rcUtil = (window as any)['rc-util']
          if (!rcUtil.warning) {
            rcUtil.warning = (window as any).warning
          }
          if (rcUtil.ZP && !rcUtil.ZP.warning) {
            rcUtil.ZP.warning = (window as any).warning
          }
        }
      }
      
      console.log(`[ComponentProxy] Rendering ${componentName}`)
      return <Component {...props} />
    } catch (error: any) {
      console.error(`[ComponentProxy] Error in ${componentName}:`, error)
      
      // 如果是 warning 错误，尝试修复并重试
      if (error?.message?.includes('warning is not a function')) {
        console.log(`[ComponentProxy] Attempting to fix warning error in ${componentName}`)
        
        // 注入修复
        injectWarningFix()
        
        // 重试渲染
        try {
          return <Component {...props} />
        } catch (retryError) {
          console.error(`[ComponentProxy] Retry failed for ${componentName}:`, retryError)
          // 返回错误占位符
          return (
            <div style={{ 
              padding: '20px', 
              background: '#ff000020', 
              border: '1px solid #ff0000',
              borderRadius: '4px',
              margin: '10px'
            }}>
              <h3>组件渲染错误: {componentName}</h3>
              <p>错误: {error.message}</p>
              <details>
                <summary>详细信息</summary>
                <pre>{error.stack}</pre>
              </details>
            </div>
          )
        }
      }
      
      throw error
    }
  }
}

/**
 * 注入 warning 修复
 */
function injectWarningFix() {
  if (typeof window === 'undefined') return
  
  // 创建全局 warning
  const warningFunc = function(condition: boolean, format: string, ...args: any[]) {
    if (!condition && process.env.NODE_ENV !== 'production') {
      console.warn(`Warning: ${format}`, ...args)
    }
  }
  
  // 设置到 window
  (window as any).warning = warningFunc
  
  // 尝试修复所有可能的库
  const possibleLibs = [
    'rc-util',
    'rc-field-form',
    'rc-table',
    'rc-select',
    'rc-tree',
    'rc-upload',
    'rc-dialog',
    'rc-drawer',
    'rc-dropdown',
    'rc-menu',
    'rc-tooltip',
    'antd'
  ]
  
  possibleLibs.forEach(libName => {
    try {
      const lib = (window as any)[libName]
      if (lib) {
        if (!lib.warning) {
          lib.warning = warningFunc
        }
        if (lib.ZP && !lib.ZP.warning) {
          lib.ZP.warning = warningFunc
        }
        if (lib.default && !lib.default.warning) {
          lib.default.warning = warningFunc
        }
      }
    } catch (e) {
      // 忽略
    }
  })
  
  // 特殊处理 r.ZP 的情况
  try {
    // 遍历 window 对象查找可能的 r 变量
    Object.keys(window).forEach(key => {
      const value = (window as any)[key]
      if (value && typeof value === 'object') {
        if (value.ZP && typeof value.ZP === 'object' && !value.ZP.warning) {
          value.ZP.warning = warningFunc
          console.log(`[WarningFix] Added warning to ${key}.ZP`)
        }
      }
    })
  } catch (e) {
    // 忽略
  }
}

/**
 * 监控组件渲染
 */
export function monitorComponentRender(componentName: string) {
  return function<P extends object>(Component: React.ComponentType<P>) {
    return class MonitoredComponent extends React.Component<P> {
      componentDidMount() {
        console.log(`[Monitor] ${componentName} mounted`)
      }
      
      componentDidUpdate() {
        console.log(`[Monitor] ${componentName} updated`)
      }
      
      componentWillUnmount() {
        console.log(`[Monitor] ${componentName} will unmount`)
      }
      
      componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(`[Monitor] ${componentName} caught error:`, error)
        console.error('Error Info:', errorInfo)
        
        if (error.message.includes('warning is not a function')) {
          console.log(`[Monitor] Warning error in ${componentName}, attempting fix...`)
          injectWarningFix()
        }
      }
      
      render() {
        try {
          return <Component {...this.props} />
        } catch (error: any) {
          console.error(`[Monitor] Render error in ${componentName}:`, error)
          if (error.message.includes('warning is not a function')) {
            injectWarningFix()
            // 尝试重新渲染
            return <Component {...this.props} />
          }
          throw error
        }
      }
    }
  }
}

/**
 * 初始化所有调试工具
 */
export function initializeDebugging() {
  console.log('%c🚀 Initializing Warning Error Debugging', 'color: blue; font-size: 14px; font-weight: bold;')
  
  // 设置错误拦截器
  setupErrorInterceptor()
  
  // 注入初始修复
  injectWarningFix()
  
  // 监听 DOM 变化
  if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // 新节点添加时尝试修复
          injectWarningFix()
        }
      })
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    // 5秒后停止观察
    setTimeout(() => {
      observer.disconnect()
      console.log('[Debug] MutationObserver disconnected')
    }, 5000)
  }
  
  // 定期检查和修复（前10秒）
  let checkCount = 0
  const checkInterval = setInterval(() => {
    checkCount++
    injectWarningFix()
    
    if (checkCount >= 10) {
      clearInterval(checkInterval)
      console.log('[Debug] Stopped periodic warning fix')
    }
  }, 1000)
  
  console.log('%c✅ Debugging initialized', 'color: green; font-size: 12px;')
}

// 自动初始化
if (typeof window !== 'undefined') {
  // 立即初始化
  initializeDebugging()
  
  // DOM 加载完成后再次初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDebugging)
  }
}
