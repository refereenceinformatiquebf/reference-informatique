/** Illustrations des affiches (HTML/CSS), une par produit. Zone de dessin : 1056 px de large, hauteur propre à chaque affiche (`artH`). */

export const check = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;

/* ---------------------------------------------------------------------- */
/* Illustrations                                                           */
/* ---------------------------------------------------------------------- */

export function artPackFormations() {
  const tiles = [
    ["X", "Excel de A à Z", "Tableaux, formules, graphiques"],
    ["X·IA", "Excel et IA", "Calculs et analyses automatisés"],
    ["W", "Word", "Rapports, CV, documents"],
    ["P", "PowerPoint", "Réunions et soutenances"],
    ["A", "Access", "Bases de données"],
    ["IA", "Intelligence artificielle", "Les bases pour s'en servir"],
  ];
  const html = tiles
    .map(
      ([mono, name, detail]) => `
    <div class="card" style="padding:30px 30px 28px;height:296px;display:flex;flex-direction:column;justify-content:space-between">
      <div style="width:96px;height:96px;border-radius:22px;background:linear-gradient(150deg,#0b1f3a,#1565c0);color:#fff;display:flex;align-items:center;justify-content:center" class="serif">
        <span style="font-size:${mono.length > 2 ? 40 : 60}px;line-height:1">${mono}</span>
      </div>
      <div>
        <div style="font-size:33px;font-weight:700;line-height:1.1">${name}</div>
        <div class="muted" style="font-size:23px;margin-top:8px;line-height:1.25">${detail}</div>
      </div>
    </div>`,
    )
    .join("");
  return `<div class="abs" style="inset:0;display:flex;align-items:center"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;width:1056px">${html}</div></div>`;
}

function sheetRows(n, widths) {
  return Array.from({ length: n }, (_, i) => {
    const w = widths[i % widths.length];
    return `<div style="display:grid;grid-template-columns:46px 2.4fr 0.8fr 1fr 1.1fr;align-items:center;height:48px;background:${i % 2 ? "#f4f7fb" : "#fff"};border-bottom:1px solid #e3e9f2">
      <span style="text-align:center;font-size:17px;color:#7b8aa3">${i + 2}</span>
      <span style="padding-left:16px"><i class="b" style="width:${w[0]}%;height:13px;background:#cfd9e8"></i></span>
      <span style="padding-left:16px"><i class="b" style="width:${w[1]}%;height:13px;background:#cfd9e8"></i></span>
      <span style="padding-left:16px"><i class="b" style="width:${w[2]}%;height:13px;background:#cfd9e8"></i></span>
      <span style="padding-left:16px"><i class="b" style="width:${w[3]}%;height:13px;background:#b4c6e2"></i></span>
    </div>`;
  }).join("");
}

