const UPSTREAM = "https://generativelanguage.googleapis.com";

const HEADERS_A_QUITAR = [
  "host",
  "x-proxy-token",
  "cf-connecting-ip",
  "cf-ipcountry",
  "cf-ray",
  "cf-visitor",
  "x-forwarded-for",
  "x-forwarded-proto",
  "x-real-ip",
  "forwarded",
];

export default {
  async fetch(request, env) {
    if (env.PROXY_TOKEN && request.headers.get("x-proxy-token") !== env.PROXY_TOKEN) {
      return new Response("Forbidden: invalid proxy token", { status: 403 });
    }

    const url = new URL(request.url);
    const target = UPSTREAM + url.pathname + url.search;

    const headers = new Headers(request.headers);
    for (const h of HEADERS_A_QUITAR) headers.delete(h);

    const method = request.method;
    const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();

    return fetch(target, { method, headers, body });
  },
};
