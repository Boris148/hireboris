// Applies the saved appearance (System / Light / Dark) before the first paint, so the app
// never flashes the wrong theme. Classic blocking script (the CSP forbids inline scripts).
// Keep in sync with src/theme.ts.
(function () {
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function pref() {
    try {
      var v = localStorage.getItem("bapp.appearance");
      return v === "light" || v === "dark" || v === "system" ? v : root.getAttribute("data-default-appearance") || "system";
    } catch (e) {
      return "system";
    }
  }
  function apply() {
    var p = pref();
    var t = p === "system" ? (mq && mq.matches ? "dark" : "light") : p;
    root.setAttribute("data-theme", t);
    root.style.colorScheme = t;
    var tc = document.querySelector('meta[name="theme-color"]');
    if (tc) tc.setAttribute("content", tc.getAttribute("data-" + t) || tc.getAttribute("content"));
    var sb = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (sb) sb.setAttribute("content", t === "dark" ? "black-translucent" : "default");
  }
  apply();
  if (mq) {
    var on = function () {
      if (pref() === "system") apply();
    };
    if (mq.addEventListener) mq.addEventListener("change", on);
    else if (mq.addListener) mq.addListener(on);
  }
})();
