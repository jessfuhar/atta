// Proxy de OAuth do GitHub para o admin da atta. (#/admin).
//
// Por que existe: o site é estático (GitHub Pages) e não pode guardar o client secret
// do GitHub App. Este worker é o único lugar que conhece o secret — ele só troca o
// "code" do OAuth por um token de usuário e devolve esse token para o pop-up do admin
// via postMessage. Ele não guarda nada, não tem banco de dados, não vê o conteúdo do site.
//
// Deploy (Cloudflare Workers, plano gratuito):
//   1. npx wrangler init (ou cole este arquivo num Worker criado pelo dashboard)
//   2. wrangler secret put GITHUB_CLIENT_ID
//   3. wrangler secret put GITHUB_CLIENT_SECRET
//   4. wrangler secret put ALLOWED_ORIGIN   (ex.: https://jessfuhar.github.io)
//   5. wrangler deploy
//
// GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET vêm do GitHub App criado pelo dono do repositório
// (ver instruções enviadas separadamente). Nenhum desses valores é inventado aqui.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      return handleAuth(url, env);
    }
    if (url.pathname === '/callback') {
      return handleCallback(url, env);
    }
    return new Response('Not found', { status: 404 });
  },
};

function handleAuth(url, env) {
  const redirectUri = `${url.origin}/callback`;
  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', 'repo');
  return Response.redirect(authorizeUrl.toString(), 302);
}

async function handleCallback(url, env) {
  const code = url.searchParams.get('code');
  const origin = env.ALLOWED_ORIGIN;

  if (!code) {
    return htmlResponse(postMessageHtml(origin, { type: 'atta-admin-auth', error: 'Código de autorização ausente.' }));
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${url.origin}/callback`,
      }),
    });
    const data = await tokenRes.json();

    if (data.error || !data.access_token) {
      return htmlResponse(
        postMessageHtml(origin, { type: 'atta-admin-auth', error: data.error_description || 'Falha ao autenticar com o GitHub.' }),
      );
    }

    return htmlResponse(postMessageHtml(origin, { type: 'atta-admin-auth', token: data.access_token }));
  } catch {
    return htmlResponse(postMessageHtml(origin, { type: 'atta-admin-auth', error: 'Erro ao conversar com o GitHub.' }));
  }
}

function postMessageHtml(origin, payload) {
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');
  return `<!doctype html><html><body>
<script>
  if (window.opener) {
    window.opener.postMessage(${json}, ${JSON.stringify(origin)});
  }
  window.close();
</script>
Pode fechar esta janela.
</body></html>`;
}

function htmlResponse(html) {
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
