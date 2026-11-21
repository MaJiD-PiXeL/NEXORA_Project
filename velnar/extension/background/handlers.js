NEXORA.Storage.isWriter = true;

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.type !== "nexora:settings") return;
  if (sender.id !== chrome.runtime.id || !sender.url?.startsWith(chrome.runtime.getURL(""))) {
    respond({ ok: false, error: "Settings can only be changed from NEXORA." });
    return;
  }
  NEXORA.Storage._commit(message.action, message.payload).then(
    settings => respond({ ok: true, settings }),
    error => respond({ ok: false, error: error.message })
  );
  return true;
});

chrome.runtime.onInstalled.addListener(() => {
  // A no-op patch also migrates the old key without resetting preferences.
  NEXORA.Storage.set({}).catch(console.error);
});

chrome.commands.onCommand.addListener(command => {
  if (command === "toggle-extension") NEXORA.Storage.toggle("enabled").catch(console.error);
  if (command === "random-theme") NEXORA.Storage.randomTheme().catch(console.error);
  if (command === "toggle-review-focus") {
    const tabs = globalThis.browser?.tabs || chrome.tabs;
    tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.url?.startsWith("https://github.com/")) return tabs.sendMessage(tab.id, { type: "nexora:review-focus" }, { frameId: 0 });
    }).catch(() => {});
  }
});
