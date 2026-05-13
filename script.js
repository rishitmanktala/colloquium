const sidebar = document.querySelector(".sidebar-nav");
const navToggles = document.querySelectorAll(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const filterButtons = document.querySelectorAll(".filter-button");
const committeeCards = document.querySelectorAll(".committee-card");
const sections = document.querySelectorAll("section[id]");

// Sidebar Toggle (Mobile)
navToggles.forEach(toggle => {
  toggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("menu-open");
    navToggles.forEach(t => t.setAttribute("aria-expanded", String(isOpen)));
  });
});

// Close sidebar on link click (Mobile)
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    sidebar.classList.remove("menu-open");
    navToggles.forEach(t => t.setAttribute("aria-expanded", "false"));
  });
});

// Active Link Highlight on Scroll
window.addEventListener("scroll", () => {
  let current = "";
  const scrollPos = window.pageYOffset || document.documentElement.scrollTop;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120;
    const sectionId = section.getAttribute("id");
    if (scrollPos >= sectionTop) {
      current = sectionId;
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// Committee Filtering
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
