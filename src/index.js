import htmlContent from './game.html.js';

export default {
  async fetch(request, env, ctx) {
    return new Response(htmlContent, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "cache-control": "no-cache",
      },
    });
  },
};
