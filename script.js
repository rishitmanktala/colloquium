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
 * THE PRECISION ENGINE
 * Uses a Strict Priority Hierarchy to prevent "Wrong" answers.
 */
const chatTrigger = document.getElementById('chatTrigger');
const chatWindow = document.getElementById('chatWindow');
const closeChat = document.getElementById('closeChat');
const chatInput = document.getElementById('chatInput');
const sendChat = document.getElementById('sendChat');
const chatMessages = document.getElementById('chatMessages');

chatTrigger.addEventListener('click', () => chatWindow.classList.add('open'));
closeChat.addEventListener('click', () => chatWindow.classList.remove('open'));

// DATA STORE: Every single detail from the document
const DATABASE = {
  specifics: [
    // Committees
    { keys: ['unsc', 'security council'], res: "🛡️ **UNSC (United Nations Security Council):** Reviewing the rise of communal terrorism with special emphasis on the Sahel Region." },
    { keys: ['unfccc', 'climate change'], res: "🌿 **UNFCCC (United Nations Framework Convention on Climate Change):** Deliberation on reducing the effects of carbon emissions with special emphasis on sustainable energy sources. \n\n💡 *Classification: Beginner Committee (0-5 MUNs/YPs)*." },
    { keys: ['gfmc', 'financial meltdown'], res: "📉 **GFMC (Global Financial Meltdown Council):** Deliberation on the Global Financial Crisis and Measures to Restore Economic Stability." },
    { keys: ['founders circle', 'tech founders'], res: "💻 **Founders Circle (Corporate Debate Simulation):** Deliberating the ethical responsibility of tech founders in the age of AI—should billionaire entrepreneurs be regulated by democratic institutions?" },
    { keys: ['influence summit', 'influencers meet india', 'imi'], res: "📱 **Influence Summit (Influencers Meet India):** Discussing whether Influencer Culture is inspiring a generation or destroying it." },
    { keys: ['aippm', 'political parties'], res: "🇮🇳 **AIPPM (All India Political Parties Meet):** Analysing the centralisation of power and federal tensions between State Governments and the Union Government." },
    { keys: ['cbi', 'central bureau of investigation'], res: "🔍 **CBI (Central Bureau of Investigation):**\n- **Theme:** The Head of the State has gone missing 24 hours before national elections.\n- **Focus:** Investigating intelligence failure, internal betrayal, or foreign conspiracy." },
    { keys: ['mock trial'], res: "⚖️ **Mock Trial (US Format):** Prosecution v/s Defense. \n- **Theme:** *Suits*. \n- **Note:** Case file will be revealed prior to the conference." },
    { keys: ['ipl auction', 'ipl committee'], res: "🏏 **IPL Auction:** A specialized team-based committee simulation. \n\n**IPL Fees:**\n- Team of 2: 4000 INR\n- Team of 3: 6000 INR\n- Team of 4: 8000 INR\n*(Min 2, Max 4 members per team)*" },
    { keys: ['international press', 'ip'], res: "📸 **International Press:** Inviting Journalists, Photographers, and Caricaturists." },
    
    // Leadership
    { keys: ['guneet ohri', 'director'], res: "👩‍💼 **Ms. Guneet Ohri (Director):** Believes education is driven by curiosity and global consciousness. She aims to nurture leaders who are academically sound, globally aware, and socially responsible." },
    { keys: ['jayashree patel', 'principal'], res: "👩‍💼 **Ms. Jayashree Patel (Principal):** Views MUN as a 'rehearsal for the future'. She believes the forum is vital for shaping responsible global citizens in a world requiring diplomacy." },
    { keys: ['giggashu punia', 'coordinator'], res: "👨‍💼 **Mr. Giggashu Punia (MUN Coordinator):** Describes the event as an educational journey through global governance and encourages delegates to think like diplomats and speak like leaders." },
    { keys: ['ranvir srivastava', 'founder'], res: "👨‍💼 **Ranvir Srivastava (Founder, Project Colloquium):** Welcomes participants to a platform celebrating leadership and the power of ideas, emphasizing that meaningful conversations create meaningful change." },
    { keys: ['nancy sharma', 'secretary general', 'secgen'], res: "👩‍💼 **Nancy Sharma (Secretary General):** States that Colloquium was born from the idea of youth leadership meeting global challenges and is designed to spark creative problem-solving." },
  ],
  categories: [
    { keys: ['committee', 'agenda', 'room', 'list'], res: "🛡️ **Committees & Agendas:**\n- UNSC, UNFCCC, GFMC, Founders Circle, Influence Summit, AIPPM, CBI, Mock Trial, IPL Auction, and International Press. \n\n*Ask me about a specific committee name for its full agenda!*" },
    { keys: ['fee', 'cost', 'price', 'payment', 'amount'], res: "💰 **General Delegation Fees:**\n- Individual: 2300/- INR\n- Suncity 37D: 2200/- INR\n- International Press: 2000/- INR\n- Suncity 37D IP: 1800/- INR\n- School Delegation Fee: 2299/- INR (Mandatory for all participating schools)." },
    { keys: ['register', 'form', 'join', 'sign up', 'apply', 'link'], res: "📝 **Registration:**\n1. **Forms:** Individual: https://forms.gle/Uoqj1fRcY7MJfkh97 | Suncity 37D: https://forms.gle/mFxJ8k8mw9cuddRPA\n2. **Proof:** Email screenshot to **colloquium@suncityschool-37d.com** and attach it to the form." },
    { keys: ['contact', 'phone', 'number', 'email', 'instagram', 'reach'], res: "📞 **Contact Details:**\n- Email: colloquium@suncityschool-37d.com\n- Instagram: @colloquiummun_\n- Ranvir Srivastava: +91 8826369721\n- Nancy Sharma: +91 9990603093" },
    { keys: ['date', 'when', 'time', 'august'], res: "📅 The conference will be held on the **22nd and 23rd of August, 2026**." },
    { keys: ['school', 'motto', 'location', 'where', 'sadaiva'], res: "🏫 **Colloquium 2.0** is hosted by **Suncity School, Sector 37D, Gurugram**. \n🌟 **Motto:** *Sadaiva Agrani* (Always Ahead)." },
  ],
  faqs: [
    { keys: ['why', 'benefit', 'worth', 'reason'], res: "🚀 **Why register?**\nColloquium 2.0 is designed to develop diplomacy, empathy, and critical thinking. You'll engage in high-stakes simulations, network with top students, and learn to think like a global policymaker." },
    { keys: ['beginner', 'newbie', 'first time'], res: "🌟 **Beginners are welcome!** We recommend the **UNFCCC** committee as it is specifically designed for those with 0-5 MUN experiences." },
    { keys: ['what is mun', 'meaning'], res: "🌐 **What is an MUN?** It's a simulation of the United Nations where you represent a country, debate global issues, and draft resolutions to solve world problems." },
    { keys: ['dress', 'wear', 'clothes'], res: "👔 **Dress Code:** Western Formals (Suits/Blazers) are required to maintain the professional diplomatic atmosphere." },
  ]
};

