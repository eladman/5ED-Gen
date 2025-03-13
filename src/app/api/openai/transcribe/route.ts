import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('file');
    
    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json(
        { error: 'No audio file provided or invalid file' },
        { status: 400 }
      );
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    return NextResponse.json(transcription);
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      { error: "Error processing audio", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
