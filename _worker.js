// _worker.js


async function nginx() {
	const text = `
	<!DOCTYPE html>
	<html>
	<head>
	<title>Welcome to nginx!</title>
	<style>
		body {
			width: 35em;
			margin: 0 auto;
			font-family: Tahoma, Verdana, Arial, sans-serif;
		}
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and
	working. Further configuration is required.</p>
	
	<p>For online documentation and support please refer to
	<a href="http://nginx.org/">nginx.org</a>.<br/>
	Commercial support is available at
	<a href="http://nginx.com/">nginx.com</a>.</p>
	
	<p><em>Thank you for using nginx.</em></p>
	</body>
	</html>
	`
	return text;
}


export default {
  async fetch(request, env, ctx) {
    // 原始请求的 URL
    const originalUrl = new URL(request.url);

    // 构建新的 URL（以 https://pypi.org 为前缀）
    const targetUrl = new URL(`https://pypi.org${originalUrl.pathname}${originalUrl.search}`);
	
	if(targetUrl === 'https://pypi.org/'){
		// 首页改成一个nginx伪装页
		return new Response(await nginx(), {
			headers: {
				'Content-Type': 'text/html; charset=UTF-8',
			},
		});
	}else{
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
}

