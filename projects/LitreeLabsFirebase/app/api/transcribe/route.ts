import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 },
    );
  }

  // Dynamic import to avoid build-time API key requirement
  const OpenAI = (await import("openai")).default;
  const { toFile } = await import("openai/uploads");

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await toFile(buffer, file.name || "audio.webm", {
      type: file.type || "audio/webm",
    });

    const transcription = await client.audio.transcriptions.create({
      file: upload,
      model: "gpt-4o-transcribe",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Unable to transcribe audio right now" },
      { status: 500 },
    );
  }
}
