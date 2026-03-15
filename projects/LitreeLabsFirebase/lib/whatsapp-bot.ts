import { sparkChat, SparkContext } from './spark-bot';

export interface WhatsAppMessage {
  from: string; // Phone number
  to: string; // Business phone number
  body: string;
  timestamp: Date;
  messageId: string;
  mediaUrl?: string;
}

export interface WhatsAppResponse {
  to: string;
  body: string;
  template?: string;
  buttons?: Array<{ id: string; title: string }>;
}

export interface AppointmentSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  available: boolean;
  service?: string;
  duration?: number; // minutes
}

const BUSINESS_HOURS = {
  monday: { open: '09:00', close: '18:00' },
  tuesday: { open: '09:00', close: '18:00' },
  wednesday: { open: '09:00', close: '18:00' },
  thursday: { open: '09:00', close: '18:00' },
  friday: { open: '09:00', close: '18:00' },
  saturday: { open: '10:00', close: '16:00' },
  sunday: { open: 'closed', close: 'closed' },
};

/**
 * WhatsApp Business AI Responder
 * Powered by SPARK bot with appointment booking
 */
export async function handleWhatsAppMessage(
  message: WhatsAppMessage,
  userId: string
): Promise<WhatsAppResponse> {
  const lowerBody = message.body.toLowerCase();

  // Check for appointment keywords
  if (lowerBody.includes('book') || lowerBody.includes('appointment') || lowerBody.includes('schedule')) {
    return handleAppointmentRequest(message, userId);
  }

  // Check for hours/availability
  if (lowerBody.includes('hours') || lowerBody.includes('open') || lowerBody.includes('available')) {
    return handleHoursRequest(message);
  }

  // Check for pricing
  if (lowerBody.includes('price') || lowerBody.includes('cost') || lowerBody.includes('how much')) {
    return handlePricingRequest(message);
  }

  // Use SPARK bot for general inquiries
  const sparkContext: SparkContext = {
    userId,
    conversationHistory: [{ role: 'user', content: message.body }],
  };

  const sparkResponse = await sparkChat(message.body, sparkContext);

  return {
    to: message.from,
    body: sparkResponse.message,
    buttons: sparkResponse.suggestedActions?.slice(0, 3).map((action, idx) => ({
      id: `btn_${idx}`,
      title: action.substring(0, 20), // WhatsApp button limit
    })),
  };
}

/**
 * Handle appointment booking requests
 */
async function handleAppointmentRequest(
  message: WhatsAppMessage,
  userId: string
): Promise<WhatsAppResponse> {
  const availableSlots = await getAvailableSlots(userId, 7); // Next 7 days

  if (availableSlots.length === 0) {
    return {
      to: message.from,
      body: "I'm fully booked for the next week! 😅 But I can add you to my waitlist. Text 'WAITLIST' to join, and I'll notify you when spots open up!",
    };
  }

  // Show next 3 available slots
  const topSlots = availableSlots.slice(0, 3);
  const slotText = topSlots
    .map((slot, idx) => `${idx + 1}. ${formatSlotTime(slot)}`)
    .join('\n');

  return {
    to: message.from,
    body: `I'd love to book you in! 🗓️ Here are my next available times:\n\n${slotText}\n\nReply with the number you prefer (1, 2, or 3), or text 'MORE' for additional times.`,
    buttons: topSlots.map((slot, idx) => ({
      id: `slot_${idx}`,
      title: formatSlotTime(slot).substring(0, 20),
    })),
  };
}

/**
 * Handle business hours requests
 */
async function handleHoursRequest(message: WhatsAppMessage): Promise<WhatsAppResponse> {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayHours = BUSINESS_HOURS[today as keyof typeof BUSINESS_HOURS];

  let hoursText = `📍 My Business Hours:\n\n`;
  
  Object.entries(BUSINESS_HOURS).forEach(([day, hours]) => {
    const isToday = day === today;
    const dayName = day.charAt(0).toUpperCase() + day.slice(1);
    const hoursStr = hours.open === 'closed' ? 'Closed' : `${hours.open} - ${hours.close}`;
    hoursText += `${isToday ? '👉 ' : ''}${dayName}: ${hoursStr}\n`;
  });

  if (todayHours.open === 'closed') {
    hoursText += `\nI'm closed today, but I'm available tomorrow! Want to book ahead?`;
  } else {
    hoursText += `\nI'm open today until ${todayHours.close}! Want to book an appointment?`;
  }

  return {
    to: message.from,
    body: hoursText,
    buttons: [
      { id: 'btn_book', title: 'Book Now' },
      { id: 'btn_call', title: 'Call Me' },
    ],
  };
}

