import { Router } from "express";
import { requireAuth } from "@clerk/express";
import path from "path";
import fs from "fs";
import { UploadReceiptBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router();

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const uploadsDir = path.resolve(workspaceRoot, "artifacts/api-server/uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

router.post("/receipts/upload", requireAuth(), async (req, res): Promise<void> => {
  const parsed = UploadReceiptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const { imageBase64 } = parsed.data;
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const filename = `receipt-${Date.now()}.jpg`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
    const url = `/api/receipts/files/${filename}`;
    res.json({ url });
  } catch (err) {
    req.log.error({ err }, "Failed to save receipt");
    res.status(500).json({ error: "Failed to upload receipt" });
  }
});

router.get("/receipts/files/:filename", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
  const filename = path.basename(raw);
  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.sendFile(filePath);
});

export default router;
