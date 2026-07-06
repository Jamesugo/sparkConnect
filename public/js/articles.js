/**
 * SparkConnect Article Registry
 * ─────────────────────────────
 * To schedule a new article:
 *   1. Write the article HTML page and save it to /public/
 *   2. Add a new entry to the ARTICLES array below
 *   3. Set publishDate to the future date you want it to go live (YYYY-MM-DD)
 *   4. That's it — it will appear automatically on the home page on that date.
 *
 * Fields:
 *   id            - unique slug for the article
 *   title         - article title shown on the card
 *   excerpt       - short description shown on the card
 *   category      - label text (e.g. "HOME SAFETY")
 *   categoryColor - text colour for the badge
 *   categoryBg    - background colour for the badge
 *   readTime      - e.g. "4 min read"
 *   publishDate   - "YYYY-MM-DD" — article is hidden until this date
 *   url           - filename of the article page (relative to /public/)
 *   heroGradient  - CSS gradient for the card header
 *   glowColor     - rgba used for hover box-shadow glow
 *   svgIcon       - raw SVG string for the card header icon
 */

const ARTICLES = [

  // ── Published Articles ───────────────────────────────────────────────────
  {
    id: "rewire",
    title: "5 Signs You Need to Rewire Your Home",
    excerpt: "Flickering lights, burning smells, or tripping breakers? These could be warning signs of outdated or dangerous wiring.",
    category: "HOME SAFETY",
    categoryColor: "#0066cc",
    categoryBg: "#e8f0fe",
    readTime: "4 min read",
    publishDate: "2026-07-01",
    url: "article-rewire.html",
    heroGradient: "linear-gradient(135deg, #0066cc, #003d99)",
    glowColor: "rgba(0,102,204,0.18)",
    svgIcon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.95;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
  },
  {
    id: "solar",
    title: "Is Solar Worth It in Nigeria in 2026?",
    excerpt: "With grid instability and rising fuel costs, solar is becoming a smart long-term investment for Nigerian homeowners.",
    category: "SOLAR ENERGY",
    categoryColor: "#b35900",
    categoryBg: "#fff0e0",
    readTime: "6 min read",
    publishDate: "2026-07-04",
    url: "article-solar.html",
    heroGradient: "linear-gradient(135deg, #ff9900, #cc7700)",
    glowColor: "rgba(255,153,0,0.18)",
    svgIcon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.95;"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
  },
  {
    id: "commercial",
    title: "How to Choose the Right Electrician for Your Business",
    excerpt: "Commercial electrical needs are different from residential. Here's what to look for when hiring a pro for your business.",
    category: "COMMERCIAL",
    categoryColor: "#155724",
    categoryBg: "#e6f4ea",
    readTime: "5 min read",
    publishDate: "2026-07-06",
    url: "article-commercial.html",
    heroGradient: "linear-gradient(135deg, #28a745, #155724)",
    glowColor: "rgba(40,167,69,0.18)",
    svgIcon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.95;"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
  },

  // ── Scheduled Articles — auto-appear on their publishDate ────────────────
  {
    id: "inverter-guide",
    title: "The Complete Guide to Home Inverters in Nigeria",
    excerpt: "Confused about inverter sizes, battery types, and brands? We break down everything you need to know before buying.",
    category: "POWER SYSTEMS",
    categoryColor: "#5a0099",
    categoryBg: "#f0e6ff",
    readTime: "7 min read",
    publishDate: "2026-08-01",
    url: "article-inverter.html",
    heroGradient: "linear-gradient(135deg, #6f42c1, #4b2d8a)",
    glowColor: "rgba(111,66,193,0.18)",
    svgIcon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.95;"><rect x="1" y="6" width="22" height="12" rx="2"/><line x1="12" y1="1" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="12" x2="16" y2="12"/></svg>'
  },
  {
    id: "emergency-electrical",
    title: "What to Do During an Electrical Emergency at Home",
    excerpt: "A tripped main switch, sparking socket, or electrical fire — here's the step-by-step guide to staying safe.",
    category: "SAFETY FIRST",
    categoryColor: "#a71d2a",
    categoryBg: "#fde8ea",
    readTime: "3 min read",
    publishDate: "2026-09-01",
    url: "article-emergency.html",
    heroGradient: "linear-gradient(135deg, #dc3545, #a71d2a)",
    glowColor: "rgba(220,53,69,0.18)",
    svgIcon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.95;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  },
  {
    id: "power-surge-protection",
    title: "How to Protect Your Appliances from Power Surges",
    excerpt: "NEPA's unstable supply destroys thousands of appliances yearly. Here's how surge protectors, AVRs, and proper earthing can keep your devices safe.",
    category: "HOME SAFETY",
    categoryColor: "#0066cc",
    categoryBg: "#e8f0fe",
    readTime: "5 min read",
    publishDate: "2026-10-01",
    url: "article-surge-protection.html",
    heroGradient: "linear-gradient(135deg, #0066cc, #003d99)",
    glowColor: "rgba(0,102,204,0.18)",
    svgIcon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.95;"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
  },
  {
    id: "generator-vs-inverter",
    title: "Generator vs Inverter: What's the Best Backup Power for Your Home?",
    excerpt: "Both solve Nigeria's power problem — but they are very different solutions. We break down costs, noise, lifespan, and ideal use cases.",
    category: "POWER SYSTEMS",
    categoryColor: "#5a0099",
    categoryBg: "#f0e6ff",
    readTime: "6 min read",
    publishDate: "2026-11-01",
    url: "article-generator-vs-inverter.html",
    heroGradient: "linear-gradient(135deg, #6f42c1, #4b2d8a)",
    glowColor: "rgba(111,66,193,0.18)",
    svgIcon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.95;"><rect x="1" y="6" width="22" height="12" rx="2"/><line x1="12" y1="1" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="7" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="17" y2="12"/></svg>'
  },
  {
    id: "led-lighting-guide",
    title: "LED vs CFL vs Halogen: Which Bulb Is Right for Your Home?",
    excerpt: "Choosing the right lighting can cut your electricity bill significantly. We compare all three bulb types on cost, lifespan, and brightness.",
    category: "ENERGY SAVING",
    categoryColor: "#856404",
    categoryBg: "#fff3cd",
    readTime: "4 min read",
    publishDate: "2026-12-01",
    url: "article-led-lighting.html",
    heroGradient: "linear-gradient(135deg, #ffc107, #e0a800)",
    glowColor: "rgba(255,193,7,0.22)",
    svgIcon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.95;"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>'
  },
  {
    id: "understanding-electric-bill",
    title: "Understanding Your AEDC / EKEDC Electricity Bill in Nigeria",
    excerpt: "Energy units, fixed charges, and tariff bands — your electricity bill can be confusing. Here's exactly what every line item means.",
    category: "CONSUMER GUIDE",
    categoryColor: "#0d6efd",
    categoryBg: "#e7f1ff",
    readTime: "5 min read",
    publishDate: "2027-01-15",
    url: "article-electric-bill.html",
    heroGradient: "linear-gradient(135deg, #0d6efd, #0a4ec4)",
    glowColor: "rgba(13,110,253,0.18)",
    svgIcon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.95;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
  },
  {
    id: "earthing-grounding",
    title: "Earthing and Grounding: Why It Matters for Electrical Safety",
    excerpt: "Most Nigerian homes are not properly earthed. Here's why this invisible safety feature is critical — and how to find out if yours is missing it.",
    category: "HOME SAFETY",
    categoryColor: "#0066cc",
    categoryBg: "#e8f0fe",
    readTime: "4 min read",
    publishDate: "2027-02-01",
    url: "article-earthing.html",
    heroGradient: "linear-gradient(135deg, #198754, #0f5132)",
    glowColor: "rgba(25,135,84,0.18)",
    svgIcon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.95;"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'
  },
  {
    id: "energy-saving-tips",
    title: "10 Ways to Cut Your Electricity Consumption in Nigeria",
    excerpt: "Between PHCN bills and generator costs, electricity is expensive. These practical tips can meaningfully reduce what you spend every month.",
    category: "ENERGY SAVING",
    categoryColor: "#856404",
    categoryBg: "#fff3cd",
    readTime: "6 min read",
    publishDate: "2027-03-01",
    url: "article-energy-saving.html",
    heroGradient: "linear-gradient(135deg, #20c997, #0ca678)",
    glowColor: "rgba(32,201,151,0.18)",
    svgIcon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.95;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'
  },
  {
    id: "industrial-electricians",
    title: "The Growing Demand for Industrial Electricians in Nigeria",
    excerpt: "Nigeria's manufacturing sector is expanding rapidly. Skilled industrial electricians are now among the most sought-after trades in the country.",
    category: "INDUSTRY INSIGHT",
    categoryColor: "#495057",
    categoryBg: "#e9ecef",
    readTime: "5 min read",
    publishDate: "2027-04-01",
    url: "article-industrial-electricians.html",
    heroGradient: "linear-gradient(135deg, #495057, #212529)",
    glowColor: "rgba(73,80,87,0.2)",
    svgIcon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.95;"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'
  }
];