/**
 * Handle pricing requests
 */
async function handlePricingRequest(
  message: WhatsAppMessage
): Promise<WhatsAppResponse> {
  // TODO: Fetch actual pricing from Firestore user settings
  const defaultPricing = [
    { service: 'Haircut', price: 35 },
    { service: 'Haircut + Beard', price: 50 },
    { service: 'Beard Trim', price: 20 },
    { service: 'Hot Towel Shave', price: 30 },
  ];

  let pricingText = `💰 My Pricing:\n\n`;
  defaultPricing.forEach(item => {
    pricingText += `• ${item.service}: $${item.price}\n`;
  });

  pricingText += `\nAll services include a consultation and styling tips! Want to book?`;

  return {
    to: message.from,
    body: pricingText,
    buttons: [
      { id: 'btn_book', title: 'Book Now' },
      { id: 'btn_more', title: 'More Services' },
    ],
  };
}

/**
 * Get available appointment slots
 */
async function getAvailableSlots(
  userId: string,
  daysAhead: number
): Promise<AppointmentSlot[]> {
  // TODO: Integrate with actual booking system (Firestore)
  // For now, generate mock slots

  const slots: AppointmentSlot[] = [];
  const today = new Date();

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const hours = BUSINESS_HOURS[dayName as keyof typeof BUSINESS_HOURS];

    if (hours.open === 'closed') continue;

    // Generate slots every hour
    const openHour = parseInt(hours.open.split(':')[0]);
    const closeHour = parseInt(hours.close.split(':')[0]);

    for (let hour = openHour; hour < closeHour; hour++) {
      slots.push({
        date: date.toISOString().split('T')[0],
        time: `${hour.toString().padStart(2, '0')}:00`,
        available: Math.random() > 0.3, // 70% available for demo
        duration: 60,
      });
    }
  }

  return slots.filter(slot => slot.available);
}

/**
 * Format slot time for display
 */
function formatSlotTime(slot: AppointmentSlot): string {
  const date = new Date(`${slot.date}T${slot.time}`);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  
  return `${dayName}, ${monthDay} at ${time}`;
}

/**
 * Send WhatsApp message via Business API
 */
export async function sendWhatsAppMessage(
  to: string,
  body: string,
  buttons?: Array<{ id: string; title: string }>
): Promise<boolean> {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    console.error('WhatsApp credentials not configured');
    return false;
  }

  try {
    const messageData: any = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    };

    // Add interactive buttons if provided
    if (buttons && buttons.length > 0) {
      messageData.type = 'interactive';
      messageData.interactive = {
        type: 'button',
        body: { text: body },
        action: {
          buttons: buttons.map(btn => ({
            type: 'reply',
            reply: {
              id: btn.id,
              title: btn.title,
            },
          })),
        },
      };
      delete messageData.text;
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('WhatsApp send error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('WhatsApp API error:', error);
    return false;
  }
}

/**
 * Verify WhatsApp webhook signature
 */
export function verifyWhatsAppWebhook(): boolean {
  const WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('WhatsApp webhook secret not configured');
    return false;
  }

  // TODO: Implement HMAC SHA256 signature verification
  // const crypto = require('crypto');
  // const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  // const digest = hmac.update(payload).digest('hex');
  // return digest === signature;

  return true; // Temporary for testing
}

/**
 * Parse WhatsApp webhook event
 */
export function parseWhatsAppWebhook(body: any): WhatsAppMessage | null {
  try {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) return null;

    return {
      from: message.from,
      to: change.value.metadata.phone_number_id,
      body: message.text?.body || '',
      timestamp: new Date(parseInt(message.timestamp) * 1000),
      messageId: message.id,
      mediaUrl: message.image?.url || message.video?.url,
    };
  } catch (error) {
    console.error('WhatsApp webhook parse error:', error);
    return null;
  }
}

/**
 * Check if user has WhatsApp add-on subscription
 */
export async function hasWhatsAppSubscription(): Promise<boolean> {
  // TODO: Check user's subscription in Firestore
  // For now, return true for testing
  return true;
}

/**
 * Track WhatsApp message usage
 */
export async function trackWhatsAppUsage(
  userId: string,
  messageCount: number
): Promise<void> {
  // TODO: Store analytics in Firestore
  console.log(`WhatsApp usage tracked: ${userId} sent ${messageCount} messages`);
}
