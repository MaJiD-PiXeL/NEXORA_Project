// Static palettes need no polling or scans of GitHub's body.
globalThis.NEXORA = globalThis.NEXORA || {};

NEXORA.Observer = {
  _started: false,
  _callback: null,
  _scheduled: false,

  start(callback) {
    this._callback = callback;
    if (this._started) return;
    this._started = true;

    document.addEventListener("turbo:render", () => this._trigger());
    document.addEventListener("turbo:load", () => this._trigger());
    document.addEventListener("pjax:end", () => this._trigger());
    window.addEventListener("popstate", () => this._trigger());
    window.navigation?.addEventListener("currententrychange", () => this._trigger());

    const styleIds = [NEXORA.STYLE_TAG_ID, NEXORA.COMPONENTS_TAG_ID,
      NEXORA.TYPOGRAPHY_TAG_ID, NEXORA.CUSTOM_CSS_TAG_ID, NEXORA.REVIEW_FOCUS_TAG_ID];
    const isRepositoryMeta = node => node.matches?.(NEXORA.REPOSITORY_META_SELECTOR);
    const headObserver = new MutationObserver(records => {
      if (records.some(record => isRepositoryMeta(record.target) ||
        [...record.addedNodes].some(isRepositoryMeta) ||
        [...record.removedNodes].some(node => isRepositoryMeta(node) || (node.nodeName === "STYLE" && styleIds.includes(node.id)))
      )) this._trigger();
    });
    let observedHead = null;
    const observeHead = () => {
      if (document.head === observedHead) return;
      headObserver.disconnect();
      observedHead = document.head;
      if (observedHead) headObserver.observe(observedHead, { childList: true, subtree: true, attributes: true, attributeFilter: ["content"] });
      this._trigger();
    };
    // Direct children only: also handles a head created after document_start.
    const rootObserver = new MutationObserver(observeHead);
    rootObserver.observe(document.documentElement, { childList: true });
    observeHead();
  },

  _trigger() {
    if (this._scheduled) return;
    this._scheduled = true;
    // Turbo can emit render/load/pjax:end in the same frame.
    requestAnimationFrame(() => {
      this._scheduled = false;
      if (this._callback) this._callback();
    });
  }
};