export function artExcel() {
  const widths = [
    [70, 40, 60, 74],
    [54, 30, 52, 64],
    [80, 44, 66, 80],
    [62, 36, 48, 58],
    [74, 42, 58, 70],
  ];
  const back = (left, top, rot, title, tabs) => `
    <div class="card abs" style="left:${left}px;top:${top}px;width:700px;height:420px;transform:rotate(${rot}deg);overflow:hidden;opacity:.96">
      <div style="height:56px;background:#eaf0f8;display:flex;align-items:center;padding:0 24px;font-size:22px;font-weight:700;color:#0b1f3a">${title}</div>
      <div style="padding:22px 24px;display:grid;gap:14px">${Array.from({ length: 5 }, (_, i) => `<i class="b" style="width:${88 - i * 9}%;height:15px;background:#d6dfec"></i>`).join("")}</div>
      <div class="abs" style="left:0;right:0;bottom:0;height:54px;background:#f1f5fa;border-top:1px solid #dde5f0;display:flex;gap:10px;align-items:center;padding:0 22px;font-size:19px;font-weight:600;color:#46576f">${tabs}</div>
    </div>`;
  return `
  <div class="abs" style="inset:0">
    ${back(8, 0, -5, "Stock.xlsx", "")}
    ${back(352, 46, 4, "Paie.xlsx", "")}
    <div class="card abs" style="left:118px;top:78px;width:820px;height:532px;overflow:hidden">
      <div style="height:62px;background:#0b1f3a;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 28px">
        <span style="font-size:25px;font-weight:700">Facturation.xlsx</span>
        <span style="display:flex;gap:7px"><i class="b" style="width:26px;height:8px;background:rgba(255,255,255,.55)"></i><i class="b" style="width:26px;height:8px;background:rgba(255,255,255,.35)"></i><i class="b" style="width:26px;height:8px;background:rgba(255,255,255,.2)"></i></span>
      </div>
      <div style="display:grid;grid-template-columns:46px 2.4fr 0.8fr 1fr 1.1fr;height:46px;align-items:center;background:#eef2f8;font-size:17px;font-weight:700;color:#7b8aa3;border-bottom:1px solid #dbe3ef">
        <span></span><span style="padding-left:16px">A</span><span style="padding-left:16px">B</span><span style="padding-left:16px">C</span><span style="padding-left:16px">D</span>
      </div>
      <div style="display:grid;grid-template-columns:46px 2.4fr 0.8fr 1fr 1.1fr;height:56px;align-items:center;background:#1565c0;color:#fff;font-size:23px;font-weight:700">
        <span style="text-align:center;font-size:17px;opacity:.7">1</span><span style="padding-left:16px">Désignation</span><span style="padding-left:16px">Qté</span><span style="padding-left:16px">Prix</span><span style="padding-left:16px">Total</span>
      </div>
      ${sheetRows(5, widths)}
      <div style="display:grid;grid-template-columns:46px 2.4fr 0.8fr 1fr 1.1fr;height:56px;align-items:center;background:#dbe8fa;font-size:23px;font-weight:700;color:#0b1f3a">
        <span></span><span style="padding-left:16px">Total à payer</span><span></span><span></span><span style="padding-left:16px"><i class="b" style="width:70%;height:16px;background:#1565c0"></i></span>
      </div>
      <div class="abs" style="left:0;right:0;bottom:0;height:62px;background:#f1f5fa;border-top:1px solid #dde5f0;display:flex;align-items:flex-end;gap:8px;padding:0 20px">
        ${["Facture", "Stock", "Paie", "Budget", "Compta"]
          .map(
            (t, i) =>
              `<span style="padding:11px 22px;border-radius:12px 12px 0 0;font-size:21px;font-weight:700;background:${i === 0 ? "#fff" : "transparent"};color:${i === 0 ? "#1565c0" : "#5b6a82"};box-shadow:${i === 0 ? "0 -1px 0 #dde5f0,1px 0 0 #dde5f0,-1px 0 0 #dde5f0" : "none"}">${t}</span>`,
          )
          .join("")}
      </div>
    </div>
  </div>`;
}

function slide({ left, top, w, rot, body, dark }) {
  const h = Math.round((w * 9) / 16);
  return `<div class="abs" style="left:${left}px;top:${top}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg);border-radius:18px;overflow:hidden;background:${dark ? "linear-gradient(150deg,#0b1f3a,#1565c0)" : "#fff"};box-shadow:0 30px 56px -22px rgba(2,10,25,.65),0 0 0 1px rgba(11,31,58,.08)">${body}</div>`;
}

