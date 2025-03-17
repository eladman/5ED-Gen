import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'מפתח ה-API של OpenAI לא מוגדר' },
        { status: 500 }
      );
    }
    
    const formData = await req.formData();
    const audioFile = formData.get('file');
    
    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json(
        { error: 'לא סופק קובץ אודיו או שהקובץ אינו תקין' },
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
      { error: "אירעה שגיאה בעיבוד האודיו", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