/**
 * Returns only articles whose publishDate is today or in the past.
 * Sorted newest-first.
 */
function getPublishedArticles() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return ARTICLES
    .filter(a => new Date(a.publishDate) <= today)
    .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
}

/**
 * Renders published articles into a given container element.
 * Shows up to `limit` articles (default: all).
 */
function renderArticleCards(containerId, limit) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var published = getPublishedArticles();
  if (limit) published = published.slice(0, limit);

  if (published.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#999;grid-column:1/-1;">No articles published yet. Check back soon!</p>';
    return;
  }

  container.innerHTML = published.map(function(article) {
    var dateStr = new Date(article.publishDate).toLocaleDateString('en-NG', {day:'numeric', month:'short', year:'numeric'});
    return '<article onclick="window.location.href=\'' + article.url + '\'" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);transition:all 0.3s;cursor:pointer;" onmouseover="this.style.transform=\'translateY(-8px)\';this.style.boxShadow=\'0 16px 40px ' + article.glowColor + '\';" onmouseout="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'0 4px 20px rgba(0,0,0,0.06)\';">'
      + '<div style="background:' + article.heroGradient + ';height:160px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;">'
      + '<div style="position:absolute;width:120px;height:120px;background:rgba(255,255,255,0.06);border-radius:50%;top:-20px;right:-20px;"></div>'
      + '<div style="position:absolute;width:80px;height:80px;background:rgba(255,255,255,0.06);border-radius:50%;bottom:-10px;left:20px;"></div>'
      + article.svgIcon
      + '</div>'
      + '<div style="padding:24px;">'
      + '<span style="background:' + article.categoryBg + ';color:' + article.categoryColor + ';font-size:0.75rem;font-weight:700;padding:4px 10px;border-radius:20px;">' + article.category + '</span>'
      + '<h3 style="font-size:1.1rem;font-weight:700;color:#1a1a1a;margin:14px 0 10px;">' + article.title + '</h3>'
      + '<p style="color:#666;font-size:0.9rem;line-height:1.6;margin-bottom:18px;">' + article.excerpt + '</p>'
      + '<div style="display:flex;align-items:center;gap:10px;color:#999;font-size:0.8rem;">'
      + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
      + '<span>' + article.readTime + '</span><span>•</span><span>' + dateStr + '</span>'
      + '</div></div></article>';
  }).join('');
}
