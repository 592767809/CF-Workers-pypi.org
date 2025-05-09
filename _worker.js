// _worker.js

export default {
  async fetch(request, env, ctx) {
    // 原始请求的 URL
    const originalUrl = new URL(request.url);

    // 构建新的 URL（以 https://pypi.org 为前缀）
    const targetUrl = new URL(`https://pypi.org${originalUrl.pathname}${originalUrl.search}`);

    // 转发请求
    const modifiedRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow'
    });

    // 获取并返回目标响应
    return fetch(modifiedRequest);
  }
}

