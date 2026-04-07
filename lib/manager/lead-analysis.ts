import type { LeadAnalysis, LeadItem } from "./types";

/* -------------------------------------------------------------------------- */
/* Keyword maps                                                                */
/* -------------------------------------------------------------------------- */

const BUSINESS_TYPES: Record<string, string[]> = {
  "Restaurant / Food": [
    "restaurant", "cafe", "bistro", "catering", "food", "dining", "eatery",
    "bakery", "pizza", "sushi", "bar", "brewery", "winery", "food truck",
  ],
  "Photography / Creative": [
    "photography", "photographer", "photo", "portrait", "wedding photography",
    "studio", "creative", "filmmaker", "videographer",
  ],
  "Law Firm": ["law firm", "attorney", "lawyer", "legal", "litigation", "law office"],
  "Medical / Dental": [
    "dental", "dentist", "medical", "clinic", "doctor", "healthcare",
    "orthodontist", "dermatology", "optometry", "chiropractor", "veterinary",
  ],
  "Real Estate": ["real estate", "realtor", "property", "homes", "mortgage", "rental", "realty"],
  "Construction / Trades": [
    "construction", "contractor", "builder", "plumbing", "electrical",
    "roofing", "hvac", "landscaping", "interior design", "architecture",
  ],
  "Retail / E-commerce": [
    "shop", "store", "boutique", "sell", "products", "e-commerce",
    "ecommerce", "merchandise", "clothing", "fashion", "jewelry",
  ],
  "Consulting / Professional Services": [
    "consulting", "consultant", "advisory", "coaching", "strategy",
    "accounting", "financial", "insurance", "marketing agency",
  ],
  "Fitness / Wellness": [
    "gym", "fitness", "yoga", "personal trainer", "wellness", "health",
    "spa", "pilates", "crossfit", "martial arts",
  ],
  "Salon / Beauty": [
    "salon", "barbershop", "hair", "nail", "beauty", "massage", "esthetics",
  ],
  "Tech / Software / Startup": [
    "software", "saas", "app", "tech", "startup", "platform", "digital",
    "ai", "machine learning", "mobile app",
  ],
  "Non-profit / Organization": [
    "non-profit", "nonprofit", "charity", "foundation", "organization", "association",
  ],
  "Education": [
    "school", "university", "tutoring", "coaching", "academy", "courses",
    "training", "education", "learning",
  ],
  "Events / Entertainment": [
    "events", "wedding", "entertainment", "venue", "music", "band", "dj",
    "event planning", "party",
  ],
};

const SECTION_KEYWORDS: Record<string, string[]> = {
  "Portfolio / Work Gallery": [
    "portfolio", "gallery", "work", "projects", "case studies", "showcase", "samples",
  ],
  "Services Page": ["services", "offerings", "what we do", "solutions", "packages", "what i do"],
  "About / Team": ["about", "team", "our story", "who we are", "staff", "meet the"],
  "Testimonials / Reviews": [
    "testimonials", "reviews", "client feedback", "ratings", "what clients say",
  ],
  "Blog / News": ["blog", "articles", "news", "posts", "content", "insights"],
  "Online Store": [
    "shop", "store", "buy", "purchase", "cart", "product page", "online selling",
  ],
  "Pricing / Packages": [
    "pricing", "packages", "plans", "rates", "cost", "how much", "fees",
  ],
  "FAQ Section": ["faq", "frequently asked", "questions", "q&a", "answers"],
  "Contact / Booking Form": [
    "contact", "booking", "appointment", "schedule", "get in touch", "inquiry form",
  ],
  "Events / Calendar": ["events", "calendar", "schedule", "upcoming events", "classes"],
  "Menu": ["menu", "food menu", "specials", "our menu"],
  "Video / Media": ["video", "videos", "media", "film", "reel", "showreel"],
  "Photo Gallery": ["photo gallery", "image gallery", "lightbox", "photos"],
  "Map / Location": ["map", "location", "directions", "find us", "address"],
  "Team / Staff": ["team members", "staff", "meet the team", "our experts"],
  "Before / After": ["before and after", "before/after", "transformations", "results"],
};

