const parent = chrome.contextMenus.create({
  id: "parent",
  title: "urlcp",
  contexts: ["all"],
  type: "normal"
});

const copyHead = chrome.contextMenus.create({
  id: "copyHead",
  title: "Copy Head",
  contexts: ["all"],
  type: "normal",
  parentId: "parent"
});

const copyLink = chrome.contextMenus.create({
  id: "copyLink",
  title: "Copy Link",
  contexts: ["link"],
  type: "normal",
  parentId: "parent"
});

const listeners = {
  copyHead: onCopyHead,
  copyLink: onCopyLink
};

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const mid = info.menuItemId;
  if (mid in listeners) {
    listeners[mid](info, tab);
  } else {
    console.log(`urlcp: no listener for ${mid}`);
  }
});

function copyToClipboard(text) {
  const area = document.createElement("textarea");
  document.body.appendChild(area);
  area.value = text;
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
}

function onCopyHead(info, tab) {
  const t = `${tab.title} ${tab.url}`;
  copyToClipboard(t);
}

function onCopyLink(info, tab) {
  const t = `${info.selectionText} ${info.linkUrl}`;
  copyToClipboard(t);
}
