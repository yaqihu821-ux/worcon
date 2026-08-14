// @ts-nocheck
import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/gemini", async (req, res): Promise<void> => {
  const apiKey = process.env["GOOGLE_API_KEY"];
  if (!apiKey) {
    res.status(500).json({ error: "GOOGLE_API_KEY is not configured on the server." });
    return;
  }

  const { model, contents, systemInstruction } = req.body as {
    model: string;
    contents: Array<{ role: string; parts: Array<{ text: string }> }>;
    systemInstruction?: { parts: Array<{ text: string }> };
  };

  if (!model || !contents) {
    res.status(400).json({ error: "Missing required fields: model, contents" });
    return;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        ...(systemInstruction ? { systemInstruction } : {}),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      req.log.warn({ status: response.status, data }, "Gemini API error");
      res.status(response.status).json(data);
      return;
    }

    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to proxy Gemini request");
    res.status(502).json({ error: "Failed to reach Gemini API" });
  }
});

export default router;
