import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { text: "Ask me anything about posts, promos, DMs, or fraud checks." },
        { status: 200 },
      );
    }

    // SIMPLE, DUMB CLASSIFIER FOR NOW — NO REAL AI YET
    const lower = message.toLowerCase();
    let reply: string;

    if (lower.includes("post") || lower.includes("caption")) {
      reply =
        "Sounds like you need content.\n\n" +
        "• Use /daily_post in your dashboard to get: post idea, caption, hashtags, and story prompt.\n" +
        "• Add your city + niche for better results (ex: nail tech in Detroit).\n\n" +
        "Next step: open the dashboard, hit /daily_post, paste in your vibe and city, and post what it gives you.";
    } else if (lower.includes("slow") || lower.includes("empty") || lower.includes("no clients")) {
      reply =
        "You're describing a slow day.\n\n" +
        "• Use /promo when your calendar looks light.\n" +
        "• Include: what service you want to fill, how many slots, and any discount or bonus.\n\n" +
        "Example prompt: /promo - 3 full sets this Friday night, Detroit, want it hype but still classy.\n\n" +
        "Next step: run /promo, post the offer, and share it to your story too.";
    } else if (lower.includes("dm") || lower.includes("how much") || lower.includes("price")) {
      reply =
        "You're asking about DMs and prices.\n\n" +
        "• Use /dm_reply when someone asks how much or are you available?\n" +
        "• Mention your price range and your vibe so LitLabs can answer in your voice.\n\n" +
        "Next step: copy the exact DM you got, paste it after /dm_reply in the AI console, and send the answer it gives you.";
    } else if (
      lower.includes("scam") ||
      lower.includes("fraud") ||
      lower.includes("weird") ||
      lower.includes("overpay")
    ) {
      reply =
        "You're worried about scams — good.\n\n" +
        "• Use /fraud_check anytime a message feels off (overpay, urgent, weird payment method, etc.).\n" +
        "• LitLabs will explain why it might be risky and give you a safe response, or tell you not to respond.\n\n" +
        "Next step: paste that whole message into /fraud_check before you send any money or accept any weird deal.";
    } else if (lower.includes("grow") || lower.includes("bookings") || lower.includes("clients")) {
      reply =
        "You're thinking big picture — growth and bookings.\n\n" +
        "Daily:\n" +
        "• Run /daily_post and actually post it.\n" +
        "• Reply to every real DM with /dm_reply.\n\n" +
        "Slow days:\n" +
        "• Run /promo by noon and post an offer.\n\n" +
        "Safety:\n" +
        "• Run /fraud_check on anything that feels sketchy.\n\n" +
        "Next step: pick 1 platform (IG or TikTok), commit to 1 LitLabs-powered post per day, and use /promo anytime you see empty spots.";
    } else {
      reply =
        "Got you. I'm your LitLabs Assistant.\n\n" +
        "You can ask me things like:\n" +
        "• What should I post today as a [your niche] in [your city]?\n" +
        "• How do I turn this DM into a booking?\n" +
        "• Is this message a scam?\n\n" +
        "General rule:\n" +
        "• /daily_post - content\n" +
        "• /promo - slow-day offers\n" +
        "• /dm_reply - turn talk into bookings\n" +
        "• /fraud_check - keep scammers out\n\n" +
        "Next step: tell me your niche + city + what you're stuck on, and I'll tell you which command to use and how.";
    }

    return NextResponse.json({ text: reply }, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        text:
          "Something glitched on my side. For now, think:\n" +
          "/daily_post for content, /promo for slow days, /dm_reply for DMs, /fraud_check for safety.",
      },
      { status: 200 },
    );
  }
}