export function artSlides() {
  const chart = `
    <div style="padding:26px 30px"><i class="b" style="width:46%;height:16px;background:#0b1f3a"></i><i class="b" style="width:30%;height:11px;background:#cfd9e8;margin-top:12px"></i></div>
    <div style="display:flex;align-items:flex-end;gap:16px;padding:0 30px;height:62%">
      ${[34, 52, 44, 72, 96].map((h, i) => `<i style="flex:1;height:${h}%;border-radius:8px 8px 0 0;background:${i === 4 ? "#1565c0" : "#b4c6e2"}"></i>`).join("")}
    </div>`;
  const timeline = `
    <div style="padding:26px 30px"><i class="b" style="width:40%;height:16px;background:#0b1f3a"></i></div>
    <div style="position:relative;margin:34px 40px 0;height:6px;background:#cfd9e8;border-radius:3px">
      ${[0, 1, 2, 3].map((i) => `<i style="position:absolute;left:${i * 31}%;top:-17px;width:40px;height:40px;border-radius:10px;background:${i === 3 ? "#1565c0" : "#0b1f3a"}"></i>`).join("")}
    </div>
    <div style="display:flex;gap:18px;padding:44px 34px 0">${[0, 1, 2, 3].map(() => `<div style="flex:1"><i class="b" style="width:90%;height:10px;background:#cfd9e8"></i><i class="b" style="width:64%;height:10px;background:#dfe6f1;margin-top:9px"></i></div>`).join("")}</div>`;
  const team = `
    <div style="padding:24px 30px"><i class="b" style="width:44%;height:16px;background:#0b1f3a"></i></div>
    <div style="display:flex;gap:20px;padding:6px 30px">${[0, 1, 2].map(() => `<div style="flex:1"><i style="display:block;aspect-ratio:1;border-radius:14px;background:#cfd9e8"></i><i class="b" style="width:80%;height:10px;background:#0b1f3a;margin-top:14px"></i><i class="b" style="width:56%;height:9px;background:#cfd9e8;margin-top:8px"></i></div>`).join("")}</div>`;
  const kpi = `
    <div style="padding:24px 30px"><i class="b" style="width:42%;height:16px;background:#0b1f3a"></i></div>
    <div style="display:flex;gap:18px;padding:8px 30px">${[0, 1, 2].map((i) => `<div style="flex:1;border-radius:14px;background:${i === 1 ? "#1565c0" : "#eaf0f8"};padding:20px 16px"><i class="b" style="width:64%;height:30px;background:${i === 1 ? "#fff" : "#0b1f3a"}"></i><i class="b" style="width:84%;height:9px;background:${i === 1 ? "rgba(255,255,255,.6)" : "#b4c6e2"};margin-top:18px"></i></div>`).join("")}</div>`;
  const title = `
    <div style="position:absolute;left:46px;top:44px;right:46px">
      <i class="b" style="width:14%;height:14px;background:#7fb2f0"></i>
      <i class="b" style="width:88%;height:38px;background:#fff;margin-top:26px"></i>
      <i class="b" style="width:64%;height:38px;background:#fff;margin-top:16px"></i>
      <i class="b" style="width:46%;height:16px;background:rgba(255,255,255,.55);margin-top:34px"></i>
    </div>
    <div style="position:absolute;left:46px;bottom:0;right:46px;height:34%;display:flex;align-items:flex-end;gap:16px">
      ${[38, 56, 48, 78, 100].map((h, i) => `<i style="flex:1;height:${h}%;border-radius:8px 8px 0 0;background:${i === 4 ? "#fff" : "rgba(255,255,255,.34)"}"></i>`).join("")}
    </div>`;
  return `<div class="abs" style="inset:0">
    ${slide({ left: 6, top: 150, w: 470, rot: -9, body: chart })}
    ${slide({ left: 580, top: 132, w: 470, rot: 8, body: kpi })}
    ${slide({ left: 70, top: 22, w: 470, rot: -4, body: team })}
    ${slide({ left: 520, top: 2, w: 470, rot: 5, body: timeline })}
    ${slide({ left: 148, top: 190, w: 760, rot: 0, body: title, dark: true })}
  </div>`;
}

/** Livre vu en perspective : tranche + couverture. */
function book({ w, h, bg, ink, kicker, title, foot, extra = "" }) {
  return `<div style="position:relative;width:${w}px;height:${h}px;transform:perspective(1500px) rotateY(-20deg) rotateX(3deg);transform-style:preserve-3d;filter:drop-shadow(34px 40px 36px rgba(2,10,25,.55))">
    <div style="position:absolute;left:-26px;top:5px;width:26px;height:${h - 10}px;background:linear-gradient(90deg,rgba(0,0,0,.4),rgba(0,0,0,.12));background-color:${bg};border-radius:6px 0 0 6px"></div>
    <div style="position:absolute;inset:0;border-radius:6px 16px 16px 6px;background:${bg};color:${ink};padding:${Math.round(w * 0.11)}px ${Math.round(w * 0.1)}px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden">
      <div style="position:absolute;inset:0;background:linear-gradient(100deg,rgba(255,255,255,.28) 0%,rgba(255,255,255,0) 22%,rgba(0,0,0,.08) 100%)"></div>
      <div style="position:relative">
        <div style="font-size:${Math.round(w * 0.05)}px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;opacity:.78">${kicker}</div>
        <div class="serif" style="font-size:${Math.round(w * 0.135)}px;line-height:1.06;margin-top:${Math.round(w * 0.05)}px;letter-spacing:-.015em">${title}</div>
        ${extra}
      </div>
      <div style="position:relative;font-size:${Math.round(w * 0.045)}px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.78">${foot}</div>
    </div>
  </div>`;
}

export function artWave() {
  const side = 14;
  const bar = (d, hot) => {
    const t = 1 - d / (side + 1);
    const wob = 0.6 + 0.4 * Math.abs(Math.sin(d * 1.9) * Math.cos(d * 0.7));
    const h = Math.round(64 + Math.pow(t, 1.15) * 400 * wob);
    return `<i style="width:16px;height:${h}px;border-radius:8px;background:${hot ? "#fff" : "rgba(255,255,255,.5)"}"></i>`;
  };
  const left = Array.from({ length: side }, (_, i) =>
    bar(side - i, side - i <= 3),
  ).join("");
  const right = Array.from({ length: side }, (_, i) =>
    bar(i + 1, i + 1 <= 3),
  ).join("");
  const mic = `<svg viewBox="0 0 200 330" width="236" height="389" fill="none">
    <rect x="58" y="8" width="84" height="170" rx="42" fill="#fff"/>
    <g stroke="#1565c0" stroke-width="5" stroke-linecap="round" opacity=".5"><path d="M72 62h56M72 84h56M72 106h56M72 128h56"/></g>
    <path d="M28 124v18a72 72 0 0 0 144 0v-18" stroke="#fff" stroke-width="14" stroke-linecap="round"/>
    <path d="M100 214v78" stroke="#fff" stroke-width="14" stroke-linecap="round"/>
    <rect x="46" y="292" width="108" height="16" rx="8" fill="#fff"/>
  </svg>`;
  return `<div class="abs" style="left:50%;top:0;width:560px;height:100%;transform:translateX(-50%);background:linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,0));clip-path:polygon(38% 0,62% 0,100% 100%,0 100%)"></div>
  <div class="abs" style="inset:0;display:flex;align-items:center;justify-content:center;gap:10px">
    <div style="display:flex;align-items:center;gap:10px">${left}</div>
    <div style="padding:0 34px;filter:drop-shadow(0 30px 34px rgba(2,10,25,.5))">${mic}</div>
    <div style="display:flex;align-items:center;gap:10px">${right}</div>
  </div>`;
}

