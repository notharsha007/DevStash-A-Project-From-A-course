const chaosBox = document.getElementById("chaos-box");
const chaosIcons = Array.from(document.querySelectorAll(".chaos-icon"));
const revealTargets = document.querySelectorAll(".reveal");
const header = document.getElementById("site-header");
const yearNode = document.getElementById("year");
const billingButtons = document.querySelectorAll("[data-billing]");
const priceNode = document.querySelector("[data-price]");
const priceSuffixNode = document.querySelector("[data-price-suffix]");

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const chaosState = chaosIcons.map((icon, index) => ({
  node: icon,
  x: 24 + index * 22,
  y: 28 + (index % 4) * 44,
  vx: (Math.random() * 1.2 + 0.35) * (Math.random() > 0.5 ? 1 : -1),
  vy: (Math.random() * 1.2 + 0.35) * (Math.random() > 0.5 ? 1 : -1),
  angle: Math.random() * 360,
  spin: (Math.random() * 0.7 + 0.15) * (Math.random() > 0.5 ? 1 : -1),
  pulseOffset: Math.random() * Math.PI * 2,
}));

let mouse = { x: -9999, y: -9999, active: false };

function layoutChaos() {
  if (!chaosBox) return;

  const bounds = chaosBox.getBoundingClientRect();
  const width = bounds.width;
  const height = bounds.height;

  for (const item of chaosState) {
    const itemWidth = item.node.offsetWidth;
    const itemHeight = item.node.offsetHeight;
    item.x += item.vx;
    item.y += item.vy;
    item.angle += item.spin;

    if (item.x <= 0 || item.x + itemWidth >= width) {
      item.vx *= -1;
      item.x = Math.max(0, Math.min(item.x, width - itemWidth));
    }

    if (item.y <= 0 || item.y + itemHeight >= height) {
      item.vy *= -1;
      item.y = Math.max(0, Math.min(item.y, height - itemHeight));
    }

    if (mouse.active) {
      const centerX = item.x + itemWidth / 2;
      const centerY = item.y + itemHeight / 2;
      const dx = centerX - mouse.x;
      const dy = centerY - mouse.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 110) {
        const force = (110 - distance) / 110;
        item.vx += (dx / Math.max(distance, 1)) * force * 0.25;
        item.vy += (dy / Math.max(distance, 1)) * force * 0.25;
      }
    }

    item.vx *= 0.995;
    item.vy *= 0.995;

    const scale = 1 + Math.sin(performance.now() / 500 + item.pulseOffset) * 0.04;
    item.node.style.transform = `translate(${item.x}px, ${item.y}px) rotate(${item.angle}deg) scale(${scale})`;
  }

  requestAnimationFrame(layoutChaos);
}

if (chaosBox) {
  chaosBox.addEventListener("mousemove", (event) => {
    const rect = chaosBox.getBoundingClientRect();
    mouse = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true,
    };
  });

  chaosBox.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  requestAnimationFrame(layoutChaos);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    }
  },
  { threshold: 0.2 }
);

for (const target of revealTargets) {
  revealObserver.observe(target);
}

function updateHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 16);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

for (const button of billingButtons) {
  button.addEventListener("click", () => {
    for (const other of billingButtons) {
      other.classList.toggle("is-active", other === button);
    }

    if (!priceNode || !priceSuffixNode) return;

    const isYearly = button.dataset.billing === "yearly";
    priceNode.textContent = isYearly ? priceNode.dataset.yearly : priceNode.dataset.monthly;
    priceSuffixNode.textContent = isYearly ? "/year" : "/mo";
  });
}
