/**
 * CORE NAVIGATION & UI
 */
const sidebar = document.querySelector(".sidebar-nav");
const navToggles = document.querySelectorAll(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const filterButtons = document.querySelectorAll(".filter-button");
const committeeCards = document.querySelectorAll(".committee-card");
const sections = document.querySelectorAll("section[id]");

navToggles.forEach(toggle => {
  toggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("menu-open");
    navToggles.forEach(t => t.setAttribute("aria-expanded", String(isOpen)));
  });
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    sidebar.classList.remove("menu-open");
    navToggles.forEach(t => t.setAttribute("aria-expanded", "false"));
  });
});

const observerOptions = { root: null, rootMargin: '-20% 0px -70% 0px', threshold: 0 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, observerOptions);
sections.forEach(section => observer.observe(section));

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    committeeCards.forEach((card) => {
      const categories = card.dataset.category?.split(" ") ?? [];
      const isVisible = filter === "all" || categories.includes(filter);
      card.classList.toggle("is-hidden", !isVisible);
    });
  });
});

/**
 * ============================================================
 *  COLLOQUIUM 2.0 — PRECISION CHATBOT ENGINE
 *  Rule-based, score-ranked, context-aware. No API key needed.
 * ============================================================
 */

/* ── DOM refs ── */
const chatTrigger   = document.getElementById('chatTrigger');
const chatWindow    = document.getElementById('chatWindow');
const closeChat     = document.getElementById('closeChat');
const chatInput     = document.getElementById('chatInput');
const sendChat      = document.getElementById('sendChat');
const chatMessages  = document.getElementById('chatMessages');

chatTrigger.addEventListener('click', () => chatWindow.classList.add('open'));
closeChat.addEventListener('click',   () => chatWindow.classList.remove('open'));

/* ── Conversation state ── */
let lastTopic = null;  // tracks context for follow-up questions

/* ══════════════════════════════════════════════════════════════
   KNOWLEDGE BASE  — every fact extracted from the PDF brochure
   ══════════════════════════════════════════════════════════════ */
