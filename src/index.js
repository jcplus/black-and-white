import htmlContent from './game.html.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API: 获取排行榜
    if (url.pathname === '/api/leaderboard' && request.method === 'GET') {
      try {
        if (!env.BLACK_AND_WHITE_LEADERBOARD_KV) {
          throw new Error("KV binding not found");
        }
        const data = await env.BLACK_AND_WHITE_LEADERBOARD_KV.get("leaderboard");
        const list = data ? JSON.parse(data) : [];
        return new Response(JSON.stringify(list), {
          headers: {
            "content-type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        console.error("KV Read Error:", error);
        return new Response(JSON.stringify({ error: "DATABASE_UNAVAILABLE", message: "排行榜服务暂时不可用（可能已达到每日限额）" }), {
          status: 503,
          headers: { "content-type": "application/json;charset=UTF-8" },
        });
      }
    }

    // API: 提交新纪录
    if (url.pathname === '/api/leaderboard' && request.method === 'POST') {
      try {
        if (!env.BLACK_AND_WHITE_LEADERBOARD_KV) {
          throw new Error("KV binding not found");
        }

        const ip = request.headers.get("CF-Connecting-IP") || "127.0.0.1";
        const todayStr = new Date().toISOString().split('T')[0];
        const rateKey = `rate:${ip}:${todayStr}`;

        // 1. 检查 IP 限制次数 (每个 IP 每天 10 次)
        const rateVal = await env.BLACK_AND_WHITE_LEADERBOARD_KV.get(rateKey);
        const currentRateCount = rateVal ? parseInt(rateVal, 10) : 0;

        if (currentRateCount >= 10) {
          return new Response(JSON.stringify({
            error: "RATE_LIMIT_EXCEEDED",
            message: "您今天已提交 10 次记录，请明天再试哦！"
          }), {
            status: 429,
            headers: { "content-type": "application/json;charset=UTF-8" },
          });
        }

        // 2. 解析请求参数
        const { name, score } = await request.json();
        if (typeof score !== 'number' || score <= 0) {
          return new Response(JSON.stringify({ error: "INVALID_SCORE", message: "无效的分数" }), {
            status: 400,
            headers: { "content-type": "application/json;charset=UTF-8" },
          });
        }

        const cleanName = (name || "无名小英雄").substring(0, 10);

        // 3. 获取现有排行榜，验证分数是否足够进入前十
        const data = await env.BLACK_AND_WHITE_LEADERBOARD_KV.get("leaderboard");
        let list = data ? JSON.parse(data) : [];

        const isQualifying = list.length < 10 || score > list[list.length - 1].score;

        if (!isQualifying) {
          return new Response(JSON.stringify({
            error: "NOT_QUALIFIED",
            message: "分数未进入全球前 10 名，继续加油！"
          }), {
            status: 200,
            headers: { "content-type": "application/json;charset=UTF-8" },
          });
        }

        // 4. 更新排行榜
        list.push({
          name: cleanName,
          score,
          date: new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })
        });
        list.sort((a, b) => b.score - a.score);
        list = list.slice(0, 10);

        // 5. 保存排行榜及更新 IP 提交次数 (24小时过期)
        await env.BLACK_AND_WHITE_LEADERBOARD_KV.put("leaderboard", JSON.stringify(list));
        await env.BLACK_AND_WHITE_LEADERBOARD_KV.put(rateKey, (currentRateCount + 1).toString(), { expirationTtl: 86400 });

        return new Response(JSON.stringify({ success: true, leaderboard: list }), {
          headers: {
            "content-type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        console.error("KV Write Error:", error);
        return new Response(JSON.stringify({ error: "DATABASE_UNAVAILABLE", message: "排行榜服务暂时不可用（可能已达到每日限额）" }), {
          status: 503,
          headers: { "content-type": "application/json;charset=UTF-8" },
        });
      }
    }

    return new Response(htmlContent, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "cache-control": "no-cache",
      },
    });
  },
};