function processQuery(userInput) {
  const input = userInput.toLowerCase();

  // PRIORITY 1: Specific Matches (Committees/People)
  for (const item of DATABASE.specifics) {
    if (item.keys.some(k => input.includes(k))) {
      return item.res;
    }
  }

  // PRIORITY 2: Broad Categories (Fees/Registration/Dates)
  for (const item of DATABASE.categories) {
    if (item.keys.some(k => input.includes(k))) {
      return item.res;
    }
  }

  // PRIORITY 3: FAQs (Why/Beginners)
  for (const item of DATABASE.faqs) {
    if (item.keys.some(k => input.includes(k))) {
      return item.res;
    }
  }

  // GREETINGS
  if (['hi', 'hello', 'hey', 'sup'].some(g => input.includes(g))) {
    return "Greetings! 👋 I am the official Colloquium 2.0 Assistant. Ask me about a specific **Committee**, **Fees**, **Registration**, or our **Leadership**!";
  }

  return "I'm sorry, I couldn't find a specific answer to that. 😅 Please try asking about a **Committee name** (e.g., 'CBI'), **Fees**, **Registration**, or **Contact details**!";
}

function addMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender === 'bot' ? 'bot-msg' : 'user-msg');
  msgDiv.innerHTML = text.replace(/\n/g, '<br>'); 
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleChat() {
  const userText = chatInput.value.trim();
  if (!userText) return;

  addMessage(userText, 'user');
  chatInput.value = '';

  setTimeout(() => {
    const response = processQuery(userText);
    addMessage(response, 'bot');
  }, 300);
}

sendChat.addEventListener('click', handleChat);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });
