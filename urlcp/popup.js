chrome.tabs.query({
  active: true,
  currentWindow: true
}, (tabs) => {
  const t = tabs[0];
  const text = `${t.title} ${t.url}`;
  copyToClipboard(text);
  const status = document.getElementById("status");
  status.textContent = "Copied!";
});

function copyToClipboard(text) {
  const area = document.createElement("textarea");
  document.body.appendChild(area);
  area.value = text;
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
}