export function artAnglais() {
  const bubble = (txt, top, left, w, light) => `
    <div class="abs" style="top:${top}px;left:${left}px;width:${w}px;padding:26px 32px;border-radius:${light ? "26px 26px 26px 6px" : "26px 26px 6px 26px"};font-size:36px;font-weight:700;line-height:1.2;background:${light ? "#fff" : "#1d7be0"};color:${light ? "#0b1f3a" : "#fff"};box-shadow:0 26px 46px -22px rgba(2,10,25,.6)">${txt}</div>`;
  const steps = [
    ["Débutant", 250],
    ["Intermédiaire", 440],
    ["Avancé", 640],
  ]
    .map(
      ([label, h], i) => `
    <div style="flex:1;height:${h}px;border-radius:22px 22px 0 0;background:${i === 2 ? "#fff" : "rgba(255,255,255,.2)"};border:2px solid rgba(255,255,255,${i === 2 ? 0 : 0.34});border-bottom:0;display:flex;align-items:flex-end;justify-content:center;padding:0 6px 26px;color:${i === 2 ? "#0b1f3a" : "#fff"};font-size:24px;font-weight:700;text-align:center;box-shadow:${i === 2 ? "0 30px 50px -22px rgba(2,10,25,.6)" : "none"}">${label}</div>`,
    )
    .join("");
  return `<div class="abs" style="inset:0">
    ${bubble("Hello! Nice to meet you.", 14, 0, 500, true)}
    ${bubble("Could you send me the report?", 194, 80, 500, false)}
    ${bubble("Let's schedule the meeting.", 392, 0, 500, true)}
    ${bubble("Thank you for your help.", 572, 80, 500, false)}
    <div class="abs" style="right:0;bottom:0;width:460px;height:700px;display:flex;align-items:flex-end;gap:14px">${steps}</div>
  </div>`;
}

