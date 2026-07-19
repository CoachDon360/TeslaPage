/*
  CoachDonXM v9.0.1 — four approved UI fixes
  This runs after radio-v9.js and leaves streaming/metadata logic untouched.
*/
(() => {
  "use strict";

  const cleanStationName = (value) => {
    if (!value) return value;
    const normalized = value.trim();

    if (/^(?:181(?:\.fm)?\s*)?(?:the\s*)?yacht(?:\s*rock)?$/i.test(normalized)) {
      return "The Yacht";
    }

    if (/^(?:181(?:\.fm)?\s*)?soul$/i.test(normalized)) {
      return "Soul";
    }

    return value;
  };

  const cleanNode = (node) => {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return;

    const candidates = [
      node,
      ...node.querySelectorAll(
        ".station-row .name, #stationTitle, #miniTitle, #artName"
      )
    ];

    for (const element of candidates) {
      if (!(element instanceof HTMLElement)) continue;

      const current = element.textContent;
      const cleaned = cleanStationName(current);

      if (cleaned !== current) {
        element.textContent = cleaned;
      }
    }
  };

  const applyFixes = () => cleanNode(document.body);

  // Run after the station list is first rendered.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyFixes, { once: true });
  } else {
    applyFixes();
  }

  // Re-apply only when v9 updates a station or metadata field.
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        cleanNode(mutation.target.parentElement);
      } else {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) cleanNode(node);
        }
        cleanNode(mutation.target);
      }
    }
  });

  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true
  });
})();
