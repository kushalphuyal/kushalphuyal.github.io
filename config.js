/* config.js — admin ko settings ek thau bata load garcha (cache + fallback) */
(function () {
  const BASE = 'https://morning-bush-8bd5.kushalphuyal.workers.dev';
  const KEY = 'naps_cfg_cache';
  const NAPS = (window.NAPS = {
    BASE,
    cfg: null,
    VAT: 0.13, PF_EMP: 0.11, PF_EMPL: 0.20,
    load() {
      if (NAPS._p) return NAPS._p;
      NAPS._p = (async () => {
        let cfg = null;
        for (const path of ['/api/config', '/get-config']) {
          try {
            const r = await fetch(BASE + path);
            if (!r.ok) continue;
            const j = await r.json();
            if (j && Object.keys(j).length) { cfg = j; break; }
          } catch (e) {}
        }
        if (cfg) { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} }
        else { try { cfg = JSON.parse(localStorage.getItem(KEY)); } catch (e) {} }
        if (cfg) {
          NAPS.cfg = cfg;
          if (cfg.vat) NAPS.VAT = cfg.vat / 100;
          if (cfg.pfEmp) NAPS.PF_EMP = cfg.pfEmp / 100;
          if (cfg.pfEmpl) NAPS.PF_EMPL = cfg.pfEmpl / 100;
          window.VAT_RATE = NAPS.VAT;
        }
        return cfg;
      })();
      return NAPS._p;
    }
  });
})();
