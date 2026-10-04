/**
 * Zentrale Telefonnummer der Website.
 * Vor dem Launch nur `display` und `href` an dieser Stelle ersetzen.
 */
const PHONE_NUMBER = Object.freeze({
  display: "+49 160 3789488",
  href: "tel:+491603789488",
});

document.querySelectorAll("[data-phone]").forEach((element) => {
  element.textContent = PHONE_NUMBER.display;
});

document.querySelectorAll("[data-phone-link]").forEach((element) => {
  element.setAttribute("href", PHONE_NUMBER.href);
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function animateGridLights() {
  const routePools = [...document.querySelectorAll("[data-motion-route]")].reduce(
    (pools, route) => {
      const pool = route.dataset.motionRoute;
      pools[pool] ||= [];
      pools[pool].push(route);
      return pools;
    },
    {},
  );
  const lights = [...document.querySelectorAll("[data-route-pool]")].map((light) => ({
    light,
    motion: light.querySelector(".light-motion"),
    motionPath: light.querySelector(".light-motion-path"),
    opacity: light.querySelector(".light-opacity"),
    path: null,
    pool: routePools[light.dataset.routePool] || [],
  }));

  if (!lights.length) return;

  function chooseRoute(state, initial = false) {
    const alternatives = state.pool.filter((route) => route !== state.path);
    const preferredRoute = initial
      ? document.getElementById(state.light.dataset.startRoute)
      : null;
    const routes = alternatives.length ? alternatives : state.pool;
    const nextRoute =
      preferredRoute && state.pool.includes(preferredRoute)
        ? preferredRoute
        : routes[Math.floor(Math.random() * routes.length)];

    if (!nextRoute) return;

    state.path = nextRoute;
    state.direction = initial
      ? Number(state.light.dataset.startDirection || 1)
      : Math.random() > 0.5
        ? 1
        : -1;
    const startProgress = initial ? Number(state.light.dataset.startProgress || 0) : 0;

    const speedMin = Number(state.light.dataset.speedMin || 56);
    const speedMax = Number(state.light.dataset.speedMax || 76);
    const pauseMin = Number(state.light.dataset.pauseMin || 0);
    const pauseMax = Number(state.light.dataset.pauseMax || 0);
    const speed = speedMin + Math.random() * (speedMax - speedMin);
    const delay = initial
      ? Number(state.light.dataset.startDelay || 0)
      : pauseMin + Math.random() * (pauseMax - pauseMin);
    const motionScale = prefersReducedMotion.matches ? 1.8 : 1;
    const duration = (nextRoute.getTotalLength() / speed) * 1000 * motionScale * (1 - startProgress);
    const from = state.direction === 1 ? startProgress : 1 - startProgress;
    const to = state.direction === 1 ? 1 : 0;

    state.motionPath.setAttribute("href", `#${nextRoute.id}`);
    state.motion.setAttribute("dur", `${duration}ms`);
    state.motion.setAttribute("keyPoints", `${from};${to}`);
    state.opacity.setAttribute("dur", `${duration}ms`);
    state.light.dataset.activeRoute = nextRoute.id;

    state.motion.beginElementAt(delay / 1000);
    state.opacity.beginElementAt(delay / 1000);
  }

  lights.forEach((state) => {
    if (
      !state.motion ||
      !state.motionPath ||
      !state.opacity ||
      typeof state.motion.beginElementAt !== "function"
    ) {
      return;
    }

    state.motion.addEventListener("endEvent", () => chooseRoute(state));
    chooseRoute(state, true);
  });
}

function copyWithFallback(value) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(value);
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();

  return copied ? Promise.resolve() : Promise.reject(new Error("copy failed"));
}

function enableContactShortcuts() {
  const mobileInteraction =
    navigator.userAgentData?.mobile ??
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const status = document.querySelector("[data-contact-status]");

  document.querySelectorAll("[data-contact-action]").forEach((link) => {
    const isPhone = link.dataset.contactAction === "phone";
    const value = isPhone ? PHONE_NUMBER.display : link.dataset.contactValue;
    const label = link.querySelector("[data-contact-label]");
    const originalLabel = label.textContent;

    if (mobileInteraction) {
      link.setAttribute(
        "aria-label",
        isPhone ? `${PHONE_NUMBER.display} anrufen` : `E-Mail an ${value} schreiben`,
      );
      return;
    }

    link.title = isPhone ? "Telefonnummer kopieren" : "E-Mail-Adresse kopieren";
    link.setAttribute(
      "aria-label",
      isPhone ? `Telefonnummer ${PHONE_NUMBER.display} kopieren` : `E-Mail-Adresse ${value} kopieren`,
    );

    link.addEventListener("click", async (event) => {
      event.preventDefault();

      try {
        await copyWithFallback(value);
        label.textContent = isPhone ? "Nummer kopiert" : "E-Mail kopiert";
        link.classList.add("is-copied");
        status.textContent = isPhone
          ? `Telefonnummer ${PHONE_NUMBER.display} kopiert.`
          : `E-Mail-Adresse ${value} kopiert.`;

        window.setTimeout(() => {
          label.textContent = originalLabel;
          link.classList.remove("is-copied");
        }, 1800);
      } catch {
        status.textContent = "Kopieren war nicht möglich.";
      }
    });
  });
}

animateGridLights();
enableContactShortcuts();