const KB = [

  /* ── EVENT BASICS ── */
  {
    id: 'event_name',
    tags: ['colloquium', 'mun', 'event', 'conference', 'what is colloquium', 'about', 'overview'],
    response: `🎓 <b>Colloquium 2.0 — Model United Nations</b><br>
Hosted by <b>Suncity School, Sector 37D, Gurugram</b>.<br>
A two-day conference celebrating dialogue, diplomacy, leadership, and the power of ideas.<br>
<i>Motto: Sadaiva Agrani (Always Ahead)</i>`
  },
  {
    id: 'dates',
    tags: ['date', 'when', 'august', 'schedule', 'day', 'time', '22', '23', 'weekend'],
    response: `📅 <b>Conference Dates:</b><br>
<b>22nd – 23rd August 2026</b> (Saturday & Sunday)<br>
Mark your calendars — two full days of debate, diplomacy, and discovery!`
  },
  {
    id: 'venue',
    tags: ['venue', 'location', 'where', 'place', 'school', 'gurugram', 'gurgaon', 'sector 37d', 'suncity', 'address'],
    response: `📍 <b>Venue:</b><br>
<b>Suncity School, Sector 37D, Gurugram (Haryana)</b><br>
Motto: <i>Sadaiva Agrani</i> — Always Ahead.`
  },
  {
    id: 'edition',
    tags: ['edition', '2nd', 'second', 'first edition', '1st', 'previous', 'history', 'last year'],
    response: `🏛️ <b>Colloquium 2.0</b> is the <b>2nd Edition</b> of the Colloquium MUN series, building on the success of the inaugural conference at Suncity School 37D.`
  },

  /* ── COMMITTEES ── */
  {
    id: 'all_committees',
    tags: ['committee', 'committees', 'all committee', 'list', 'options', 'which committee', 'how many committee', 'available'],
    response: `🏛️ <b>Committees at Colloquium 2.0:</b><br><br>
🌍 <b>Global Affairs:</b><br>
&nbsp;&nbsp;• UNSC — United Nations Security Council<br>
&nbsp;&nbsp;• UNFCCC — Climate Change (Beginner-friendly)<br>
&nbsp;&nbsp;• GFMC — Global Financial Meltdown Council<br><br>
🇮🇳 <b>India-Focused:</b><br>
&nbsp;&nbsp;• AIPPM — All India Political Parties Meet<br>
&nbsp;&nbsp;• CBI — Central Bureau of Investigation<br><br>
⚡ <b>Special Simulations:</b><br>
&nbsp;&nbsp;• Founders Circle — Corporate Debate<br>
&nbsp;&nbsp;• IMI — Influencers Meet India<br>
&nbsp;&nbsp;• Mock Trial — US Format<br>
&nbsp;&nbsp;• IPL Auction — Team-based<br>
&nbsp;&nbsp;• International Press — Journalists & Photographers<br><br>
<i>Ask me about any specific committee for full details!</i>`
  },
  {
    id: 'unsc',
    tags: ['unsc', 'united nations security council', 'security council', 'terrorism', 'sahel', 'communal'],
    response: `🛡️ <b>UNSC — United Nations Security Council</b><br><br>
<b>Agenda:</b> Reviewing the rise of communal terrorism with special emphasis on the <b>Sahel Region</b>.<br><br>
<b>Category:</b> Global Affairs<br>
<b>Difficulty:</b> Intermediate – Advanced<br><br>
The Sahel Region in West/Central Africa faces a surge in jihadist and communal violence — delegates will craft binding resolutions to address this crisis.`
  },
  {
    id: 'unfccc',
    tags: ['unfccc', 'climate', 'climate change', 'carbon', 'emission', 'sustainable energy', 'environment', 'beginner', 'new', 'first mun', 'first time', 'newbie', 'starter'],
    response: `🌿 <b>UNFCCC — United Nations Framework Convention on Climate Change</b><br><br>
<b>Agenda:</b> Reducing the effects of carbon emissions with special emphasis on <b>sustainable energy sources</b>.<br><br>
<b>Category:</b> Global Affairs<br>
⭐ <b>BEGINNER COMMITTEE (0–5 MUNs/YPs)</b> — Perfect for first-timers!<br><br>
This committee deliberates on transitioning from fossil fuels to renewables while balancing economic development needs across nations.`
  },
  {
    id: 'gfmc',
    tags: ['gfmc', 'global financial', 'financial meltdown', 'financial crisis', 'economic', 'economy', 'finance', 'bank', 'market'],
    response: `📉 <b>GFMC — Global Financial Meltdown Council</b><br><br>
<b>Agenda:</b> Deliberation on the Global Financial Crisis and Measures to Restore Economic Stability.<br><br>
<b>Category:</b> Global Affairs<br>
<b>Difficulty:</b> Intermediate<br><br>
Delegates will act as representatives of international financial institutions, debating bailouts, austerity measures, and systemic reforms to prevent global economic collapse.`
  },
  {
    id: 'founders_circle',
    tags: ['founders circle', 'founders', 'corporate', 'tech', 'ai', 'billionaire', 'entrepreneur', 'regulate', 'regulation', 'democratic', 'silicon valley'],
    response: `💻 <b>Founders Circle — A MUN-Inspired Corporate Debate Simulation</b><br><br>
<b>Agenda:</b> Deliberating the ethical responsibility of tech founders in the age of AI — <i>should billionaire entrepreneurs be regulated by democratic institutions?</i><br><br>
<b>Category:</b> Special Simulation<br>
<b>Format:</b> Corporate Debate (MUN-inspired)<br><br>
Delegates represent tech giants, governments, and civil society in a boardroom-style debate on AI governance.`
  },
  {
    id: 'imi',
    tags: ['imi', 'influencer', 'influencers meet india', 'influence summit', 'social media', 'instagram', 'creator', 'content', 'youth', 'destroying', 'inspiring'],
    response: `📱 <b>IMI — Influencers Meet India (Influence Summit)</b><br><br>
<b>Agenda:</b> Discussing whether <b>Influencer Culture</b> is inspiring a generation or destroying it.<br><br>
<b>Category:</b> Special Simulation<br>
<b>Difficulty:</b> Beginner – Intermediate<br><br>
Delegates argue for or against the societal impact of content creators, brand culture, and the attention economy on today's youth.`
  },
  {
    id: 'aippm',
    tags: ['aippm', 'all india political', 'political parties', 'india politics', 'federal', 'centralisation', 'state government', 'union government', 'centre', 'state vs centre'],
    response: `🇮🇳 <b>AIPPM — All India Political Parties Meet</b><br><br>
<b>Agenda:</b> Analysing the Centralisation of Power and Federal Tensions Between State Governments and the Union Government.<br><br>
<b>Category:</b> India-Focused<br>
<b>Difficulty:</b> Intermediate – Advanced<br><br>
Delegates represent various Indian political parties debating GST revenue sharing, Governor appointments, and the erosion of state autonomy.`
  },
  {
    id: 'cbi',
    tags: ['cbi', 'central bureau of investigation', 'investigation', 'missing', 'head of state', 'election', 'conspiracy', 'betrayal', 'intelligence', 'dhurandhar'],
    response: `🔍 <b>CBI — Central Bureau of Investigation</b><br><br>
<b>Theme:</b> <i>The Head of the State has gone missing 24 hours before National Elections.</i><br>
<b>Focus:</b> Is it an Intelligence Failure, Internal Betrayal, or Foreign Conspiracy?<br><br>
<b>Category:</b> India-Focused / Special Simulation<br>
<b>Difficulty:</b> Intermediate – Advanced<br><br>
A high-stakes crisis committee. Delegates investigate leads, interrogate witnesses, and race against time to uncover the truth. BE THE DHURANDHAR!`
  },
  {
    id: 'mock_trial',
    tags: ['mock trial', 'trial', 'court', 'prosecution', 'defense', 'law', 'lawyer', 'judge', 'legal', 'suits', 'case file'],
    response: `⚖️ <b>Mock Trial — US Format</b><br><br>
<b>Format:</b> Prosecution v/s Defense<br>
<b>Theme:</b> <i>Suits</i> (Legal Drama inspired)<br>
<b>Note:</b> The full case file will be revealed prior to the conference.<br><br>
<b>Category:</b> Special Simulation<br>
<b>Difficulty:</b> Intermediate – Advanced<br><br>
Delegates take on the roles of lawyers, witnesses, and court officials in a dramatic US-style courtroom showdown.`
  },
  {
    id: 'ipl',
    tags: ['ipl', 'indian premier league', 'ipl auction', 'cricket', 'auction', 'team', 'sport', 'bid', 'player'],
    response: `🏏 <b>IPL Auction — Indian Premier League Simulation</b><br><br>
<b>Format:</b> Team-based auction simulation<br>
<b>Team Size:</b> Minimum 2 members, Maximum 4 members<br><br>
<b>💰 IPL-Specific Fee Structure:</b><br>
&nbsp;&nbsp;• Team of 2: <b>₹4,000</b><br>
&nbsp;&nbsp;• Team of 3: <b>₹6,000</b><br>
&nbsp;&nbsp;• Team of 4: <b>₹8,000</b><br><br>
<b>Category:</b> Special Simulation<br>
<i>Note: This fee structure is exclusive to the IPL committee.</i>`
  },
  {
    id: 'international_press',
    tags: ['international press', 'press', 'journalism', 'journalist', 'photographer', 'caricaturist', 'media', 'ip', 'report', 'camera'],
    response: `📸 <b>International Press (IP)</b><br><br>
<b>Roles:</b> Journalists, Photographers, and Caricaturists<br>
<b>Fee:</b> ₹2,000 (Individual) | ₹1,800 (Suncity 37D delegates)<br><br>
<b>Category:</b> Special Simulation<br><br>
IP members cover all committee sessions, write articles, take photographs, and create caricatures. A creative alternative to traditional debating!`
  },

  /* ── FEES ── */
  {
    id: 'fees_all',
    tags: ['fee', 'fees', 'cost', 'price', 'payment', 'how much', 'amount', 'charge', 'pay', 'money', 'rupee', 'inr'],
    response: `💰 <b>Colloquium 2.0 — Fee Structure</b><br><br>
<table style="width:100%;border-collapse:collapse;font-size:0.88rem;">
  <tr><td style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.15);">Individual Delegation</td><td style="text-align:right;font-weight:700;">₹2,300</td></tr>
  <tr><td style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.15);">Suncity 37D Delegation</td><td style="text-align:right;font-weight:700;">₹2,200</td></tr>
  <tr><td style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.15);">International Press</td><td style="text-align:right;font-weight:700;">₹2,000</td></tr>
  <tr><td style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.15);">Suncity 37D IP</td><td style="text-align:right;font-weight:700;">₹1,800</td></tr>
  <tr><td style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.15);">School Delegation Fee</td><td style="text-align:right;font-weight:700;">₹2,299 <small>(all schools)</small></td></tr>
  <tr><td style="padding:6px 0;">IPL Auction (team)</td><td style="text-align:right;font-weight:700;">₹4k / ₹6k / ₹8k</td></tr>
</table><br>
<i>School delegation fee is mandatory for every participating school. IPL fees are separate and team-based.</i>`
  },
  {
    id: 'fee_individual',
    tags: ['individual fee', 'individual delegation fee', 'solo fee', 'single delegate'],
    response: `💳 <b>Individual Delegation Fee:</b> <b>₹2,300 INR</b><br>
After payment, email your screenshot to <b>colloquium@suncityschool-37d.com</b> and attach it to the registration form.`
  },
  {
    id: 'fee_suncity',
    tags: ['suncity fee', 'suncity 37d fee', 'suncity delegation', '37d fee'],
    response: `💳 <b>Suncity 37D Delegation Fee:</b><br>
• General: <b>₹2,200 INR</b><br>
• International Press: <b>₹1,800 INR</b>`
  },
  {
    id: 'fee_school',
    tags: ['school fee', 'school delegation', 'school registration fee', 'mandatory fee'],
    response: `🏫 <b>School Delegation Fee:</b> <b>₹2,299 INR</b><br>
This is <b>mandatory</b> and must be paid by every school participating in Colloquium 2.0, in addition to individual delegate fees.`
  },

  /* ── REGISTRATION ── */
  {
    id: 'registration',
    tags: ['register', 'registration', 'sign up', 'form', 'join', 'apply', 'enroll', 'how to register', 'how do i', 'link'],
    response: `📝 <b>How to Register for Colloquium 2.0:</b><br><br>
<b>Step 1 — Pay the fee</b> (see fee structure above)<br><br>
<b>Step 2 — Fill the form:</b><br>
• <a href="https://forms.gle/Uoqj1fRcY7MJfkh97" target="_blank" style="color:#f02225;">Individual Delegation Form ↗</a><br>
• <a href="https://forms.gle/mFxJ8k8mw9cuddRPA" target="_blank" style="color:#f02225;">Suncity 37D Delegation Form ↗</a><br><br>
<b>Step 3 — Email proof of payment</b><br>
📧 colloquium@suncityschool-37d.com<br>
(Attach the payment screenshot in the form too, if possible)<br><br>
<i>Questions? Contact Ranvir (+91 8826369721) or Nancy (+91 9990603093).</i>`
  },
  {
    id: 'registration_individual',
    tags: ['individual form', 'individual registration', 'individual link', 'solo register', 'external school'],
    response: `📝 <b>Individual Delegation Registration:</b><br>
<a href="https://forms.gle/Uoqj1fRcY7MJfkh97" target="_blank" style="color:#f02225;">https://forms.gle/Uoqj1fRcY7MJfkh97 ↗</a><br><br>
After payment, email the screenshot to <b>colloquium@suncityschool-37d.com</b>.`
  },
  {
    id: 'registration_suncity',
    tags: ['suncity form', 'suncity 37d registration', '37d form', 'suncity link', 'suncity register'],
    response: `📝 <b>Suncity 37D Delegation Registration:</b><br>
<a href="https://forms.gle/mFxJ8k8mw9cuddRPA" target="_blank" style="color:#f02225;">https://forms.gle/mFxJ8k8mw9cuddRPA ↗</a><br><br>
After payment, email the screenshot to <b>colloquium@suncityschool-37d.com</b>.`
  },
  {
    id: 'payment_proof',
    tags: ['proof', 'screenshot', 'payment proof', 'after payment', 'once paid', 'payment done', 'paid'],
    response: `✅ <b>After Making Payment:</b><br><br>
1. Take a <b>screenshot</b> of your payment confirmation.<br>
2. Email it to <b>colloquium@suncityschool-37d.com</b><br>
3. Also <b>attach</b> the screenshot in the delegate registration form.<br><br>
This confirms your spot at Colloquium 2.0!`
  },

  /* ── CONTACT ── */
  {
    id: 'contact',
    tags: ['contact', 'reach', 'phone', 'number', 'call', 'email', 'instagram', 'social media', 'dm', 'message', 'help', 'support'],
    response: `📞 <b>Contact Colloquium 2.0:</b><br><br>
📧 <b>Email:</b> colloquium@suncityschool-37d.com<br>
📸 <b>Instagram:</b> <a href="https://www.instagram.com/colloquiummun_/" target="_blank" style="color:#f02225;">@colloquiummun_ ↗</a><br><br>
👤 <b>Ranvir Srivastava</b> (Founder): <a href="tel:+918826369721" style="color:#f02225;">+91 8826369721</a><br>
👤 <b>Nancy Sharma</b> (Sec. General): <a href="tel:+919990603093" style="color:#f02225;">+91 9990603093</a>`
  },
  {
    id: 'email',
    tags: ['email address', 'mail', 'email id', 'gmail', 'write to'],
    response: `📧 <b>Official Email:</b><br>
<b>colloquium@suncityschool-37d.com</b><br><br>
Use this to send payment screenshots and any other queries.`
  },
  {
    id: 'instagram',
    tags: ['instagram', 'insta', 'ig', '@', 'follow', 'social'],
    response: `📸 <b>Follow us on Instagram:</b><br>
<a href="https://www.instagram.com/colloquiummun_/" target="_blank" style="color:#f02225;">@colloquiummun_ ↗</a><br><br>
Stay updated on committee announcements, background guides, and event news!`
  },
  {
    id: 'ranvir',
    tags: ['ranvir', 'ranvir srivastava', 'founder', 'project colloquium'],
    response: `👨‍💼 <b>Ranvir Srivastava — Founder, Project Colloquium</b><br><br>
Ranvir welcomes all participants to a platform celebrating leadership and the power of ideas. He emphasises that meaningful conversations create meaningful change.<br><br>
📞 <b>Contact:</b> <a href="tel:+918826369721" style="color:#f02225;">+91 8826369721</a>`
  },
  {
    id: 'nancy',
    tags: ['nancy', 'nancy sharma', 'secretary general', 'secgen', 'sg'],
    response: `👩‍💼 <b>Nancy Sharma — Secretary General, Colloquium 2.0</b><br><br>
Nancy states that Colloquium was born from the idea of youth leadership meeting global challenges and is designed to spark creative problem-solving among delegates.<br><br>
📞 <b>Contact:</b> <a href="tel:+919990603093" style="color:#f02225;">+91 9990603093</a>`
  },
  {
    id: 'guneet',
    tags: ['guneet', 'guneet ohri', 'director', 'ms ohri', 'ms. guneet'],
    response: `👩‍💼 <b>Ms. Guneet Ohri — Director, Suncity School 37D</b><br><br>
Ms. Ohri believes education is driven by curiosity, expression, and global consciousness. She aims to nurture leaders who are academically sound, globally aware, and socially responsible through events like Colloquium MUN.`
  },
  {
    id: 'jayashree',
    tags: ['jayashree', 'jayashree patel', 'principal', 'ms patel', 'ms. jayashree'],
    response: `👩‍💼 <b>Ms. Jayashree Patel — Principal, Suncity School 37D</b><br><br>
Ms. Patel views MUN as a "rehearsal for the future." She believes Colloquium MUN is vital in shaping responsible global citizens who debate with conviction and listen with respect.`
  },
  {
    id: 'giggashu',
    tags: ['giggashu', 'giggashu punia', 'punia', 'coordinator', 'mun coordinator', 'mr punia'],
    response: `👨‍💼 <b>Mr. Giggashu Punia — MUN Coordinator, Suncity School 37D</b><br><br>
Mr. Punia describes Colloquium as an educational journey through the lens of global governance. He encourages delegates to think like diplomats, engage like policymakers, and speak like leaders.`
  },

  /* ── GENERAL / FAQ ── */
  {
    id: 'what_is_mun',
    tags: ['what is mun', 'what is model united nations', 'mun meaning', 'explain mun', 'how does mun work', 'never done mun'],
    response: `🌐 <b>What is an MUN?</b><br><br>
A <b>Model United Nations (MUN)</b> is an academic simulation of the United Nations where participants:<br>
• Represent a country or entity<br>
• Research and debate global issues<br>
• Draft and pass resolutions<br>
• Build skills in diplomacy, public speaking, and critical thinking<br><br>
Colloquium 2.0 goes beyond traditional MUN with simulations like CBI investigations, IPL auctions, and corporate debates!`
  },
  {
    id: 'beginner',
    tags: ['beginner', 'newbie', 'first time', 'new to mun', 'no experience', 'never done', '0 mun', 'first mun', 'starter', 'which committee should i'],
    response: `🌟 <b>Advice for Beginners:</b><br><br>
We highly recommend the <b>UNFCCC</b> committee — it's specifically designed for delegates with <b>0–5 MUN/YP experiences</b>.<br><br>
The agenda (climate change & sustainable energy) is relatable and well-documented, making research easy.<br><br>
Still nervous? Contact Nancy Sharma (+91 9990603093) or Ranvir Srivastava (+91 8826369721) — they'll guide you!`
  },
  {
    id: 'dress_code',
    tags: ['dress code', 'dress', 'wear', 'clothes', 'outfit', 'formal', 'suit', 'blazer', 'what to wear', 'attire'],
    response: `👔 <b>Dress Code:</b><br><br>
<b>Western Formals</b> are required throughout the conference.<br>
• For delegates: Suits or blazers with formal trousers/skirts<br>
• For International Press: Smart professional attire<br><br>
Maintaining a professional diplomatic atmosphere is important at Colloquium 2.0.`
  },
  {
    id: 'benefits',
    tags: ['why', 'benefit', 'worth it', 'reason to join', 'why register', 'what will i gain', 'why should i', 'advantage', 'skills', 'learn'],
    response: `🚀 <b>Why Attend Colloquium 2.0?</b><br><br>
✅ Develop <b>diplomacy, public speaking & negotiation</b> skills<br>
✅ Network with top students from schools across the region<br>
✅ Experience <b>10 diverse committee formats</b> — UN, court, corporate, cricket, and more<br>
✅ Think like a global policymaker in high-stakes simulations<br>
✅ Build lasting friendships and a leadership portfolio<br>
✅ Earn recognition and awards for outstanding performance`
  },
  {
    id: 'background_guide',
    tags: ['background guide', 'study guide', 'bg', 'research', 'resources', 'study material', 'preparation', 'how to prepare'],
    response: `📚 <b>Background Guides:</b><br><br>
Background Guides for each committee will be released <b>prior to the conference</b>. Follow <a href="https://www.instagram.com/colloquiummun_/" target="_blank" style="color:#f02225;">@colloquiummun_</a> on Instagram for announcements.<br><br>
<b>To prepare in the meantime:</b><br>
• Research your committee's agenda topic online<br>
• Study your assigned country's position<br>
• Practice writing a position paper<br>
• Contact the organizers for guidance!`
  },
  {
    id: 'awards',
    tags: ['award', 'awards', 'prize', 'trophy', 'best delegate', 'winner', 'win', 'recognition', 'certificate'],
    response: `🏆 <b>Awards at Colloquium 2.0:</b><br><br>
While the complete awards list will be announced closer to the event, MUN conferences typically recognize:<br>
• <b>Best Delegate</b> (per committee)<br>
• <b>Outstanding Delegate</b><br>
• <b>High Commendation</b><br>
• <b>Best Position Paper</b><br><br>
For specific Colloquium 2.0 awards, follow <a href="https://www.instagram.com/colloquiummun_/" target="_blank" style="color:#f02225;">@colloquiummun_</a> or contact the organizers.`
  },
  {
    id: 'deadline',
    tags: ['deadline', 'last date', 'registration deadline', 'registration close', 'when is registration', 'cutoff', 'register by'],
    response: `⏰ <b>Registration Deadline:</b><br><br>
A specific deadline has not been announced in the brochure. We recommend registering <b>as early as possible</b> to secure your preferred committee!<br><br>
📞 Contact Ranvir (+91 8826369721) or Nancy (+91 9990603093) to confirm the current deadline.`
  },
  {
    id: 'secretariat',
    tags: ['secretariat', 'organizer', 'team', 'organizing', 'core team', 'who organized', 'who made'],
    response: `🏛️ <b>Colloquium 2.0 Secretariat:</b><br><br>
👩‍💼 <b>Nancy Sharma</b> — Secretary General<br>
👨‍💼 <b>Ranvir Srivastava</b> — Founder, Project Colloquium<br>
👩‍💼 <b>Ms. Guneet Ohri</b> — Director, Suncity School 37D<br>
👩‍💼 <b>Ms. Jayashree Patel</b> — Principal, Suncity School 37D<br>
👨‍💼 <b>Mr. Giggashu Punia</b> — MUN Coordinator<br><br>
Plus the <b>Core Secretariat</b> team who designed every committee and agenda.`
  },

  /* ── GREETINGS ── */
  {
    id: 'greeting',
    tags: ['hi', 'hello', 'hey', 'sup', 'good morning', 'good afternoon', 'good evening', 'namaste', 'howdy', 'greetings'],
    response: `👋 <b>Welcome to Colloquium 2.0!</b><br><br>
I'm the official assistant for this MUN conference hosted by Suncity School, Sector 37D, Gurugram — taking place on <b>22nd–23rd August 2026</b>.<br><br>
I can help you with:<br>
• 📋 Committees & Agendas<br>
• 💰 Fees & Registration<br>
• 📅 Dates & Venue<br>
• 👥 Secretariat & Leadership<br>
• 📞 Contact Info<br><br>
What would you like to know?`
  },
  {
    id: 'thanks',
    tags: ['thank', 'thanks', 'thank you', 'thx', 'ty', 'helpful', 'great', 'awesome', 'perfect'],
    response: `😊 Glad I could help! Is there anything else you'd like to know about <b>Colloquium 2.0</b>?<br><br>
Don't forget to <b>register early</b> at <a href="https://forms.gle/Uoqj1fRcY7MJfkh97" target="_blank" style="color:#f02225;">this link ↗</a> — spots are limited!`
  },
  {
    id: 'bye',
    tags: ['bye', 'goodbye', 'see you', 'later', 'cya', 'take care', 'ok bye'],
    response: `👋 Goodbye! See you at <b>Colloquium 2.0</b> on 22nd–23rd August 2026!<br>
Register soon and stay tuned on <a href="https://www.instagram.com/colloquiummun_/" target="_blank" style="color:#f02225;">@colloquiummun_</a> 🎓`
  }
];


