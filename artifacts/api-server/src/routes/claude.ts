// @ts-nocheck
import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router: IRouter = Router();

router.post("/claude", async (req, res): Promise<void> => {
  const { model, messages, system, max_tokens, stream } = req.body as {
    model: string;
    messages: Array<{ role: string; content: string }>;
    system?: string;
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
      const s = anthropic.messages.stream({
        model,
        messages,
        ...(system ? { system } : {}),
        max_tokens: max_tokens ?? 1000,
      });
      for await (const event of s) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
        }
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err) {
      req.log.error({ err }, "Failed to stream Claude via Replit AI integration");
      res.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
      res.end();
    }
    return;
  }

  try {
    const response = await anthropic.messages.create({
      model,
      messages,
      ...(system ? { system } : {}),
      max_tokens: max_tokens ?? 1000,
    });
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Failed to call Claude via Replit AI integration");
    res.status(502).json({ error: "Failed to reach Claude API" });
  }
});

export default router;
