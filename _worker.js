// _worker.js


async function nginx() {
	return `<!DOCTYPE html>
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
</html>`
}

async function not_found(){
	return `<!DOCTYPE html>
<html>
    <head><title>404 Not Found</title></head>
    <body>
        <h1>404 Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
    </body>
</html>`
}


function replaceUrl(originalUrl, newHost) {
    const parsed = new URL(originalUrl)
    return `${parsed.protocol}//${newHost}${parsed.pathname}${parsed.search}${parsed.hash}`
}


export default {
	async fetch(request, env, ctx) {
		// 原始请求的 URL
		const originalUrl = new URL(request.url);
		// 构建新的 URL（以 https://pypi.org 为前缀）
		const targetUrl = new URL(`https://pypi.org${originalUrl.pathname}${originalUrl.search}`);
		if(targetUrl.toString() === 'https://pypi.org/'){
			// 首页改成一个nginx伪装页
			return new Response(await nginx(), {
				headers: {
					'Content-Type': 'text/html; charset=UTF-8',
				},
			});
		} else if (targetUrl.pathname.startsWith('/simple/')){
			const remoteResponse = await fetch(targetUrl);
			let simple_content = (await remoteResponse.text()).trim();
			if (simple_content.startsWith('<!DOCTYPE html>')) {
				const hrefRegex = /href="(.+?)"/g;
				simple_content = simple_content.replace(hrefRegex, (match, url) => {
				  const newUrl = replaceUrl(url, originalUrl.host)
				  return `href="${newUrl}"`
				})
				// HTML 响应：直接返回原始 HTML
				return new Response(simple_content, {
					status: 200,
					headers: { 'Content-Type': 'text/html' }
				})
			} else {
				// 非 HTML，假定是 JSON 字符串
				simple_content = JSON.parse(simple_content);
				simple_content.files.forEach(file => {
					file.url = replaceUrl(file.url, originalUrl.host)
				});
				return new Response(JSON.stringify(simple_content), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				})
			}
		} else if(targetUrl.pathname.startsWith('/packages/')){
			// 转发请求
			const modifiedRequest = new Request(targetUrl.toString(), {
				method: request.method,
				headers: request.headers,
				body: request.body,
				redirect: 'follow'
			});
			// 获取并返回目标响应
			return fetch(modifiedRequest);
		} else{
			return new Response(await not_found(), {
				headers: {
					'Content-Type': 'text/html; charset=UTF-8',
				},
			});
		}
	}
}

