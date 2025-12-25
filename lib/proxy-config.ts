// 使用 global-agent 来配置全局 HTTP/HTTPS 代理
// global-agent 通过覆盖 http.request 和 https.request 方法来工作
// 不依赖自定义 agent，避免了 Next.js/Turbopack 打包后的原型链问题

let globalAgentConfigured = false

export function configureGlobalProxy(): void {
  if (globalAgentConfigured) {
    return
  }

  const proxyUrl =
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    process.env.NEXTAUTH_PROXY_URL ||
    process.env.https_proxy ||
    process.env.http_proxy

  if (!proxyUrl) {
    console.log('[ProxyConfig] No proxy configured, using direct connection')
    globalAgentConfigured = true
    return
  }

  try {
    // 动态导入，避免在顶层导入时执行
    const { bootstrap } = require('global-agent')

    // global-agent 使用 GLOBAL_AGENT_HTTP_PROXY 环境变量
    // 我们需要将 HTTP_PROXY 转换为 GLOBAL_AGENT_HTTP_PROXY
    if (!process.env.GLOBAL_AGENT_HTTP_PROXY) {
      process.env.GLOBAL_AGENT_HTTP_PROXY = proxyUrl
    }

    // 启动 global-agent
    bootstrap()

    globalAgentConfigured = true

    if (process.env.NODE_ENV === 'development') {
      console.log(`[ProxyConfig] Global proxy configured via global-agent: ${proxyUrl}`)
    }
  } catch (error) {
    console.error('[ProxyConfig] Failed to configure global proxy:', error)
  }
}

export function getProxyHttpOptions(customOptions: any = {}): any {
  // global-agent 自动处理所有请求，不需要传递 agent
  return customOptions
}
