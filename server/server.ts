import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import OpenAI from "openai";
import { fileURLToPath } from "url";

// Convert ESM import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env locally (Render injects env vars automatically)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const upload = multer();
app.use(cors());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Health check (helps Render confirm service is up)
app.get("/", (req, res) => {
  res.send("✅ Fabric classification server is running");
});

app.post(
  "/classify-fabric",
  upload.single("image"),
  async (req: express.Request & { file?: Express.Multer.File }, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      const imageBase64 = req.file.buffer.toString("base64");

      const response = await client.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Identify the type of fabric in this image." },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
      });

      res.json({ fabric: response.choices[0].message?.content });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to classify fabric" });
    }
  }
);

// ✅ Important: use Render’s PORT, fallback to 3001 locally
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
