const statusBox = document.getElementById("status");
const hotspots = [...document.querySelectorAll(".hotspot")];
let hideTimer;

function showStatus(name) {
  clearTimeout(hideTimer);
  statusBox.textContent = `${name} selected`;
  statusBox.classList.add("show");
  hideTimer = setTimeout(() => statusBox.classList.remove("show"), 1500);
}

hotspots.forEach((hotspot) => {
  hotspot.addEventListener("click", (event) => {
    const href = hotspot.getAttribute("href");

    // Until final page or stream links are assigned, keep the user on this page
    // and confirm the tile selection.
    if (!href || href === "#") {
      event.preventDefault();
      showStatus(hotspot.dataset.name);
    }
  });
});
