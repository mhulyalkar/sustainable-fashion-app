import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// Load .env only in local dev (Render provides env vars automatically)
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
const upload = multer();
app.use(cors());

// Create OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

      res.json({ fabric: response.choices[0].message.content });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to classify fabric" });
    }
  }
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
