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
    try{const r=await fetch(url,{cache:"no-store",signal:c.signal});if(!r.ok)throw Error(r.status);return type==="json"?r.json():r.text()}finally{clearTimeout(t)}
  }
  async function get181(station){
    if(!station.mount) return null;
    for(const url of ["https://listen.181fm.com/status-json.xsl",`https://listen.181fm.com/status-json.xsl?mount=/${station.mount}_128k.mp3`]){
      try{
        const j=await timeoutFetch(url), stats=j.icestats||j;
        let src=stats.source||[]; if(!Array.isArray(src))src=[src];
        const found=src.find(x=>JSON.stringify(x).toLowerCase().includes(station.mount.toLowerCase()))||src.find(x=>x.title||x.yp_currently_playing);
        const raw=found?.title||found?.yp_currently_playing;if(raw)return split(raw);
      }catch(e){}
    }
    return null;
  }
  async function getSoma(station){
    if(!station.meta)return null;
    try{const j=await timeoutFetch(`https://somafm.com/songs/${station.meta}.json`);const s=j.songs?.[0];return s?{title:s.title||"Live Radio",artist:s.artist||""}:null}catch(e){return null}
  }
  async function fetch(station){return (await get181(station)) || (await getSoma(station));}
  return {fetch};
})();