export function artChercheur() {
  const lines = (n, hl) =>
    Array.from({ length: n }, (_, i) => {
      const w = 92 - ((i * 13) % 34);
      const on = hl.includes(i);
      return `<i class="b" style="width:${w}%;height:14px;background:${on ? "#9fc3f3" : "#d6dfec"};margin-top:${i ? 15 : 0}px;${on ? "box-shadow:0 0 0 7px #cfe1f9" : ""}"></i>`;
    }).join("");
  const rows = [
    "Source retrouvée et vérifiée",
    "Citation contrôlée",
    "Aucune donnée confidentielle",
    "Résultat de l'IA relu",
  ]
    .map(
      (t) =>
        `<div style="display:flex;align-items:center;gap:20px;padding:15px 0;border-top:1.5px solid #e3e9f2"><span class="chk">${check}</span><span style="font-size:29px;font-weight:600;line-height:1.2">${t}</span></div>`,
    )
    .join("");
  return `<div class="abs" style="inset:0">
    <div class="card abs" style="left:10px;top:20px;width:440px;height:540px;transform:rotate(-5deg);padding:38px 36px">
      <i class="b" style="width:70%;height:22px;background:#0b1f3a"></i>
      <i class="b" style="width:42%;height:12px;background:#b4c6e2;margin:14px 0 34px"></i>
      ${lines(11, [2, 3, 7, 8])}
    </div>
    <div class="card abs" style="right:6px;top:0;width:560px;padding:34px 38px 22px;transform:rotate(1deg)">
      <div class="serif" style="font-size:40px;line-height:1.1;margin-bottom:22px">Checklist de vérification</div>
      ${rows}
    </div>
    <div class="abs" style="left:250px;bottom:0;width:650px;padding:28px 34px;border-radius:24px;background:#071a33;border:2px solid rgba(255,255,255,.3);box-shadow:0 34px 60px -24px rgba(2,10,25,.8)">
      <div style="font-size:19px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#7fb2f0">Prompt académique</div>
      <div style="margin-top:12px;font-size:30px;font-weight:500;line-height:1.3;color:#fff">Résume ces articles et cite chaque source<i style="display:inline-block;width:3px;height:30px;background:#7fb2f0;margin-left:6px;vertical-align:-5px"></i></div>
    </div>
  </div>`;
}

