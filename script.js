const sidebar = document.querySelector(".sidebar-nav");
const navToggles = document.querySelectorAll(".nav-toggle");
const navBackdrop = document.querySelector(".nav-backdrop");
const navLinks = document.querySelectorAll(".nav-links a");
const scrollProgress = document.getElementById("scrollProgress");
const mobileNavQuery = window.matchMedia("(max-width: 767px)");

const syncNavAccessibility = () => {
  if (!sidebar) return;
  const isMobile = mobileNavQuery.matches;
  const isOpen = sidebar.classList.contains("open");
  sidebar.setAttribute("aria-hidden", String(isMobile && !isOpen));
  if ("inert" in sidebar) {
    sidebar.inert = isMobile && !isOpen;
  }
};

const setNavState = (isOpen) => {
  sidebar?.classList.toggle("open", isOpen);
  navBackdrop?.classList.toggle("open", isOpen);
  document.body.classList.toggle("nav-open", isOpen);
  navToggles.forEach((toggle) => {
    toggle.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  syncNavAccessibility();
};

syncNavAccessibility();
const onNavQueryChange = () => {
  if (!mobileNavQuery.matches) {
    setNavState(false);
  }
  syncNavAccessibility();
};
if (mobileNavQuery.addEventListener) {
  mobileNavQuery.addEventListener("change", onNavQueryChange);
} else {
  mobileNavQuery.addListener(onNavQueryChange);
}

navToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    setNavState(!sidebar?.classList.contains("open"));
  });
});

navBackdrop?.addEventListener("click", () => setNavState(false));

navLinks.forEach((link) => {
  link.addEventListener("click", () => setNavState(false));
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setNavState(false);
    closeChatWindow();
  }
});

