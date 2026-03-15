import { NextResponse } from 'next/server';
import { nvidiaChatCompletion, nvidiaImageGeneration, NVIDIA_MODELS } from '../../../lib/nvidia-ai';
import { DEMO_SCRIPTS } from '../../../lib/demo-data';

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages, model, prompt, type } = body;
    const apiKey = process.env.NVIDIA_API_KEY;

    // Check for "Make me a picture" intent if not explicitly set
    const lastMessage = messages?.[messages.length - 1]?.content?.toLowerCase() || '';
    const isImageRequest =
      type === 'image' ||
      model?.id === NVIDIA_MODELS.SDXL ||
      lastMessage.includes('picture') ||
      lastMessage.includes('image') ||
      lastMessage.includes('generate a image') ||
      lastMessage.includes('generate an image');

    if (isImageRequest) {
      if (!apiKey) {
        return NextResponse.json({
          role: 'assistant',
          content: `[SIMULATION] Generating image for: "${lastMessage}"... (Configure NVIDIA_API_KEY for real SDXL generation)`,
          type: 'text', // Fallback to text for now
        });
      }

      try {
        const base64Image = await nvidiaImageGeneration({
          prompt: lastMessage,
          model: NVIDIA_MODELS.SDXL,
        });

        return NextResponse.json({
          role: 'assistant',
          content: `Here is your generated image:`,
          image: `data:image/png;base64,${base64Image}`,
          type: 'image',
        });
      } catch (err) {
        console.error('Image generation failed:', err);
        return NextResponse.json({
          role: 'assistant',
          content: `Failed to generate image: ${err.message}.`,
          type: 'text',
        });
      }
    }

    // Text Chat Logic
    if (!apiKey) {
      console.warn('Missing NVIDIA_API_KEY, returning mock response.');

      // Check if this is likely a News Agent request (social post generation)
      if (lastMessage.includes('social media post') || lastMessage.includes('generate a short')) {
        const randomPost =
          DEMO_SCRIPTS.OFFLINE_POSTS[Math.floor(Math.random() * DEMO_SCRIPTS.OFFLINE_POSTS.length)];
        return NextResponse.json({
          role: 'assistant',
          content: randomPost,
          model: model?.id || 'simulation-mode',
        });
      }

      return NextResponse.json({
        role: 'assistant',
        content: `[SIMULATION MODE] NVIDIA_API_KEY is missing. \n\nI received: "${lastMessage}"\n\nModel: ${model?.name || 'GLM-4'}`,
        model: model?.id,
      });
    }

    const modelId = model?.id || (typeof model === 'string' ? model : NVIDIA_MODELS.GLM_4);

    try {
      const responseContent = await nvidiaChatCompletion({
        model: modelId,
        messages: messages,
        temperature: 0.7, // Increased for more creativity ("sick dope")
        max_tokens: 1024,
      });

      return NextResponse.json({
        role: 'assistant',
        content: responseContent,
        model: modelId,
      });
    } catch (apiError) {
      console.error('NVIDIA API Call Failed:', apiError);

      // Smart Fallback for 403/Quota issues
      if (apiError.message.includes('NVIDIA_ACCESS_DENIED') || apiError.message.includes('403')) {
        // If user asked for the script/overview (or related to the current task)
        if (
          lastMessage.includes('script') ||
          lastMessage.includes('best for') ||
          lastMessage.includes('glm')
        ) {
          return NextResponse.json({
            role: 'assistant',
            content:
              DEMO_SCRIPTS.MODELS_OVERVIEW +
              `\n\n*(Note: Real-time inference failed (403). Using cached studio knowledge.)*`,
            model: model?.id,
          });
        }

        return NextResponse.json({
          role: 'assistant',
          content: `**System Alert:** NVIDIA NIM Access Denied (403). \n\nYour API key appears to be valid but lacks inference credits or verification. \n\n*Falling back to Studio Offline Mode.*\n\nHow can I assist you with your project structure or design instead?`,
          model: model?.id,
        });
      }
      throw apiError;
    }
  } catch (error) {
    console.error('Cortex API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 },
    );
  }
}