export function artBienEtre() {
  const waves = [0, 1, 2]
    .map(
      (i) =>
        `<path d="M0 ${300 + i * 30} C 120 ${250 + i * 30}, 240 ${350 + i * 30}, 360 ${300 + i * 30} S 600 ${250 + i * 30}, 720 ${300 + i * 30} S 960 ${350 + i * 30}, 1056 ${300 + i * 30}" fill="none" stroke="rgba(255,255,255,${0.26 - i * 0.07})" stroke-width="3"/>`,
    )
    .join("");
  const pills = [
    ["Fatigue", 36, 0],
    ["Tristesse", 162, 70],
    ["Bouffées de chaleur", 288, 10],
    ["Irritabilité", 414, 84],
  ]
    .map(
      ([t, top, left]) =>
        `<div class="abs" style="top:${top}px;left:${left}px;padding:20px 36px;border-radius:999px;background:rgba(255,255,255,.16);border:2px solid rgba(255,255,255,.4);font-size:37px;font-weight:600">${t}</div>`,
    )
    .join("");
  const cover = book({
    w: 400,
    h: 560,
    bg: "#ffffff",
    ink: "#0b1f3a",
    kicker: "Guide de bien-être",
    title: "Comprends ce qu'elle traverse",
    foot: "Référence Informatique",
    extra: `<svg viewBox="0 0 300 60" style="width:70%;margin-top:26px" fill="none"><path d="M0 30 C 40 0, 70 60, 110 30 S 190 0, 230 30 S 280 50, 300 30" stroke="#1565c0" stroke-width="5" stroke-linecap="round"/></svg>
      <div style="margin-top:34px;display:grid;gap:13px">${[92, 78, 86].map((w) => `<i class="b" style="width:${w}%;height:11px;background:#cfe1f9"></i>`).join("")}</div>`,
  });
  return `<svg class="abs" style="inset:0;width:100%;height:100%" viewBox="0 0 1056 660" preserveAspectRatio="none">${waves}</svg>
  <div class="abs" style="left:0;top:50px;width:560px;height:520px">${pills}</div>
  <div class="abs" style="right:80px;top:50px">${cover}</div>`;
}

export function artCouples() {
  const cover = book({
    w: 430,
    h: 590,
    bg: "linear-gradient(160deg,#0a1b34,#103a73)",
    ink: "#ffffff",
    kicker: "Livre PDF",
    title: "Les Vérités Cachées qui Détruisent les Couples",
    foot: "76 pages",
    extra: `<i class="b" style="width:84px;height:6px;background:#7fb2f0;margin-top:30px"></i>`,
  });
  return `<div class="abs" style="left:60px;top:20px">${cover}</div>
  <div class="abs glass" style="right:0;top:84px;width:470px;padding:28px 38px">
    <div class="serif" style="font-size:68px;line-height:1.1;color:rgba(255,255,255,.6);text-decoration:line-through;text-decoration-thickness:4px">Tu…</div>
  </div>
  <div class="card abs" style="right:0;top:272px;width:470px;padding:32px 38px 34px;box-shadow:0 34px 60px -22px rgba(2,10,25,.7)">
    <div class="serif" style="font-size:80px;line-height:1.1;color:#1565c0">Je…</div>
    <div style="margin-top:14px;font-size:27px;font-weight:600;line-height:1.3;color:#0b1f3a;text-wrap:balance">Parler en «&nbsp;je&nbsp;» plutôt qu'en «&nbsp;tu&nbsp;»</div>
  </div>`;
}