const updateProgress = () => {
  if (!scrollProgress) return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  scrollProgress.style.width = `${Math.min(progress, 100)}%`;
};

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const sections = [...document.querySelectorAll("main section[id], main .hero-section")];
const setActiveNav = () => {
  const current = sections
    .map((section) => {
      const id = section.id || "top";
      return { id, top: section.getBoundingClientRect().top };
    })
    .filter((item) => item.top <= 160)
    .pop();

  const activeId = current?.id || "top";
  navLinks.forEach((link) => {
    const matches = link.getAttribute("href") === `#${activeId}`;
    link.classList.toggle("active", matches);
    if (matches) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

window.addEventListener("scroll", setActiveNav, { passive: true });
setActiveNav();

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

const filterButtons = document.querySelectorAll(".filter-button[data-filter]");
const committeeCards = document.querySelectorAll(".committee-card");
const committeeSearch = document.getElementById("committeeSearch");
const clearCommitteeSearch = document.getElementById("clearCommitteeSearch");
const resetFilters = document.getElementById("resetFilters");
const committeeCount = document.getElementById("committeeCount");
let activeFilter = "all";

const normalize = (value) => value.trim().toLowerCase();

const updateCommitteeView = () => {
  const query = normalize(committeeSearch?.value || "");
  let visibleCount = 0;

  committeeCards.forEach((card) => {
    const categories = (card.dataset.category || "").split(" ");
    const text = normalize(card.textContent || "");
    const filterMatch = activeFilter === "all" || categories.includes(activeFilter);
    const searchMatch = !query || text.includes(query);
    const isVisible = filterMatch && searchMatch;

    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === activeFilter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (committeeCount) {
    if (visibleCount === committeeCards.length && !query && activeFilter === "all") {
      committeeCount.textContent = "Showing all committees";
    } else if (visibleCount === 0) {
      committeeCount.textContent = "No committees found";
    } else {
      committeeCount.textContent = `Showing ${visibleCount} committee${visibleCount === 1 ? "" : "s"}`;
    }
  }
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter || "all";
    updateCommitteeView();
  });
});

committeeSearch?.addEventListener("input", updateCommitteeView);

clearCommitteeSearch?.addEventListener("click", () => {
  if (committeeSearch) {
    committeeSearch.value = "";
    committeeSearch.focus();
  }
  updateCommitteeView();
});

resetFilters?.addEventListener("click", () => {
  activeFilter = "all";
  if (committeeSearch) committeeSearch.value = "";
  updateCommitteeView();
});

updateCommitteeView();

const chatWindow = document.getElementById("chatWindow");
const chatTrigger = document.getElementById("chatTrigger");
const closeChat = document.getElementById("closeChat");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");
const quickChatButtons = document.querySelectorAll(".quick-chat");

function openChatWindow() {
  chatWindow?.classList.add("open");
  chatTrigger?.setAttribute("aria-expanded", "true");
  chatTrigger?.setAttribute("aria-label", "Close AI Chat");
  window.setTimeout(() => chatInput?.focus(), 120);
}

function closeChatWindow() {
  chatWindow?.classList.remove("open");
  chatTrigger?.setAttribute("aria-expanded", "false");
  chatTrigger?.setAttribute("aria-label", "Open AI Chat");
  chatTrigger?.focus();
}

chatTrigger?.setAttribute("aria-expanded", "false");
chatTrigger?.addEventListener("click", () => {
  if (chatWindow?.classList.contains("open")) {
    closeChatWindow();
  } else {
    openChatWindow();
  }
});

closeChat?.addEventListener("click", closeChatWindow);

const intents = [
  {
    id: "greetings",
    keywords: ["hi", "hello", "hey", "hola", "greetings", "good morning", "good afternoon", "good evening", "yo", "wassup"],
    phrases: ["hello there", "is anyone there", "greetings bot", "hi assistant"],
    answer: "Hello! Welcome to Colloquium 2.0! 👋 How can I assist you today? I can help with dates, fees, registration, committees, venue, and contact details.",
    suggestions: ["What are the fees?", "Explore Committees", "How do I register?"]
  },
  {
    id: "farewells",
    keywords: ["bye", "goodbye", "see you", "exit", "close", "quit", "talk later"],
    phrases: ["see you later", "bye bye", "i am leaving"],
    answer: "Goodbye! Hope to see you at Colloquium 2.0. If you need anything else, feel free to open this chat again. Have a great day!",
    suggestions: ["Show dates", "Contact details"]
  },
  {
    id: "appreciation",
    keywords: ["thanks", "thank you", "ty", "appreciate", "helpful", "awesome", "perfect", "cool", "great", "nice"],
    phrases: ["thank you very much", "thanks a lot", "you are helpful"],
    answer: "You're very welcome! I'm glad I could help. Let me know if you have any other questions about the conference.",
    suggestions: ["Explore Committees", "How do I register?", "Contact details"]
  },
  {
    id: "fees",
    keywords: ["fee", "fees", "cost", "price", "pricing", "payment", "pay", "charge", "amount", "rupee", "rupees", "inr"],
    phrases: ["how much does it cost", "what are the fees", "how to pay", "fee structure", "payment details"],
    answer: "Individual Delegate fee: 2300 INR\nSchool Delegation fee: 2299 INR\nIP fees: 2000 INR\nIPL(TEAM EVENT)\nMINIMUM 2\nMAXIMUM 4\nTEAM OF 2: 4000 INR\nTEAM OF 3: 6000 INR\nTEAM OF 4: 8000 INR",
    suggestions: ["How do I register?", "Dates & Schedule", "Contact details"]
  },
  {
    id: "dates",
    keywords: ["date", "dates", "when", "schedule", "august", "timeline", "day", "days", "time", "clock"],
    phrases: ["when is the conference", "what are the dates", "dates of the event", "when does it start"],
    answer: "Colloquium 2.0 is scheduled for Saturday, 22nd August and Sunday, 23rd August 2026.",
    suggestions: ["Where is it?", "Explore Committees", "How do I register?"]
  },
  {
    id: "venue",
    keywords: ["venue", "where", "location", "gurugram", "school", "address", "map", "place", "hosted", "host", "suncity"],
    phrases: ["where is it located", "what is the venue", "directions to the school", "where is suncity school"],
    answer: "The conference is hosted by Suncity School, Sector 37D, Gurugram, Haryana, India. It's a state-of-the-art campus perfect for diplomacy!",
    suggestions: ["Show dates", "Contact details", "How do I register?"]
  },
  {
    id: "registration",
    keywords: ["register", "registration", "form", "apply", "seat", "link", "google form", "join", "enroll", "paying", "screenshot", "mail", "colloquium@suncityschool-37d.com"],
    phrases: ["how to register", "where is the registration link", "registration steps", "how to apply"],
    answer: "To register:\n1. Click the registration buttons in the Registration section of the website.\n• Individual Delegation Form: https://forms.gle/Uoqj1fRcY7MJfkh97\n• School Delegation Form: https://forms.gle/TjoibnjD6bvaLffi8\n2. Make the payment.\n3. Email your payment receipt screenshot and details to colloquium@suncityschool-37d.com.",
    suggestions: ["Show fees", "Contact details", "Explore Committees"]
  },
  {
    id: "committees_general",
    keywords: ["committee", "committees", "agenda", "agendas", "portfolio", "portfolios", "topics", "simulation"],
    phrases: ["what are the committees", "list of committees", "committee agendas", "which committees do you have"],
    answer: "Colloquium 2.0 features 10 committees:\n• UNSC: Reviewing the rise of communal terrorism with special emphasis on the Sahel Region.\n• UNFCCC: Deliberation on reducing the effects of carbon emissions with special emphasis on sustainable energy sources.\n• GFMC: Deliberation on the Global Financial Crisis and measures to restore economic stability.\n• Founders Circle: Deliberating the ethical responsibility of tech founders in the age of AI — should billionaire entrepreneurs be regulated by democratic institutions?\n• IMI: Discussing Whether Influencer Culture Is Inspiring a Generation or Destroying It.\n• AIPPM: Analysing the Centralisation of Power and Federal Tensions Between State Governments and the Union Government.\n• CBI: The Head of the State has gone missing 24 hours before national elections. Intelligence failure, internal betrayal, or foreign conspiracy?\n• Mock Trial: US format (prosecution v/s defense). Case file will be revealed prior to the conference.\n• IPL Auction: Minimum: 2 members. Maximum: 4 members.\n• International Press: Inviting Journalists, Photographers, and Caricaturists.",
    suggestions: ["Beginner Committees", "CBI Committee", "IPL Auction Info"]
  },
  {
    id: "beginner_friendly",
    keywords: ["beginner", "beginners", "first", "new", "easy", "novice", "approachable", "first-time", "start", "simple"],
    phrases: ["which committee is for beginners", "i am a beginner", "best committee for first timers", "easy committees"],
    answer: "If it's your first MUN, we highly recommend:\n• International Press (IP): Great if you love writing, journalism, or photography.\n• IMI: Relatable debates on influencer culture.\n• UNFCCC: Straightforward climate change policy research.\n• AIPPM: Perfect if you follow Indian politics.\nCrisis-style rooms like CBI can be more intense for beginners!",
    suggestions: ["UNFCCC Info", "International Press", "AIPPM Info"]
  },
  {
    id: "unsc",
    keywords: ["unsc", "security council", "sahel", "terrorism", "communal"],
    phrases: ["tell me about unsc", "unsc agenda", "unsc topic"],
    answer: "UNSC (United Nations Security Council) Agenda:\n'Reviewing the rise of communal terrorism with special emphasis on the Sahel Region.'",
    suggestions: ["UNFCCC Info", "All Committees", "Show fees"]
  },
  {
    id: "unfccc",
    keywords: ["unfccc", "climate", "carbon", "emissions", "environment", "energy", "sustainable"],
    phrases: ["tell me about unfccc", "unfccc agenda", "climate committee"],
    answer: "UNFCCC (United Nations Framework Convention on Climate Change) Agenda:\n'Deliberation on reducing the effects of carbon emissions with special emphasis on sustainable energy sources.'",
    suggestions: ["UNSC Info", "All Committees", "Show fees"]
  },
  {
    id: "gfmc",
    keywords: ["gfmc", "finance", "economic", "financial", "crisis", "stability", "market", "money", "restoring"],
    phrases: ["tell me about gfmc", "gfmc agenda", "finance committee"],
    answer: "GFMC (Global Financial Meltdown Council) Agenda:\n'Deliberation on the Global Financial Crisis and measures to restore economic stability.'",
    suggestions: ["Founders Circle Info", "All Committees", "Show fees"]
  },
  {
    id: "founders_circle",
    keywords: ["founders", "circle", "founders circle", "billionaire", "tech", "regulate", "elon", "bezos", "billionaires", "silicon"],
    phrases: ["tell me about founders circle", "founders circle agenda", "billionaires committee"],
    answer: "Founders Circle Agenda:\n'Deliberating the ethical responsibility of tech founders in the age of AI — should billionaire entrepreneurs be regulated by democratic institutions?'",
    suggestions: ["IMI Info", "All Committees", "Show fees"]
  },
  {
    id: "imi",
    keywords: ["imi", "influencer", "influencers", "culture", "media", "social media", "instagram", "tiktok", "youtube"],
    phrases: ["tell me about imi", "imi agenda", "influencer culture"],
    answer: "IMI (Influencers Meet India) Agenda:\n'Discussing Whether Influencer Culture Is Inspiring a Generation or Destroying It.'",
    suggestions: ["Beginner Committees", "All Committees", "Show fees"]
  },
  {
    id: "aippm",
    keywords: ["aippm", "parliament", "indian politics", "federal", "state", "union", "centralisation", "parties", "loksabha", "modi"],
    phrases: ["tell me about aippm", "aippm agenda", "indian politics committee"],
    answer: "AIPPM (All India Political Parties Meet) Agenda:\n'Analysing the Centralisation of Power and Federal Tensions Between State Governments and the Union Government.'",
    suggestions: ["CBI Info", "All Committees", "Show fees"]
  },
  {
    id: "cbi",
    keywords: ["cbi", "investigation", "missing", "crisis", "head of state", "prime minister", "election", "national elections"],
    phrases: ["tell me about cbi", "cbi agenda", "crisis committee", "missing head of state"],
    answer: "CBI (Central Bureau of Investigation) Agenda:\n'The Head of the State has gone missing 24 hours before national elections. Intelligence failure, internal betrayal, or foreign conspiracy?'",
    suggestions: ["Mock Trial Info", "All Committees", "Show fees"]
  },
  {
    id: "mock_trial",
    keywords: ["mock", "trial", "mock trial", "court", "prosecution", "defense", "law", "lawyer", "judge", "legal", "courtroom"],
    phrases: ["tell me about mock trial", "mock trial agenda", "legal committee"],
    answer: "Mock Trial Agenda:\n'US format (prosecution v/s defense). Case file will be revealed prior to the conference.'",
    suggestions: ["IPL Auction Info", "All Committees", "Show fees"]
  },
  {
    id: "ipl_auction",
    keywords: ["ipl", "cricket", "auction", "bid", "bidding", "ipl auction", "sports", "dhoni", "kohli", "team", "cricketers"],
    phrases: ["tell me about ipl auction", "ipl auction rules", "cricket auction"],
    answer: "IPL Auction Agenda:\n'Minimum: 2 members. Maximum: 4 members.'",
    suggestions: ["Mock Trial Info", "All Committees", "Show fees"]
  },
  {
    id: "international_press",
    keywords: ["ip", "international press", "press", "journalism", "journalist", "photographer", "caricaturist", "reporter", "newsletter"],
    phrases: ["tell me about international press", "ip agenda", "press committee"],
    answer: "International Press (IP) Agenda:\n'Inviting Journalists, Photographers, and Caricaturists.'",
    suggestions: ["Beginner Committees", "Fees Info", "How do I register?"]
  },
  {
    id: "contact",
    keywords: ["contact", "email", "phone", "instagram", "help", "support", "ranvir", "srivastava", "sarthak", "phogat", "nancy", "sharma", "number", "call", "reach", "socials", "organizers"],
    phrases: ["how to contact", "phone number", "email address", "secretariat details"],
    answer: "You can reach the Colloquium 2.0 team:\n• Email: colloquium@suncityschool-37d.com\n• Instagram: @colloquiummun_\n• Ranvir Srivastava (Founder): +91 8826369721\n• Sarthak Phogat (Secretary General): +91 8447022222\n• Nancy Sharma (Charge D'Affairs): +91 9990603093",
    suggestions: ["How do I register?", "Show dates", "All Committees"]
  },
  {
    id: "brochure",
    keywords: ["brochure", "pdf", "booklet", "download", "guidebook", "rules", "doc", "document"],
    phrases: ["is there a brochure", "download brochure", "read brochure"],
    answer: "Our website contains all the details from the official brochure! For a PDF version, feel free to email colloquium@suncityschool-37d.com and our team will share it with you.",
    suggestions: ["Explore Committees", "Show fees", "Contact details"]
  },
  {
    id: "about_colloquium",
    keywords: ["colloquium", "mun", "model", "united", "nations", "vision", "about", "dialogue", "diplomacy", "suncity", "purpose", "goal"],
    phrases: ["what is colloquium", "about the mun", "what is this website", "vision of the conference"],
    answer: "Colloquium 2.0 is a premier Model United Nations (MUN) conference hosted by Suncity School, Sector 37D, Gurugram. It serves as a platform for young minds to explore diplomacy, develop critical thinking, and experience the power of dialogue in addressing complex global issues.",
    suggestions: ["Explore Committees", "How do I register?", "From The Secretariat"]
  },
  {
    id: "secretariat",
    keywords: ["secretariat", "organizers", "organise", "guneet", "ohri", "giggashu", "punia", "ranvir", "srivastava", "sarthak", "phogat", "nancy", "sharma", "coordinator", "director", "founder", "leaders"],
    phrases: ["who is organizing this", "secretariat details", "who is the director", "mun coordinator", "founders of colloquium"],
    answer: "The Colloquium 2.0 leadership team includes:\n• Ms. Guneet Ohri (Director)\n• Mr. Giggashu Punia (MUN Coordinator)\n• Ranvir Srivastava (Founder, Project Colloquium)\n• Sarthak Phogat (Secretary General)\n• Nancy Sharma (Charge D'Affairs)\nThey are committed to organizing a rigorous, respectful, and impactful conference!",
    suggestions: ["Contact details", "How do I register?"]
  },
  {
    id: "capabilities",
    keywords: ["help", "info", "information", "capabilities", "do", "bot", "assistant", "questions", "ask", "guidance"],
    phrases: ["what can you do", "help me", "how to use this chat", "list of commands"],
    answer: "I am the Colloquium 2.0 AI Assistant. I can help you with:\n• **Fee structures** (individual, school, and team fees)\n• **Agendas** for all 10 committees\n• **Dates & Schedule** details\n• **Registration steps** & Google Form links\n• **Venue address** & directions\n• **Contact details** for organizers",
    suggestions: ["What are the fees?", "Explore Committees", "How do I register?"]
  }
];

const cleanText = (text) => {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'\\\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getTokens = (text) => {
  return cleanText(text).split(" ").filter((token) => token.length > 0);
};

// Levenshtein Distance for fuzzy spelling matching
const getLevenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const genericWords = new Set([
  "topics", "topic", "committee", "committees", "info", "information", "details", "show", 
  "tell", "need", "want", "get", "find", "ask", "question", "questions", "help", "bot", "assistant", 
  "agenda", "agendas", "portfolio", "portfolios", "simulation", "rules", "rule", "fee", "fees", "cost", 
  "price", "pricing", "payment", "pay", "charge", "amount", "rupee", "rupees", "inr", "date", "dates", 
  "when", "schedule", "timeline", "day", "days", "time", "clock", "venue", "where", "location", "address", 
  "map", "place", "hosted", "host", "register", "registration", "form", "apply", "seat", "link", 
  "google form", "join", "enroll", "paying", "screenshot", "mail", "email", "phone", "instagram", 
  "support", "number", "call", "reach", "socials", "organizers", "organize", "brochure", "pdf", 
  "booklet", "download", "guidebook", "rules", "doc", "document", "about", "purpose", "goal", 
  "leadership", "leader", "leaders", "coordinator", "director", "founder", "mun"
]);

const isFuzzyMatch = (word1, word2) => {
  const len1 = word1.length;
  const len2 = word2.length;
  if (Math.abs(len1 - len2) > 2) return false;
  const dist = getLevenshteinDistance(word1, word2);
  if (len1 >= 6 && len2 >= 6) {
    return dist <= 2;
  }
  if (len1 >= 4 && len2 >= 4) {
    return dist <= 1;
  }
  // Allow length 3 specific words to match with distance 1
  if (len1 >= 3 && len2 >= 3 && dist <= 1) {
    const isSpecific = !genericWords.has(word1) && !genericWords.has(word2);
    if (isSpecific) {
      return true;
    }
  }
  return false;
};

// Build a dictionary of keyword frequency across all intents to calculate specificity (TF-IDF-like weight)
const keywordFrequency = {};
intents.forEach((intent) => {
  const seenInIntent = new Set();
  if (intent.keywords) {
    intent.keywords.forEach((kw) => {
      seenInIntent.add(kw.toLowerCase());
    });
  }
  // Also treat words in the intent ID as keywords
  const idParts = intent.id.toLowerCase().split("_");
  idParts.forEach((part) => {
    seenInIntent.add(part);
  });
  
  seenInIntent.forEach((kw) => {
    keywordFrequency[kw] = (keywordFrequency[kw] || 0) + 1;
  });
});

// Safe HTML and URL formatter to support rich text bolding and links
const escapeHTML = (str) => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatMessageText = (str) => {
  const escaped = escapeHTML(str);
  // Convert http/https links
  let formatted = escaped.replace(/(https?:\/\/[^\s\n]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  // Convert email links
  formatted = formatted.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>');
  // Convert phone links
  formatted = formatted.replace(/(\+91\s?\d{10})/g, '<a href="tel:$1">$1</a>');
  // Convert markdown-style **bold** to <strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  return formatted;
};

// Real-time Page Content Search (Fallback)
const stopwords = new Set(["the", "a", "an", "is", "are", "was", "were", "of", "in", "on", "at", "by", "to", "for", "and", "or", "but", "with", "about", "this", "that", "these", "those", "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them", "my", "your", "his", "their", "our"]);

const searchPageContent = (queryTokens) => {
  const cleanTokens = queryTokens.filter(t => !stopwords.has(t) && t.length >= 3);
  if (cleanTokens.length === 0) return null;

  const pageSections = [
    { id: "vision", name: "Our Vision", selector: ".intro-section" },
    { id: "secretariat", name: "From The Secretariat", selector: ".messages-section" },
    { id: "committees", name: "Committees", selector: "#committees" },
    { id: "fees", name: "Fee Structure", selector: "#fees" },
    { id: "registration", name: "Registration", selector: "#registration" },
    { id: "contact", name: "Contact Us", selector: "#contact" }
  ];

  let bestSection = null;
  let maxMatches = 0;

  pageSections.forEach((section) => {
    // Safely check if document exists (for Node environment tests)
    const el = typeof document !== 'undefined' ? document.querySelector(section.selector) : null;
    if (!el) return;
    const textContent = el.textContent.toLowerCase();
    let matches = 0;

    cleanTokens.forEach((token) => {
      if (textContent.includes(token)) {
        matches++;
      } else {
        const sectionWords = textContent.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, " ").split(/\s+/);
        for (const word of sectionWords) {
          if (word.length >= 4 && isFuzzyMatch(token, word)) {
            matches += 0.8;
            break;
          }
        }
      }
    });

    if (matches > maxMatches) {
      maxMatches = matches;
      bestSection = section;
    }
  });

  if (bestSection && maxMatches >= 0.8) {
    return {
      sectionName: bestSection.name,
      selector: bestSection.selector,
      score: maxMatches
    };
  }

  return null;
};

const getPresetQuestion = (label) => {
  const mapping = {
    "What are the fees?": "What are the fees?",
    "Explore Committees": "What are the committees?",
    "How do I register?": "How do I register?",
    "Show dates": "When is the conference?",
    "Contact details": "How do I contact you?",
    "Where is it?": "What is the venue?",
    "Beginner Committees": "Which committees are beginner-friendly?",
    "CBI Committee": "Tell me about CBI",
    "IPL Auction Info": "Tell me about IPL Auction",
    "UNFCCC Info": "Tell me about UNFCCC",
    "UNSC Info": "Tell me about UNSC",
    "AIPPM Info": "Tell me about AIPPM",
    "GFMC Info": "Tell me about GFMC",
    "Founders Circle Info": "Tell me about Founders Circle",
    "IMI Info": "Tell me about IMI",
    "Mock Trial Info": "Tell me about Mock Trial",
    "International Press": "Tell me about International Press",
    "Fees Info": "What are the fees?",
    "How to register?": "How do I register?",
    "How to apply": "How do I register?",
    "From The Secretariat": "Who is in the Secretariat?",
    "Our Vision": "What is the vision of Colloquium?",
    "Dates & Schedule": "When is the conference?",
    "All Committees": "What are the committees?",
    "Show fees": "What are the fees?"
  };
  return mapping[label] || label;
};

const getBotResponse = (message) => {
  // Input sanity checks & guard rails
  if (!message || typeof message !== "string") {
    return {
      answer: "Please ask a question, and I'll do my best to help!",
      suggestions: ["What are the fees?", "Explore Committees", "How do I register?"]
    };
  }

  // Handle extreme inputs (spam/DOS protection)
  let processedMessage = message;
  if (message.length > 500) {
    processedMessage = message.slice(0, 500);
  }

  const queryText = cleanText(processedMessage);
  let queryTokens = getTokens(processedMessage);

  if (queryTokens.length === 0) {
    return {
      answer: "Please ask a question, and I'll do my best to help!",
      suggestions: ["What are the fees?", "Explore Committees", "How do I register?"]
    };
  }

  // Limit processing to first 15 tokens to avoid CPU hogging
  if (queryTokens.length > 15) {
    queryTokens = queryTokens.slice(0, 15);
  }

  let bestIntents = [];
  let highestScore = 0;

  for (const intent of intents) {
    let score = 0;
    let matchedKeywordsCount = 0;

    // 1. Direct phrase matching
    if (intent.phrases) {
      for (const phrase of intent.phrases) {
        if (queryText.includes(phrase.toLowerCase())) {
          score += 15.0;
        }
      }
    }

    // 2. Token keyword matching (per token, avoiding double-counting within same intent)
    if (intent.keywords) {
      const intentKeywords = [...intent.keywords];
      const idParts = intent.id.toLowerCase().split("_");
      idParts.forEach((part) => {
        if (!intentKeywords.includes(part)) {
          intentKeywords.push(part);
        }
      });

      const matchedKeysInIntent = new Set();

      const tokenScores = queryTokens.map((token) => {
        let bestTokenScore = 0;
        let bestKwMatched = null;

        for (const keyword of intentKeywords) {
          const kw = keyword.toLowerCase();
          const kwFreq = keywordFrequency[kw] || 1;
          
          let specificityMultiplier = 1.0;
          if (!genericWords.has(kw)) {
            if (kwFreq === 1) specificityMultiplier = 2.0;
            else if (kwFreq === 2) specificityMultiplier = 1.5;
            else if (kwFreq === 3) specificityMultiplier = 1.2;
          }

          let tokenScore = 0;
          if (token === kw) {
            tokenScore = 5.0; // Exact word match
          } else if (isFuzzyMatch(token, kw)) {
            tokenScore = 3.5; // Fuzzy match
          } else if (token.startsWith(kw) && kw.length >= 3) {
            tokenScore = 2.5; // Stem match
          } else if (kw.startsWith(token) && token.length >= 3) {
            tokenScore = 1.5; // Plural stem match
          }

          const weightedScore = tokenScore * specificityMultiplier;
          if (weightedScore > bestTokenScore) {
            bestTokenScore = weightedScore;
            bestKwMatched = kw;
          }
        }

        if (bestTokenScore > 0 && bestKwMatched) {
          matchedKeysInIntent.add(bestKwMatched);
        }
        return bestTokenScore;
      });

      score += tokenScores.reduce((sum, s) => sum + s, 0);
      matchedKeywordsCount = matchedKeysInIntent.size;
    }

    // 3. ID part matching boost (per token)
    if (score > 0) {
      const idParts = intent.id.toLowerCase().split("_");
      const tokenBoosts = queryTokens.map((token) => {
        let bestBoost = 0;
        idParts.forEach((part) => {
          if (token === part) {
            bestBoost = Math.max(bestBoost, 5.0);
          } else if (isFuzzyMatch(token, part)) {
            bestBoost = Math.max(bestBoost, 3.0);
          }
        });
        return bestBoost;
      });
      score += tokenBoosts.reduce((sum, b) => sum + b, 0);
    }

    // Keep track of all intents that score the highest
    if (score > highestScore) {
      highestScore = score;
      bestIntents = [{ intent, score, matchedCount: matchedKeywordsCount }];
    } else if (score === highestScore && score > 0) {
      bestIntents.push({ intent, score, matchedCount: matchedKeywordsCount });
    }
  }

  let selectedIntent = null;

  if (bestIntents.length > 0 && highestScore >= 3.5) {
    if (bestIntents.length === 1) {
      selectedIntent = bestIntents[0].intent;
    } else {
      // Tie-breaker 1: Select the intent with the higher proportion of matched keywords
      bestIntents.sort((a, b) => {
        const ratioA = a.matchedCount / (a.intent.keywords ? a.intent.keywords.length : 1);
        const ratioB = b.matchedCount / (b.intent.keywords ? b.intent.keywords.length : 1);
        if (ratioA !== ratioB) {
          return ratioB - ratioA; // Higher ratio first
        }
        
        // Tie-breaker 2: Prefer specific intents over generic/general intents
        const generalIntents = ["committees_general", "capabilities", "about_colloquium"];
        const isGeneralA = generalIntents.includes(a.intent.id);
        const isGeneralB = generalIntents.includes(b.intent.id);
        if (isGeneralA !== isGeneralB) {
          return isGeneralA ? 1 : -1; // Specific first
        }
        
        return 0;
      });
      selectedIntent = bestIntents[0].intent;
    }
  }

  if (selectedIntent) {
    return {
      answer: selectedIntent.answer,
      suggestions: selectedIntent.suggestions || []
    };
  }

  // Fallback Layer 2: Real-time Page Content Search
  const pageMatch = searchPageContent(queryTokens);
  if (pageMatch) {
    return {
      answer: `I couldn't find a direct chatbot answer, but I found relevant details in the **${pageMatch.sectionName}** section on the website page.`,
      suggestions: [
        `Go to ${pageMatch.sectionName}`,
        "What are the fees?",
        "Explore Committees",
        "How do I register?"
      ]
    };
  }

  // Fallback Layer 3: General Guidance
  return {
    answer: "I couldn't find a direct answer to that. Here are some topics I can help you with:",
    suggestions: [
      "What are the fees?",
      "Explore Committees",
      "How do I register?",
      "Show dates",
      "Contact details"
    ]
  };
};

const appendMessage = (text, type, suggestions = []) => {
  if (!chatMessages) return;
  const message = document.createElement("div");
  message.className = `message ${type === "user" ? "user-msg" : "bot-msg"}`;
  
  const textContainer = document.createElement("div");
  textContainer.style.whiteSpace = "pre-line";
  textContainer.innerHTML = formatMessageText(text);
  message.appendChild(textContainer);
  
  chatMessages.appendChild(message);

  if (type === "bot" && suggestions.length > 0) {
    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.className = "message-suggestions";
    
    suggestions.forEach((label) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quick-chat";
      btn.textContent = label;
      btn.addEventListener("click", () => {
        sendMessage(getPresetQuestion(label));
      });
      suggestionsContainer.appendChild(btn);
    });
    
    chatMessages.appendChild(suggestionsContainer);
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const showTypingIndicator = () => {
  if (!chatMessages) return null;
  const indicator = document.createElement("div");
  indicator.className = "message bot-msg typing-indicator";
  indicator.setAttribute("aria-label", "Assistant is typing");
  indicator.innerHTML = "<span></span><span></span><span></span>";
  chatMessages.appendChild(indicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return indicator;
};

const disableAllPreviousSuggestions = () => {
  const previousButtons = chatMessages?.querySelectorAll(".message-suggestions button");
  if (previousButtons) {
    previousButtons.forEach((btn) => {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.pointerEvents = "none";
    });
  }
};

const setChatBusy = (busy) => {
  if (chatInput) chatInput.disabled = busy;
  if (sendChat) sendChat.disabled = busy;
  quickChatButtons.forEach((btn) => { btn.disabled = busy; });
  
  const currentSuggestions = chatMessages?.querySelectorAll(".message-suggestions button");
  if (currentSuggestions) {
    currentSuggestions.forEach((btn) => { btn.disabled = busy; });
  }
};

const sendMessage = (presetQuestion) => {
  const text = (presetQuestion || chatInput?.value || "").trim();
  if (!text) return;

  disableAllPreviousSuggestions();

  if (text.startsWith("Go to ")) {
    const sectionName = text.replace("Go to ", "");
    const mapping = {
      "Our Vision": ".intro-section",
      "From The Secretariat": ".messages-section",
      "Committees": "#committees",
      "Fee Structure": "#fees",
      "Registration": "#registration",
      "Contact Us": "#contact"
    };
    const selector = mapping[sectionName];
    const element = typeof document !== 'undefined' ? document.querySelector(selector) : null;
    
    appendMessage(text, "user");
    if (chatInput) chatInput.value = "";
    setChatBusy(true);

    const indicator = showTypingIndicator();
    const delay = 400;

    window.setTimeout(() => {
      indicator?.remove();
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        appendMessage(`I have smoothly scrolled the page to the **${sectionName}** section for you! Let me know if you need help with anything else.`, "bot", ["What are the fees?", "Explore Committees", "How do I register?"]);
      } else {
        appendMessage(`I attempted to scroll to the **${sectionName}** section, but couldn't locate it on the page.`, "bot", ["What are the fees?", "Explore Committees"]);
      }
      setChatBusy(false);
      chatInput?.focus();
    }, delay);
    return;
  }

  appendMessage(text, "user");
  if (chatInput) chatInput.value = "";
  setChatBusy(true);

  const indicator = showTypingIndicator();
  const delay = 420 + Math.random() * 360;

  window.setTimeout(() => {
    indicator?.remove();
    const botResponse = getBotResponse(text);
    appendMessage(botResponse.answer, "bot", botResponse.suggestions);
    setChatBusy(false);
    chatInput?.focus();
  }, delay);
};

sendChat?.addEventListener("click", () => sendMessage());

chatInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !chatInput.disabled) {
    sendMessage();
  }
});

quickChatButtons.forEach((button) => {
  button.addEventListener("click", () => {
    sendMessage(button.dataset.question || button.textContent || "");
  });
});
