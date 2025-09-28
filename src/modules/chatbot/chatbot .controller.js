import { catchError } from "../../middleware/catchError.js";
import { Client } from "@gradio/client";
const chatBot = catchError(async (req, res, next) => {
  let imageBlob = null;
  if (req.files?.image?.[0]) {
    const buffer = req.files.image[0].buffer;
    imageBlob = new Blob([buffer]);
  }
  const client = await Client.connect("Mohamedgodz/final_gradio_chat");
  const result = await client.predict("/predict", {
    image: imageBlob,
    text: req.body.text || "Hello",
  });

  const textResponse = result.data?.[0];
  const audioUrl = result.data?.[1]?.url;

  res.status(201).json({ text: textResponse, audio: audioUrl });
});
export { chatBot };
