export interface HelperData {
  slug: string;
  emoji: string;
  name: string;
  tagline: string;
  price: string;
  description: string;
  features: string[];
  conversation: { role: "user" | "ai"; message: string }[];
  faq: { q: string; a: string }[];
  metaDescription: string;
}

export const helperData: Record<string, HelperData> = {
  bookkeeper: {
    slug: "bookkeeper",
    emoji: "💰",
    name: "Bookkeeper",
    tagline: "Know exactly where your money goes.",
    price: "$29/mo",
    description: "Your personal financial tracker — always on, always honest. Bookkeeper keeps tabs on your spending, watches your budget, and gives you plain-English answers when you text in. No spreadsheets, no apps, no confusion.",
    metaDescription: "Bookkeeper AI — your personal financial tracker via SMS. Know your spending, stay on budget, and get plain-English answers the moment you text.",
    features: [
      "Real-time spending tracking across all categories",
      "Budget alerts before you overspend",
      "Monthly summary reports delivered by text",
      "Plain-English answers — no jargon, no charts",
      "Expense category breakdowns on demand",
      "Savings goal tracking and projections",
    ],
    conversation: [
      { role: "user", message: "Am I on track with my budget this month?" },
      { role: "ai", message: "Yes — $2,340 spent of your $3,200 limit. Restaurants are your biggest category at $380. You've got $860 left for the month." },
      { role: "user", message: "What did I spend on food last week?" },
      { role: "ai", message: "Last week you spent $127 on groceries (Walmart + HEB) and $94 at restaurants. Total food: $221. That's a little high — your weekly average is $180." },
      { role: "user", message: "Set a $200 weekly food budget for me" },
      { role: "ai", message: "Done. I'll text you a heads-up when you hit $160 so you have time to adjust. Want me to start tracking from today or the beginning of the week?" },
      { role: "user", message: "From today is fine" },
      { role: "ai", message: "Got it. Budget set: $200/week for food, starting today. I'll flag you at $160. You're currently at $0 this period — fresh start." },
    ],
    faq: [
      { q: "How does Bookkeeper know my spending?", a: "You tell it. Text your purchases as you make them, or do a quick daily recap. The more you share, the smarter it gets." },
      { q: "Does it connect to my bank?", a: "Not yet — that's on the roadmap. Right now it tracks what you tell it, which keeps your bank credentials fully private." },
      { q: "Can it track multiple budgets?", a: "Yes. Food, entertainment, clothing, bills — you can set separate limits for any category and Bookkeeper tracks them all." },
      { q: "What if I forget to log something?", a: "Just text it whenever you remember. Bookkeeper will slot it into the right date and update your totals." },
    ],
  },

  fitcoach: {
    slug: "fitcoach",
    emoji: "🏋️",
    name: "FitCoach",
    tagline: "Your personal trainer, available 24/7.",
    price: "$19/mo",
    description: "A personal trainer in your pocket, available any time of day. FitCoach learns your goals, tracks your workouts, monitors your nutrition, and gives you real coaching — not generic tips. The more you use it, the more it knows about what works for your body.",
    metaDescription: "FitCoach AI — your personal trainer via SMS. Track workouts, hit protein goals, and get real coaching whenever you text. No gym app needed.",
    features: [
      "Personalized workout plans based on your goals and equipment",
      "Daily protein and calorie tracking",
      "Progress check-ins and habit streaks",
      "Rest day recommendations based on your training load",
      "Meal suggestions that fit your macros",
      "Motivational coaching when you need it most",
    ],
    conversation: [
      { role: "user", message: "Did I hit my protein goal today?" },
      { role: "ai", message: "Almost — you're at 142g of 160g. Add a protein shake before bed and you'll nail it. Great job staying consistent this week!" },
      { role: "user", message: "I only have 20 minutes to work out. What should I do?" },
      { role: "ai", message: "Perfect for a quick HIIT circuit: 4 rounds of 45s work / 15s rest — burpees, push-ups, jump squats, mountain climbers. That's 20 min exactly. You'll torch about 250 cal." },
      { role: "user", message: "Skipped the gym again today 😞" },
      { role: "ai", message: "Hey, one day doesn't break progress — 3 workouts this week is still solid. What got in the way? Let's figure out if your schedule needs an adjustment." },
      { role: "user", message: "Just ran out of time" },
      { role: "ai", message: "Got it. Want to try 15-min home workouts for the rest of the week? No equipment needed, fits in any gap in your day. Let's keep the streak alive." },
    ],
    faq: [
      { q: "Do I need gym equipment?", a: "Nope. FitCoach can build you a plan with bodyweight only, basic dumbbells, or a full gym — tell it what you have." },
      { q: "Can it track my calories?", a: "Yes. Text what you ate and FitCoach logs it, calculates your macros, and tells you where you stand vs. your daily target." },
      { q: "What if I'm a beginner?", a: "Perfect starting point. FitCoach starts wherever you are, adjusts difficulty over time, and never makes you feel judged for starting slow." },
      { q: "Can FitCoach help with weight loss?", a: "Absolutely. Set a goal weight and FitCoach will build a caloric target + workout plan that gets you there sustainably." },
    ],
  },

  tutorai: {
    slug: "tutorai",
    emoji: "🇪🇸",
    name: "TutorAI",
    tagline: "Learn Spanish (or any language) by texting.",
    price: "$19/mo",
    description: "Language learning that fits in the cracks of your day. TutorAI teaches you Spanish (or another language of your choice) through real conversation over text. No apps, no streaks to maintain, no awkward lessons — just learning woven into your daily routine.",
    metaDescription: "TutorAI — learn Spanish or any language by texting. Real conversation practice, grammar help, and daily vocabulary. No app needed.",
    features: [
      "Daily vocabulary and phrase lessons sent to you automatically",
      "Instant translation with context and explanation",
      "Conversation practice at whatever level you're at",
      "Grammar corrections without the embarrassment",
      "Cultural context woven into every lesson",
      "Track your progress and level up over time",
    ],
    conversation: [
      { role: "user", message: "¿Cómo se dice 'I'm running late' en español?" },
      { role: "ai", message: "\"Voy con retraso\" (formal) or more casual: \"Llego tarde.\" In Mexico you'd also hear \"Voy a tardar.\" Want to practice using it in a sentence?" },
      { role: "user", message: "Yes, give me a scenario" },
      { role: "ai", message: "You're texting a friend: you were supposed to meet at 3pm but you got stuck in traffic. What would you say? (hint: start with \"Oye...\")" },
      { role: "user", message: "Oye, voy a llegar tarde. Estoy en el trafico" },
      { role: "ai", message: "Great! One small note: it's \"el tráfico\" with an accent mark. Otherwise perfect — natural and correct. Your friend might reply: \"No hay problema, te espero.\" What does that mean?" },
      { role: "user", message: "No problem, I'll wait for you?" },
      { role: "ai", message: "Exactly right! \"No hay problema\" = no problem, \"te espero\" = I'll wait for you. You're getting good at this. Want today's vocab word?" },
    ],
    faq: [
      { q: "Can I learn a language other than Spanish?", a: "Yes. TutorAI supports Spanish, French, Portuguese, German, Italian, Mandarin, Japanese, and more. Just tell it which language when you set up." },
      { q: "What level do I need to be to start?", a: "Complete beginner is perfect. TutorAI starts with basics and adjusts as you improve. It meets you exactly where you are." },
      { q: "How much time do I need each day?", a: "As little as 5 minutes. A few text exchanges per day builds real fluency over time. Consistency beats marathon sessions." },
      { q: "Is it just vocabulary, or real conversation?", a: "Real conversation. TutorAI simulates actual scenarios — ordering food, making plans, workplace situations — so you practice what you'll actually use." },
    ],
  },
};

export function getHelper(slug: string): HelperData | null {
  return helperData[slug] ?? null;
}

export function getAllSlugs(): string[] {
  return Object.keys(helperData);
}