export function artMaintenance() {
  const mods = [
    "Les bases de l'informatique",
    "L'architecture du PC",
    "Les pannes du quotidien",
    "Fichiers et sauvegarde",
    "Installer Windows 10 et 11",
    "Pilotes et optimisation",
    "La suite Office",
    "Logiciels et applications",
    "Cybersécurité",
    "Productivité",
    "Astuces avancées",
    "L'IA au quotidien",
  ];
  const styles = [
    "background:#fff;color:#0b1f3a;box-shadow:0 24px 40px -22px rgba(2,10,25,.6)",
    "background:#cfe1f9;color:#0b1f3a;box-shadow:0 24px 40px -22px rgba(2,10,25,.6)",
    "background:rgba(255,255,255,.13);color:#fff;border:2px solid rgba(255,255,255,.34)",
  ];
  const nums = ["color:#1565c0", "color:#0d4fa0", "color:#9cc4f5"];
  const tile = (label, i) => {
    const g = Math.floor(i / 4);
    return `<div style="${styles[g]};border-radius:22px;padding:18px 22px;height:156px;display:flex;flex-direction:column;justify-content:space-between">
      <span class="serif" style="font-size:58px;line-height:1;${nums[g]}">${String(i + 1).padStart(2, "0")}</span>
      <span style="font-size:25px;font-weight:700;line-height:1.15">${label}</span>
    </div>`;
  };
  const legend = [
    ["Les bases de l'ordinateur", "#fff"],
    ["Windows et logiciels", "#cfe1f9"],
    ["Sécurité et productivité", "rgba(255,255,255,.2)"],
  ]
    .map(
      ([t, c]) =>
        `<span style="display:flex;align-items:center;gap:12px"><i style="width:22px;height:22px;border-radius:6px;background:${c};border:2px solid rgba(255,255,255,.5)"></i>${t}</span>`,
    )
    .join("");
  return `<div class="abs" style="inset:0;display:flex;flex-direction:column;justify-content:center">
    <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px">${mods.map(tile).join("")}</div>
    <div style="margin-top:26px;display:flex;justify-content:space-between;font-size:22px;font-weight:600;color:rgba(255,255,255,.88)">${legend}</div>
  </div>`;
}

export function artPerformance() {
  const rows = [
    ["Mémoire", 100],
    ["Disque", 100],
    ["Pilotes", 100],
    ["Virus", 55],
    ["Sauvegarde", 0],
    ["Mots de passe", 0],
    ["Programmes au démarrage", 0],
    ["Ventilateur", 0],
  ]
    .map(
      ([
        label,
        p,
      ]) => `<div style="display:grid;grid-template-columns:400px 1fr 44px;align-items:center;gap:22px;height:52px">
      <span style="font-size:27px;font-weight:600;color:${p > 0 ? "#fff" : "rgba(220,232,248,.55)"}">${label}</span>
      <span style="display:block;height:16px;border-radius:8px;background:rgba(255,255,255,.12);overflow:hidden"><i style="display:block;height:100%;width:${p}%;border-radius:8px;background:linear-gradient(90deg,#1565c0,#4aa3ff)"></i></span>
      <span style="color:#4aa3ff;display:flex;justify-content:flex-end">${p === 100 ? check.replace("<svg", `<svg style="width:32px;height:32px"`) : ""}</span>
    </div>`,
    )
    .join("");
  return `<div class="abs" style="inset:0;border-radius:26px;background:#06142a;border:2px solid rgba(255,255,255,.28);box-shadow:0 40px 70px -26px rgba(2,10,25,.85);overflow:hidden">
    <div style="height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 34px;background:rgba(255,255,255,.07);border-bottom:1.5px solid rgba(255,255,255,.12)">
      <span style="display:flex;gap:8px"><i class="b" style="width:30px;height:9px;background:rgba(255,255,255,.5)"></i><i class="b" style="width:30px;height:9px;background:rgba(255,255,255,.3)"></i><i class="b" style="width:30px;height:9px;background:rgba(255,255,255,.18)"></i></span>
      <span class="serif" style="font-size:42px;color:#4aa3ff;letter-spacing:.02em">00:30</span>
    </div>
    <div style="padding:30px 40px 0">
      <div style="font-family:Consolas,'Courier New',monospace;font-size:27px;color:#7fb2f0;margin-bottom:20px">&gt; Analyse de votre ordinateur…<i style="display:inline-block;width:14px;height:28px;background:#7fb2f0;margin-left:8px;vertical-align:-5px"></i></div>
      ${rows}
    </div>
    <div style="position:absolute;left:40px;right:40px;bottom:32px;border-radius:18px;background:#1565c0;padding:22px 30px;font-size:29px;font-weight:700;display:flex;align-items:center;justify-content:space-between;gap:16px"><span>Le problème précis, puis les clics à faire dans l'ordre</span><span style="font-size:40px;line-height:1">→</span></div>
  </div>`;
}