const FEATURE_KEYWORDS: Record<string, string[]> = {
  "Mobile-Optimized": ["mobile", "responsive", "phone", "smartphone", "mobile-friendly"],
  "Fast Loading": ["fast", "speed", "quick", "performance", "load time", "instant"],
  "SEO Optimized": [
    "seo", "search engine", "rank", "google", "organic", "search visibility",
  ],
  "Online Booking System": [
    "booking", "appointments", "scheduling", "reserve", "calendar integration", "book online",
  ],
  "E-commerce / Payments": [
    "payment", "stripe", "paypal", "checkout", "buy online", "sell online",
    "online store", "shopping cart",
  ],
  "Contact Form": ["contact form", "inquiry form", "get a quote", "lead form"],
  "Newsletter / Email Signup": [
    "newsletter", "email list", "subscribe", "mailchimp", "mailing list",
  ],
  "Social Media Integration": [
    "social media", "instagram", "facebook", "tiktok", "social", "linkedin",
  ],
  "Live Chat": ["live chat", "chat support", "chatbot", "instant messaging"],
  "Multilingual": ["multilingual", "multiple languages", "spanish", "french", "bilingual"],
  "Analytics / Tracking": ["analytics", "tracking", "google analytics", "metrics"],
  "Easy CMS / Self-Update": [
    "cms", "content management", "update myself", "easy to update", "self-manage",
    "wordpress", "edit content", "manage content",
  ],
  "Client Portal / Login": [
    "portal", "login", "client area", "dashboard", "members area", "password protected",
  ],
  "Reviews / Testimonials Widget": [
    "google reviews", "yelp", "trust pilot", "review widget", "star rating",
  ],
  "Pop-ups / Lead Capture": [
    "pop-up", "popup", "lead capture", "exit intent", "opt-in",
  ],
};

const STYLE_KEYWORDS: Record<string, string[]> = {
  "Modern / Contemporary": ["modern", "contemporary", "current", "up to date"],
  "Minimal / Clean": ["minimal", "minimalist", "clean", "simple", "uncluttered"],
  "Professional / Corporate": ["professional", "corporate", "formal", "business-like"],
  "Bold / Impactful": ["bold", "strong", "impactful", "striking", "eye-catching"],
  "Elegant / Luxury": ["elegant", "sophisticated", "luxury", "high-end", "premium", "upscale"],
  "Playful / Creative": ["fun", "playful", "vibrant", "colorful", "creative", "unique"],
  "Dark / Moody": ["dark", "dark mode", "dark theme", "moody", "dramatic"],
  "Light / Airy": ["light", "airy", "bright", "white space", "open"],
  "Nature / Organic": ["natural", "organic", "earthy", "green", "eco", "sustainable"],
  "Industrial / Edgy": ["industrial", "edgy", "grungy", "raw", "urban"],
};

