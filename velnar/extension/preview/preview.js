(() => {
  const worlds = NEXORA.PRESET_THEMES.filter(theme => theme.scene);
  const fromHash = location.hash.slice(1);
  let selected = worlds.find(theme => theme.id === fromHash) || worlds[0];
  const $ = id => document.getElementById(id);
  for (const theme of worlds) {
    const button = document.createElement("button");button.type="button";button.dataset.theme=theme.id;
    button.style.setProperty("--tab-color",theme.colors.accent);
    button.innerHTML = '<i aria-hidden="true"></i><span></span>';
    button.lastChild.textContent=theme.name;
    button.addEventListener("click",()=>{selected=theme;history.replaceState(null,"",`#${theme.id}`);render();});
    $("worldTabs").append(button);
  }
  for(let day=0;day<7;day++) {
    const row=document.createElement("tr");
    for(let week=0;week<52;week++) {
      const cell=document.createElement("td");cell.className="ContributionCalendar-day";
      cell.dataset.level=String((week*13+day*7+Math.floor(week/5))%5);row.append(cell);
    }
    $("contributionCells").append(row);
  }
  function render() {
    const settings=NEXORA.DEFAULT_SETTINGS;
    NEXORA.Injector.applyThemeVars(selected.colors,settings.layout);
    NEXORA.Injector.applyComponents(settings.componentOverrides);
    $("sceneIllustration").innerHTML=NEXORA.SceneArt.svg(selected.id);
    $("sceneTitle").textContent=selected.name;
    $("sceneKicker").textContent=`WORLD ${String(worlds.indexOf(selected)+1).padStart(2,"0")} / ${String(worlds.length).padStart(2,"0")}`;
    $("sceneDescription").textContent=selected.tagline;
    $("effectDescription").textContent=`${selected.name} colors applied to backgrounds, text, buttons and the contribution graph.`;
    $("colorDots").replaceChildren();
    for(const key of ["background","backgroundSecondary","accent","accentSecondary","textPrimary"]) {const dot=document.createElement("i");dot.style.background=selected.colors[key];$("colorDots").append(dot);}
    document.querySelectorAll("[data-theme]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.theme===selected.id)));
    $("applyStatus").textContent="";
  }
  $("applyTheme").addEventListener("click",async()=>{
    if(!globalThis.chrome?.runtime?.id){$("applyStatus").textContent="Install NEXORA, then select this theme in the extension.";return;}
    try { await NEXORA.Storage.selectTheme(selected.id);$("applyStatus").textContent=`${selected.name} applied to GitHub.`; }
    catch(error){$("applyStatus").textContent=error.message;}
  });
  $("demoAction").addEventListener("click",event=>{const active=event.currentTarget.getAttribute("aria-pressed")!=="true";event.currentTarget.setAttribute("aria-pressed",String(active));event.currentTarget.textContent=active?"Demo starred ★":"Star this demo ☆";});
  render();
  if(new URL(location.href).searchParams.get("focus")==="activity") document.querySelector('.activity').scrollIntoView({block:'center'});
})();
