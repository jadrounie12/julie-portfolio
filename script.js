const portrait = document.querySelector(".portrait");
if (!portrait) {
  throw new Error("Portrait missing");
}

const stage = portrait.querySelector(".stage");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const radiusOpen = 110;
const restX = 0.52;
const restY = 0.27;
const restR = 62;
const easeIn = 0.24;
const easeOut = 0.13;

let targetX = restX;
let targetY = restY;
let targetR = reduced.matches ? 0 : restR;
let currentX = restX;
let currentY = restY;
let currentR = 0;
let hovering = false;
let raf = 0;

function setReveal() {
  portrait.style.setProperty("--mx", `${(currentX * 100).toFixed(3)}%`);
  portrait.style.setProperty("--my", `${(currentY * 100).toFixed(3)}%`);
  portrait.style.setProperty("--radius", `${currentR.toFixed(2)}px`);
  portrait.style.setProperty("--feather", `${Math.min(46, currentR * 0.42).toFixed(2)}px`);
}

function tick() {
  const ease = hovering ? easeIn : easeOut;
  currentX += (targetX - currentX) * ease;
  currentY += (targetY - currentY) * ease;
  currentR += (targetR - currentR) * ease;

  if (Math.abs(targetX - currentX) < 0.0008) currentX = targetX;
  if (Math.abs(targetY - currentY) < 0.0008) currentY = targetY;
  if (Math.abs(targetR - currentR) < 0.2) currentR = targetR;

  setReveal();

  const moving =
    hovering ||
    Math.abs(targetX - currentX) > 0.0008 ||
    Math.abs(targetY - currentY) > 0.0008 ||
    Math.abs(targetR - currentR) > 0.2;

  if (moving) {
    raf = requestAnimationFrame(tick);
  } else {
    raf = 0;
  }
}

function startTick() {
  if (!raf) raf = requestAnimationFrame(tick);
}

function pointFromEvent(event) {
  const rect = stage.getBoundingClientRect();
  const point = "touches" in event ? event.touches[0] : event;
  return {
    x: Math.min(1, Math.max(0, (point.clientX - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (point.clientY - rect.top) / rect.height)),
  };
}

function onMove(event) {
  if (reduced.matches) return;
  hovering = true;
  portrait.classList.add("is-scanning");
  const point = pointFromEvent(event);
  targetX = point.x;
  targetY = point.y;
  targetR = radiusOpen;
  startTick();
}

function onLeave() {
  hovering = false;
  portrait.classList.remove("is-scanning");
  targetX = restX;
  targetY = restY;
  targetR = reduced.matches ? 0 : restR;
  startTick();
}

portrait.addEventListener("mousemove", onMove);
portrait.addEventListener("mouseleave", onLeave);
portrait.addEventListener("touchstart", onMove, { passive: true });
portrait.addEventListener("touchmove", onMove, { passive: true });
portrait.addEventListener("touchend", onLeave);

if (!reduced.matches) {
  startTick();
} else {
  setReveal();
}

const heroVideo = document.querySelector(".video-frame video");
if (heroVideo && reduced.matches) {
  heroVideo.pause();
  heroVideo.removeAttribute("autoplay");
}

const revealNodes = document.querySelectorAll(".reveal");
if (!reduced.matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
  );
  revealNodes.forEach((node) => observer.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-in"));
}