/* ══════════════════════════════════════════════════════════════
   SCORING ENGINE — finds the best matching KB entry
   ══════════════════════════════════════════════════════════════ */

/**
 * Tokenises a string into lowercase words, stripping punctuation.
 */
function tokenise(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
}

/**
 * Returns true if the candidate substring appears in the input string.
 * Handles multi-word tags correctly.
 */
function containsPhrase(input, phrase) {
  return input.includes(phrase);
}

/**
 * Scores a KB entry against the user input.
 * Multi-word tags score higher (more specific match).
 */
function scoreEntry(entry, input, tokens) {
  let score = 0;
  for (const tag of entry.tags) {
    if (containsPhrase(input, tag)) {
      // Longer / more specific tags reward higher scores
      score += tag.split(/\s+/).length * 10;
    }
  }
  // Bonus: single-word token exact match against any tag word
  for (const token of tokens) {
    for (const tag of entry.tags) {
      if (tag === token) score += 5;
      else if (tag.startsWith(token) && token.length > 3) score += 2;
    }
  }
  return score;
}

/**
 * Main query processor — returns the best response string.
 */
function processQuery(userInput) {
  const input = userInput.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
  const tokens = tokenise(input);

  if (!input) return "Please type a question! I'm here to help 😊";

  // Score every KB entry
  let best = null;
  let bestScore = 0;

  for (const entry of KB) {
    const s = scoreEntry(entry, input, tokens);
    if (s > bestScore) {
      bestScore = s;
      best = entry;
    }
  }

  // Confidence threshold — must have at least one meaningful match
  if (bestScore >= 5) {
    lastTopic = best.id;
    return best.response;
  }

  /* ── Context-aware follow-ups ──
     If score is too low but we have a recent topic, try to answer
     relative to it (e.g. "how much?" after talking about UNSC → fees) */
  if (lastTopic) {
    const contextualHints = {
      fee: ['much', 'cost', 'price', 'pay', 'money', 'inr', 'rupee'],
      register: ['register', 'form', 'sign', 'join', 'apply'],
      contact: ['contact', 'reach', 'call', 'email', 'number'],
    };
    for (const [hint, words] of Object.entries(contextualHints)) {
      if (words.some(w => tokens.includes(w))) {
        if (hint === 'fee') return KB.find(e => e.id === 'fees_all').response;
        if (hint === 'register') return KB.find(e => e.id === 'registration').response;
        if (hint === 'contact') return KB.find(e => e.id === 'contact').response;
      }
    }
  }

  /* ── Partial single-word fallback ── */
  const partialMap = {
    unsc: 'unsc', unfccc: 'unfccc', gfmc: 'gfmc', aippm: 'aippm',
    cbi: 'cbi', ipl: 'ipl', press: 'international_press',
    trial: 'mock_trial', founders: 'founders_circle', imi: 'imi',
    fee: 'fees_all', cost: 'fees_all', register: 'registration',
    contact: 'contact', date: 'dates', when: 'dates', where: 'venue',
    venue: 'venue', school: 'venue', committee: 'all_committees',
    beginner: 'beginner', dress: 'dress_code', suit: 'dress_code',
    award: 'awards', guide: 'background_guide', deadline: 'deadline',
    nancy: 'nancy', ranvir: 'ranvir', guneet: 'guneet',
    jayashree: 'jayashree', giggashu: 'giggashu', secretariat: 'secretariat',
  };
  for (const token of tokens) {
    if (partialMap[token]) {
      const entry = KB.find(e => e.id === partialMap[token]);
      if (entry) { lastTopic = entry.id; return entry.response; }
    }
  }

  /* ── Absolute fallback ── */
  return `🤔 I couldn't find a specific answer to that.<br><br>
Try asking about:<br>
• A <b>committee name</b> (e.g. "UNSC", "CBI", "IPL")<br>
• <b>Fees</b> or <b>Registration</b><br>
• <b>Dates</b>, <b>Venue</b>, or <b>Contact</b><br>
• The <b>Secretariat</b> or <b>Leadership</b><br><br>
Or reach us directly at <b>colloquium@suncityschool-37d.com</b> 📧`;
}


/* ══════════════════════════════════════════════════════════════
   UI HELPERS
   ══════════════════════════════════════════════════════════════ */

function addMessage(html, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender === 'bot' ? 'bot-msg' : 'user-msg');
  // User messages: plain text (safe). Bot messages: trusted HTML from our KB.
  if (sender === 'user') {
    msgDiv.textContent = html;
  } else {
    msgDiv.innerHTML = html;
  }
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
  const indicator = document.createElement('div');
  indicator.classList.add('message', 'bot-msg');
  indicator.id = 'typing-indicator';
  indicator.innerHTML = '<span style="opacity:0.6;font-style:italic;font-size:0.85rem;">Typing…</span>';
  chatMessages.appendChild(indicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

async function handleChat() {
  const userText = chatInput.value.trim();
  if (!userText) return;

  addMessage(userText, 'user');
  chatInput.value = '';

  showTypingIndicator();

  // Small delay for natural feel
  setTimeout(() => {
    removeTypingIndicator();
    const response = processQuery(userText);
    addMessage(response, 'bot');
  }, 350);
}

sendChat.addEventListener('click', handleChat);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });