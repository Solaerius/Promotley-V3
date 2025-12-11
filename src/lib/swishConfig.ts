// Swish configuration for Promotely
export const SWISH_CONFIG = {
  // Swish phone number (format: 123XXXXXXX without country code prefix)
  phoneNumber: "0721511376", // TODO: Replace with actual Swish number

  // Payee alias format for QR code (format: +46XXXXXXXXX or 123XXXXXXX)
  payeeAlias: "+46721511376", // TODO: Replace with actual Swish number

  // Company name for messages
  companyName: "Promotely UF",
};

// Plan configurations
export const SWISH_PLANS = {
  starter: {
    name: "UF Starter",
    price: 29,
    credits: 50,
    model: "gpt-4o-mini",
    features: [
      "AI-modell: GPT-4o Mini",
      "50 AI-krediter per månad",
      "Enkel strategi (2 poster/vecka)",
      "3 branschtips per månad",
      "Grundläggande UF-vägledning",
    ],
  },
  growth: {
    name: "UF Growth",
    price: 49,
    credits: 100,
    model: "gpt-4.1-mini",
    features: [
      "AI-modell: GPT-4.1 Mini",
      "100 AI-krediter per månad",
      "Personlig innehållskalender",
      "5 content-idéer per vecka",
      "Enkel prestandaanalys",
    ],
  },
  pro: {
    name: "UF Pro",
    price: 99,
    credits: 300,
    model: "gpt-5.1",
    features: [
      "AI-modell: GPT-5.1 (senaste)",
      "300 AI-krediter per månad",
      "Komplett strategi + kalender",
      "Creative Mode (fri AI-generering)",
      "Konkurrentanalys inkluderad",
      "Premium rapporter & insikter",
    ],
  },
} as const;

export type SwishPlanType = keyof typeof SWISH_PLANS;

// Generate order ID
export function generateOrderId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "PM-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate Swish message
export function generateSwishMessage(planName: string, orderId: string): string {
  return `${SWISH_CONFIG.companyName} – ${planName} – ${orderId}`;
}

// Generate Swish QR code data (Swedish Swish format)
// Format: C{payee};{amount};{message};1
export function generateSwishQRData(amount: number, message: string): string {
  // Swish QR code format for payments
  // Uses the mobile BankID Swish format
  const payee = SWISH_CONFIG.payeeAlias;
  const encodedMessage = encodeURIComponent(message);

  // Standard Swish QR format
  return `C${payee};${amount};${encodedMessage};1`;
}
