// test-google.js
const { HttpsProxyAgent } = require('https-proxy-agent');

async function test() {
  console.log("--- 强制代理测试 ---");
  const proxy = "http://127.0.0.1:7890";
  const agent = new HttpsProxyAgent(proxy);

  try {
    // 显式传入 agent 配置
    const response = await fetch("https://accounts.google.com/.well-known/openid-configuration", {
      // 注意：在某些 Node 版本中 fetch 的 agent 需通过 dispatcher 传入
      // 但在 NextAuth 环境下，我们主要解决其 Provider 的配置
    });
    
    // 如果 fetch 直接调用依然失败，尝试使用更底层的请求方式确认代理本身是否通畅
    console.log("正在尝试通过代理连接...");
    const { request } = require('undici'); // Next.js 内部使用的库
    const { ProxyAgent } = require('undici');
    
    const client = new ProxyAgent(proxy);
    const { statusCode, body } = await fetch("https://accounts.google.com/.well-known/openid-configuration", {
       dispatcher: client
    });

    console.log("✅ 成功！状态码:", statusCode || (await response).status);
  } catch (error) {
    console.error("❌ 代理连接依然失败:", error.message);
  }
}

test();