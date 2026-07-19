window.CoachDonMetadata = (() => {
  const split = raw => {
    const clean = String(raw || "").replace(/\s+/g, " ").replace(/^["']|["']$/g, "").trim();
    for (const sep of [" - "," – "," — "," | "]) {
      const p = clean.split(sep).map(x=>x.trim()).filter(Boolean);
      if (p.length >= 2) return {artist:p.shift(), title:p.join(sep.trim())};
    }
    return clean ? {artist:"",title:clean} : null;
  };
  async function timeoutFetch(url, type="json", ms=6500){
    const c=new AbortController(), t=setTimeout(()=>c.abort(),ms);
    try{
      const r=await fetch(url,{cache:"no-store",signal:c.signal,mode:"cors"});
      if(!r.ok) throw Error(`HTTP ${r.status}`);
      return type==="json"?r.json():r.text();
    } finally { clearTimeout(t); }
  }
  function sourcesFrom(j){
    const stats=j?.icestats||j||{};
    let src=stats.source||[];
    return Array.isArray(src)?src:[src];
  }
  async function get181(station){
    if(!station.mount) return {meta:null,source:"none"};
    const mount=station.mount.toLowerCase();
    const urls=[
      "https://listen.181fm.com/status-json.xsl",
      `https://listen.181fm.com/status-json.xsl?mount=/${station.mount}_128k.mp3`,
      `https://listen.181fm.com/status-json.xsl?mount=/${station.mount}.mp3`
    ];
    let lastError="unavailable";
    for(const url of urls){
      try{
        const j=await timeoutFetch(url);
        const src=sourcesFrom(j);
        const found=src.find(x=>JSON.stringify(x).toLowerCase().includes(mount)) || src.find(x=>x?.title||x?.yp_currently_playing);
        const raw=found?.title||found?.yp_currently_playing;
        if(raw) return {meta:split(raw),source:"181.FM"};
        lastError="empty";
      }catch(e){ lastError=e?.name==="AbortError"?"timeout":"blocked"; }
    }
    return {meta:null,source:lastError};
  }
  async function getSoma(station){
    if(!station.meta) return {meta:null,source:"none"};
    try{
      const j=await timeoutFetch(`https://somafm.com/songs/${station.meta}.json`);
      const s=j.songs?.[0];
      return s?{meta:{title:s.title||"Live Radio",artist:s.artist||""},source:"SomaFM"}:{meta:null,source:"empty"};
    }catch(e){ return {meta:null,source:"blocked"}; }
  }
  async function fetch(station){
    const a=await get181(station); if(a.meta||station.mount) return a;
    return getSoma(station);
  }
  return {fetch};
})();
