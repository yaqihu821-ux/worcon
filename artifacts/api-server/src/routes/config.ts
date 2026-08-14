import { Router, type IRouter } from "express";

const router: IRouter = Router();

/** 前端 Supabase 初始化所需的公开配置（anon key 本身设计为可暴露给浏览器） */
router.get("/supabase-config", (_req, res) => {
  const url = process.env["SUPABASE_URL"];
  const anonKey = process.env["SUPABASE_ANON_KEY"];
  if (!url || !anonKey) {
    res.status(500).json({ error: "Supabase is not configured on the server." });
    return;
  }
  res.json({ url, anonKey });
});

export default router;