const COLOR_MENTIONS: Record<string, string[]> = {
  "Blue / Navy": ["blue", "navy", "cobalt", "ocean", "royal blue"],
  "Green / Teal": ["green", "teal", "emerald", "mint", "sage"],
  "Red / Orange": ["red", "orange", "coral", "crimson", "rust"],
  "Purple / Violet": ["purple", "violet", "lavender", "indigo"],
  "Black / Dark Tones": ["black", "charcoal", "dark grey", "onyx"],
  "Gold / Yellow": ["gold", "yellow", "amber", "champagne"],
  "White / Cream": ["white", "cream", "ivory", "off-white"],
  "Brand Colors": ["brand colors", "brand palette", "match our logo", "existing colors"],
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function extractMatches(text: string, keywords: Record<string, string[]>): string[] {
  const lower = text.toLowerCase();
  return Object.entries(keywords)
    .filter(([, kws]) => kws.some((kw) => lower.includes(kw)))
    .map(([label]) => label);
}

function extractBusinessType(text: string): string {
  const lower = text.toLowerCase();
  const matches = Object.entries(BUSINESS_TYPES).filter(([, kws]) =>
    kws.some((kw) => lower.includes(kw)),
  );
  return matches[0]?.[0] ?? "General Business";
}

function extractBudgetFromNotes(notes: string): string {
  // Check for Budget: marker set by contact form
  const budgetMatch = notes.match(/Budget:\s*([^\n]+)/);
  if (budgetMatch) return budgetMatch[1].trim();

  const lower = notes.toLowerCase();
  if (lower.includes("$50,000") || lower.includes("50k") || lower.includes("50,000")) return "$50,000+";
  if (lower.includes("$25,000") || lower.includes("25k")) return "~$25,000";
  if (lower.includes("$15,000") || lower.includes("15k")) return "~$15,000";
  if (lower.includes("$10,000") || lower.includes("10k")) return "~$10,000";
  if (lower.includes("$5,000") || lower.includes("5k")) return "~$5,000";
  if (lower.includes("$2,000") || lower.includes("2k")) return "~$2,000";
  if (lower.includes("$1,000") || lower.includes("1k")) return "~$1,000";
  if (lower.includes("low budget") || lower.includes("cheap") || lower.includes("affordable")) return "Budget-conscious";
  if (lower.includes("no budget") || lower.includes("free")) return "Minimal";
  return "Not specified";
}

function extractUrgency(notes: string): string {
  const lower = notes.toLowerCase();
  if (lower.includes("asap") || lower.includes("urgent") || lower.includes("immediately") || lower.includes("right away")) return "ASAP";
  if (lower.includes("next week") || lower.includes("this week") || lower.includes("few days")) return "This week";
  if (lower.includes("next month") || lower.includes("few weeks") || lower.includes("by end of month")) return "1–2 months";
  if (lower.includes("3 months") || lower.includes("three months") || lower.includes("quarter")) return "2–3 months";
  if (lower.includes("no rush") || lower.includes("whenever") || lower.includes("not urgent")) return "No rush";
  return "Standard";
}

function buildSummary(
  lead: Pick<LeadItem, "name" | "business">,
  businessType: string,
  sections: string[],
  features: string[],
): string {
  const sectionStr =
    sections.length > 0
      ? `sections including ${sections.slice(0, 3).join(", ")}`
      : "a complete web presence";
  const featureStr =
    features.length > 0 ? ` with ${features.slice(0, 2).join(" and ")}` : "";
  return `${lead.name} from ${lead.business} is requesting a ${businessType.toLowerCase()} website with ${sectionStr}${featureStr}. Review their project details and follow up within 24 hours.`;
}

function buildKeyPoints(
  lead: Pick<LeadItem, "name" | "business" | "phone">,
  businessType: string,
  sections: string[],
  features: string[],
  style: string[],
  budget: string,
  urgency: string,
): string[] {
  const points: string[] = [];

  if (businessType !== "General Business") {
    points.push(`Business type: ${businessType}`);
  }
  if (sections.length > 0) {
    points.push(`Requested sections: ${sections.slice(0, 5).join(", ")}`);
  }
  if (features.length > 0) {
    points.push(`Key features wanted: ${features.slice(0, 4).join(", ")}`);
  }
  if (style.length > 0) {
    points.push(`Style direction: ${style.slice(0, 3).join(", ")}`);
  }
  if (budget && budget !== "Not specified") {
    points.push(`Budget: ${budget}`);
  }
  if (urgency !== "Standard") {
    points.push(`Timeline: ${urgency}`);
  }
  if (lead.phone) {
    points.push(`Call: ${lead.phone}`);
  }

  if (points.length === 0) {
    points.push(`New inquiry from ${lead.name} at ${lead.business}. Review full notes for details.`);
  }

  return points;
}

/* -------------------------------------------------------------------------- */
/* Main export                                                                 */
/* -------------------------------------------------------------------------- */

export function analyzeLead(lead: Pick<LeadItem, "name" | "business" | "email" | "phone" | "notes" | "source">): LeadAnalysis {
  const fullText = `${lead.business} ${lead.notes}`;

  const businessType = extractBusinessType(fullText);
  const sections = extractMatches(fullText, SECTION_KEYWORDS);
  const features = extractMatches(fullText, FEATURE_KEYWORDS);
  const style = extractMatches(fullText, STYLE_KEYWORDS);
  const colors = extractMatches(fullText, COLOR_MENTIONS);
  const budget = extractBudgetFromNotes(lead.notes);
  const urgency = extractUrgency(lead.notes);

  const keyPoints = buildKeyPoints(lead, businessType, sections, features, style, budget, urgency);
  const summary = buildSummary(lead, businessType, sections, features);

  return {
    analyzedAt: new Date().toISOString(),
    summary,
    businessType,
    sections,
    features,
    style: [...style, ...colors].slice(0, 6),
    budget,
    urgency,
    keyPoints,
  };
}

/* -------------------------------------------------------------------------- */
/* Mockup HTML generator                                                       */
/* -------------------------------------------------------------------------- */

/** Ordered list of sections to show in the mockup wireframe. */
const SECTION_ORDER = [
  "Header / Navigation",
  "Hero / Banner",
  "Services Page",
  "Portfolio / Work Gallery",
  "About / Team",
  "Testimonials / Reviews",
  "Pricing / Packages",
  "Online Store",
  "Blog / News",
  "FAQ Section",
  "Events / Calendar",
  "Menu",
  "Video / Media",
  "Photo Gallery",
  "Map / Location",
  "Contact / Booking Form",
  "Footer",
];

function pickColorScheme(style: string[]): { bg: string; accent: string; accent2: string; text: string } {
  const styleStr = style.join(" ").toLowerCase();
  if (styleStr.includes("dark")) return { bg: "#1a1a2e", accent: "#e94560", accent2: "#0f3460", text: "#eee" };
  if (styleStr.includes("nature") || styleStr.includes("green")) return { bg: "#f9fafb", accent: "#2d6a4f", accent2: "#52b788", text: "#1b4332" };
  if (styleStr.includes("gold") || styleStr.includes("luxury") || styleStr.includes("elegant")) return { bg: "#fafaf8", accent: "#b8860b", accent2: "#8b6914", text: "#2c2c2c" };
  if (styleStr.includes("purple")) return { bg: "#faf8ff", accent: "#6d28d9", accent2: "#4c1d95", text: "#1e1b4b" };
  if (styleStr.includes("red") || styleStr.includes("bold")) return { bg: "#fff8f7", accent: "#dc2626", accent2: "#991b1b", text: "#1c0e0e" };
  if (styleStr.includes("minimal") || styleStr.includes("clean")) return { bg: "#ffffff", accent: "#171717", accent2: "#404040", text: "#171717" };
  // Default: professional blue
  return { bg: "#f8fafc", accent: "#183153", accent2: "#2563eb", text: "#0f172a" };
}

function sectionBlock(title: string, color: { accent: string; accent2: string; text: string }, index: number, isSpecial: boolean): string {
  const heights = [220, 160, 180, 200, 140, 170, 150];
  const h = heights[index % heights.length];
  const isHero = title === "Hero / Banner";
  const isHeader = title === "Header / Navigation";
  const isFooter = title === "Footer";
  const isContact = title === "Contact / Booking Form";
  const isGallery = title === "Portfolio / Work Gallery" || title === "Photo Gallery";

  if (isHeader) {
    return `
      <div style="background:${color.accent};color:#fff;padding:14px 32px;display:flex;align-items:center;justify-content:space-between;border-radius:8px 8px 0 0;margin-bottom:4px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:32px;height:32px;background:rgba(255,255,255,0.25);border-radius:6px"></div>
          <span style="font-weight:700;font-size:15px;letter-spacing:0.02em">LOGO</span>
        </div>
        <div style="display:flex;gap:20px;font-size:12px;opacity:0.85">
          <span>Home</span><span>About</span><span>Services</span><span>Contact</span>
        </div>
        <div style="background:rgba(255,255,255,0.2);padding:6px 14px;border-radius:6px;font-size:12px;font-weight:600">Get a Quote</div>
      </div>`;
  }

  if (isHero) {
    return `
      <div style="background:linear-gradient(135deg,${color.accent},${color.accent2});color:#fff;padding:56px 32px;text-align:center;margin-bottom:4px;border-radius:4px">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;opacity:0.7;margin-bottom:10px">— HERO SECTION —</div>
        <div style="font-size:28px;font-weight:800;margin-bottom:10px;line-height:1.2">Your Compelling<br>Headline Here</div>
        <div style="font-size:13px;opacity:0.8;margin-bottom:24px;max-width:440px;margin-left:auto;margin-right:auto">Supporting subheading that explains the key value proposition and encourages visitors to take action.</div>
        <div style="display:flex;justify-content:center;gap:12px">
          <div style="background:#fff;color:${color.accent};padding:10px 24px;border-radius:6px;font-size:13px;font-weight:700">Get Started</div>
          <div style="background:rgba(255,255,255,0.15);color:#fff;padding:10px 24px;border-radius:6px;font-size:13px;font-weight:600;border:1px solid rgba(255,255,255,0.3)">Learn More</div>
        </div>
      </div>`;
  }

  if (isFooter) {
    return `
      <div style="background:${color.accent};color:#fff;padding:28px 32px;border-radius:0 0 8px 8px;margin-top:4px">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:20px">
          <div><div style="font-weight:700;font-size:13px;margin-bottom:8px">Company</div><div style="font-size:11px;opacity:0.6;line-height:1.8">About · Services<br>Portfolio · Team</div></div>
          <div><div style="font-weight:700;font-size:13px;margin-bottom:8px">Contact</div><div style="font-size:11px;opacity:0.6;line-height:1.8">Phone · Email<br>Address</div></div>
          <div><div style="font-weight:700;font-size:13px;margin-bottom:8px">Follow Us</div><div style="font-size:11px;opacity:0.6;line-height:1.8">Facebook · Instagram<br>LinkedIn</div></div>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.15);padding-top:14px;font-size:11px;opacity:0.5;text-align:center">© 2025 Your Business. All rights reserved.</div>
      </div>`;
  }

  if (isContact) {
    return `
      <div style="background:#f8fafc;border:2px dashed ${color.accent2};border-radius:8px;padding:28px 32px;margin-bottom:4px">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${color.accent};margin-bottom:12px">— ${title.toUpperCase()} —</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:500px">
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;height:36px;padding:0 12px;display:flex;align-items:center"><span style="font-size:11px;color:#94a3b8">Name</span></div>
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;height:36px;padding:0 12px;display:flex;align-items:center"><span style="font-size:11px;color:#94a3b8">Email</span></div>
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;height:36px;padding:0 12px;display:flex;align-items:center;grid-column:span 2"><span style="font-size:11px;color:#94a3b8">Phone (optional)</span></div>
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;height:72px;grid-column:span 2;padding:10px 12px"><span style="font-size:11px;color:#94a3b8">Message / Project details…</span></div>
        </div>
        <div style="background:${color.accent};color:#fff;padding:10px 24px;border-radius:6px;font-size:13px;font-weight:700;display:inline-block;margin-top:14px">Submit</div>
      </div>`;
  }

  if (isGallery) {
    return `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:24px 32px;margin-bottom:4px">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${color.accent};margin-bottom:16px">— ${title.toUpperCase()} —</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
          ${[1, 2, 3, 4, 5, 6].map((i) => `<div style="background:${color.accent}${18 + i * 8};aspect-ratio:4/3;border-radius:6px;display:flex;align-items:center;justify-content:center"><span style="font-size:10px;color:${color.accent};opacity:0.5">Image ${i}</span></div>`).join("")}
        </div>
      </div>`;
  }

  return `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:${isSpecial ? 32 : 24}px 32px;margin-bottom:4px;min-height:${h}px;display:flex;flex-direction:column;justify-content:center">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${color.accent};margin-bottom:12px">— ${title.toUpperCase()} —</div>
      <div style="height:14px;background:#e2e8f0;border-radius:4px;width:60%;margin-bottom:8px"></div>
      <div style="height:10px;background:#f1f5f9;border-radius:4px;width:85%;margin-bottom:6px"></div>
      <div style="height:10px;background:#f1f5f9;border-radius:4px;width:75%;margin-bottom:20px"></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${[1, 2, 3].map(() => `<div style="background:${color.accent}22;border:1px solid ${color.accent}44;border-radius:6px;padding:10px 16px;flex:1;min-width:80px;height:70px"></div>`).join("")}
      </div>
    </div>`;
}

export function generateMockupHtml(
  lead: Pick<LeadItem, "name" | "business" | "email">,
  analysis: LeadAnalysis,
): string {
  const colors = pickColorScheme(analysis.style);

  // Build the section list
  const requestedSections = new Set(analysis.sections);
  const finalSections: string[] = ["Header / Navigation", "Hero / Banner"];

  // Add requested sections in order
  for (const s of SECTION_ORDER) {
    if (s === "Header / Navigation" || s === "Hero / Banner" || s === "Footer") continue;
    if (requestedSections.size === 0 || requestedSections.has(s)) {
      finalSections.push(s);
    }
  }

  // If nothing specific requested, add defaults
  if (finalSections.length <= 2) {
    finalSections.push("Services Page", "About / Team", "Testimonials / Reviews", "Contact / Booking Form");
  }

  finalSections.push("Footer");

  const sectionsHtml = finalSections
    .map((s, i) => sectionBlock(s, colors, i, i === 1))
    .join("\n");

  const keyPointsHtml = analysis.keyPoints
    .map((p) => `<li style="padding:5px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155">${p}</li>`)
    .join("");

  const sectionTagsHtml = analysis.sections.length
    ? analysis.sections
        .map((s) => `<span style="background:${colors.accent}18;color:${colors.accent};border:1px solid ${colors.accent}33;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600;white-space:nowrap">${s}</span>`)
        .join("")
    : `<span style="background:#f1f5f9;color:#64748b;padding:3px 10px;border-radius:99px;font-size:11px">Standard pages</span>`;

  const featureTagsHtml = analysis.features.length
    ? analysis.features
        .slice(0, 8)
        .map((f) => `<span style="background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600;white-space:nowrap">${f}</span>`)
        .join("")
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wireframe Mockup — ${lead.business}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f1f5f9; color: #1e293b; }
    .page { max-width: 900px; margin: 0 auto; padding: 0; }
    @media print { body { background: #fff; } }
  </style>
</head>
<body>
  <!-- Header bar -->
  <div style="background:${colors.accent};color:#fff;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,0.2)">
    <div style="font-weight:800;font-size:14px;letter-spacing:0.05em">CLEARVIEW DIGITAL — WIREFRAME MOCKUP</div>
    <div style="font-size:11px;opacity:0.7">For: ${lead.business} · ${lead.email}</div>
    <div style="background:rgba(255,255,255,0.2);padding:5px 12px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer" onclick="window.print()">Print / Save PDF</div>
  </div>

  <!-- Brief -->
  <div style="background:#fff;border-bottom:1px solid #e2e8f0;padding:20px 24px">
    <div style="max-width:860px;margin:0 auto;display:flex;gap:24px;flex-wrap:wrap">
      <div style="flex:1;min-width:260px">
        <div style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#94a3b8;margin-bottom:6px">Client Brief</div>
        <div style="font-size:20px;font-weight:800;color:${colors.accent};margin-bottom:4px">${lead.business}</div>
        <div style="font-size:13px;color:#64748b;margin-bottom:10px">${analysis.businessType} · ${lead.name} (${lead.email})</div>
        <div style="font-size:13px;color:#334155;line-height:1.6">${analysis.summary}</div>
      </div>
      <div style="min-width:200px">
        <div style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#94a3b8;margin-bottom:6px">Key Points</div>
        <ul style="list-style:none;padding:0">
          ${keyPointsHtml}
        </ul>
      </div>
    </div>
    <!-- Tags -->
    <div style="max-width:860px;margin:14px auto 0;display:flex;flex-wrap:wrap;gap:6px">
      ${sectionTagsHtml}
    </div>
    ${featureTagsHtml ? `<div style="max-width:860px;margin:8px auto 0;display:flex;flex-wrap:wrap;gap:6px">${featureTagsHtml}</div>` : ""}
  </div>

  <!-- Mockup canvas -->
  <div class="page" style="padding:24px;background:${colors.bg}">
    <div style="max-width:860px;margin:0 auto">
      <div style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#94a3b8;margin-bottom:14px;text-align:center">
        ↓ WEBSITE WIREFRAME — ${finalSections.length - 2} SECTIONS ↓
      </div>
      ${sectionsHtml}
    </div>
  </div>

  <!-- Footer note -->
  <div style="background:#fff;border-top:1px solid #e2e8f0;padding:16px 24px;text-align:center">
    <p style="font-size:11px;color:#94a3b8">
      Wireframe generated by Clearview Digital AI Manager · ${new Date(analysis.analyzedAt).toLocaleString()} ·
      This is a structural layout preview only — final design will reflect your brand and style direction.
    </p>
  </div>
</body>
</html>`;
}
