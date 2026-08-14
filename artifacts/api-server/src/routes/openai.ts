// @ts-nocheck
import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/openai", async (req, res): Promise<void> => {
  const apiKey = process.env["GROQ_API_KEY"] ?? process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    res.status(500).json({ error: "GROQ_API_KEY is not configured on the server." });
    return;
  }

  const { model, messages, max_tokens, stream } = req.body as {
    model: string;
    messages: Array<{ role: string; content: string }>;
    max_tokens?: number;
    stream?: boolean;
  };

  if (!model || !messages) {
    res.status(400).json({ error: "Missing required fields: model, messages" });
    return;
  }

  if (stream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, max_tokens: max_tokens ?? 1000, stream: true }),
      });

      if (!groqRes.ok || !groqRes.body) {
        const data = await groqRes.json().catch(() => ({}));
        req.log.warn({ status: groqRes.status, data }, "Groq stream error");
        res.write(`data: ${JSON.stringify({ error: "Groq API error" })}\n\n`);
        res.end();
        return;
      }

      const reader = groqRes.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") { res.write(`data: ${JSON.stringify({ done: true })}\n\n`); continue; }
          try {
            const parsed = JSON.parse(payload);
            const content = parsed?.choices?.[0]?.delta?.content;
            if (typeof content === "string" && content.length > 0) {
              res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
            }
          } catch { /* skip malformed */ }
        }
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err) {
      req.log.error({ err }, "Failed to stream Groq request");
      res.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
      res.end();
    }
    return;
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, max_tokens: max_tokens ?? 1000 }),
    });

    const data = await response.json();
    if (!response.ok) {
      req.log.warn({ status: response.status, data }, "Groq API error");
      res.status(response.status).json(data);
      return;
    }
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to proxy Groq request");
    res.status(502).json({ error: "Failed to reach Groq API" });
  }
});

export default router;
