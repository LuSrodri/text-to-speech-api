import fs from "fs";
import path from "path";
import OpenAI from "openai";
import 'dotenv/config';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

const app = express()
app.use(cors())
const openai = new OpenAI();

async function texttospeech(input = "Hello, world!", voice = "alloy") {

  if (!(voice === "alloy" || voice === "echo" || voice === "fable" || voice === "onyx" || voice === "nova" || voice === "shimmer"))
    throw new Error("Invalid voice. Choose one of: alloy, echo, fable, onyx, nova, shimmer");

  try {
    const uid = uuidv4();
    const pathAudio = `./${uid}.mp3`;
    const speechFile = path.resolve(pathAudio);

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: input,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);

    return speechFile;

  } catch (error) {
    throw new Error("Something went wrong. Please try again.");
  }
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/text-to-speech', async (req, res) => {
  try {
    const { input, voice } = req.body;
    const speechFile = await texttospeech(input, voice);
    res.sendFile(speechFile, () => fs.unlink(speechFile, () => {}));
  }
  catch (error) {
    res.status(400).send(error.message);
  }
});

app.listen(process.env.PORT || 3000, (app) => {
  console.log(`Text-to-speech app listening on port ${process.env.PORT || 3000}`);
});