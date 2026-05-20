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

const responses = [
  {
    keywords: ["fee", "fees", "cost", "price", "payment", "pay"],
    answer:
      "The individual delegation fee is ₹2,300. International Press is ₹2,000. Suncity 37D delegation is ₹2,200, or ₹1,800 for IP. The school delegation fee is ₹2,299."
  },
  {
    keywords: ["date", "when", "schedule", "august"],
    answer: "Colloquium 2.0 is scheduled for 22nd-23rd August 2026."
  },
  {
    keywords: ["venue", "where", "location", "gurugram", "school"],
    answer: "The conference is hosted by Suncity School Sector 37D, Gurugram."
  },
  {
    keywords: ["register", "registration", "form", "apply", "seat"],
    answer:
      "Use the registration buttons in the Registration section. After payment, email the screenshot and your details to colloquium@suncityschool-37d.com."
  },
  {
    keywords: ["committee", "committees", "agenda", "agendas"],
    answer:
      "The committees include UNSC, UNFCCC, GFMC, Founders Circle, IMI, AIPPM, CBI, Mock Trial, IPL Auction, and International Press. You can filter and search them in the Committees section."
  },
  {
    keywords: ["beginner", "first", "new"],
    answer:
      "Beginner-friendly options depend on your interests, but International Press, IMI, UNFCCC, and AIPPM are approachable starting points. Crisis-style rooms like CBI can be more intense."
  },
  {
    keywords: ["contact", "email", "phone", "instagram", "help"],
    answer:
      "You can email colloquium@suncityschool-37d.com, message @colloquiummun_ on Instagram, or call Ranvir Srivastava at +91 8826369721 and Nancy Sharma at +91 9990603093."
  }
];

const getBotResponse = (message) => {
  const text = normalize(message);
  const match = responses.find((item) => item.keywords.some((keyword) => text.includes(keyword)));

  if (match) return match.answer;

  return "I can help with dates, fees, registration, committees, venue, and contacts. Try asking about one of those.";
};

const appendMessage = (text, type) => {
  if (!chatMessages) return;
  const message = document.createElement("div");
  message.className = `message ${type === "user" ? "user-msg" : "bot-msg"}`;
  message.textContent = text;
  chatMessages.appendChild(message);
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

const setChatBusy = (busy) => {
  if (chatInput) chatInput.disabled = busy;
  if (sendChat) sendChat.disabled = busy;
  quickChatButtons.forEach((btn) => { btn.disabled = busy; });
};

const sendMessage = (presetQuestion) => {
  const text = (presetQuestion || chatInput?.value || "").trim();
  if (!text) return;

  appendMessage(text, "user");
  if (chatInput) chatInput.value = "";
  setChatBusy(true);

  const indicator = showTypingIndicator();
  const delay = 420 + Math.random() * 360;

  window.setTimeout(() => {
    indicator?.remove();
    appendMessage(getBotResponse(text), "bot");
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