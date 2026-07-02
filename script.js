const card = document.getElementById("incident-card");
const statusEl = document.getElementById("status");

const fallbackIncidents = [
  {
    id: "AIID-001",
    year: "2018",
    title: "Recruitment algorithm penalized women applicants.",
    place: "United States",
    source: "Reuters",
    type: "bias"
  },
  {
    id: "AIID-002",
    year: "2020",
    title: "Exam grading algorithm downgraded thousands of students.",
    place: "United Kingdom",
    source: "BBC",
    type: "bias"
  },
  {
    id: "AIID-003",
    year: "2023",
    title: "Chatbot encouraged harmful behavior during conversation.",
    place: "Online",
    source: "AI Incident Database",
    type: "harm"
  },
  {
    id: "AIID-004",
    year: "2024",
    title: "Voice clone used in financial fraud.",
    place: "Hong Kong",
    source: "CNN",
    type: "fraud"
  },
  {
    id: "AIID-005",
    year: "2024",
    title: "Deepfake video used in political disinformation.",
    place: "Global",
    source: "AI Incident Database",
    type: "deepfake"
  },
  {
    id: "AIID-006",
    year: "2025",
    title: "AI assistant leaked private user information.",
    place: "Online",
    source: "AI Incident Database",
    type: "privacy"
  }
];

let incidents = fallbackIncidents;
let currentIndex = 0;

const emojiByType = {
  bias: "😵",
  harm: "💀",
  fraud: "💸",
  deepfake: "💅",
  privacy: "🔐",
  failure: "🐟",
  misc: "🙂"
};

function classify(text) {
  const t = text.toLowerCase();

  if (t.includes("bias") || t.includes("discrimin") || t.includes("racist")) return "bias";
  if (t.includes("death") || t.includes("fatal") || t.includes("harm") || t.includes("suicide")) return "harm";
  if (t.includes("fraud") || t.includes("scam") || t.includes("steal") || t.includes("stole")) return "fraud";
  if (t.includes("deepfake") || t.includes("clone") || t.includes("synthetic voice")) return "deepfake";
  if (t.includes("privacy") || t.includes("leak") || t.includes("data")) return "privacy";
  if (t.includes("error") || t.includes("fail") || t.includes("wrong")) return "failure";

  return "misc";
}

function pickIncident() {
  const item = incidents[currentIndex % incidents.length];
  currentIndex++;
  return item;
}

function showIncident() {
  const item = pickIncident();
  const emoji = emojiByType[item.type] || "🙂";

  card.className = "incident-card hidden";

  card.innerHTML = `
    <div style="font-size:24px;color:#ff59c7;margin-bottom:20px;">
      incident_id: <span style="background:#ff59c7;color:#21000f;padding:3px 8px;">${item.id}</span>
    </div>

    <div style="float:right;font-size:90px;filter:drop-shadow(0 0 15px #ff59c7);">
      ${emoji}
    </div>

    <div style="
      font-family:'Press Start 2P';
      font-size:72px;
      color:#f4f1ef;
      text-shadow:4px 4px 0 #ff59c7,0 0 20px white;
      margin-bottom:35px;
    ">
      ${item.year}
    </div>

    <div style="
      font-family:'Silkscreen';
      font-size:58px;
      line-height:.98;
      color:#f4f1ef;
      text-shadow:0 0 18px #ff59c7;
      max-width:680px;
    ">
      ${item.title}
    </div>

    <div style="
      margin-top:35px;
      padding-top:18px;
      border-top:2px dotted #ff59c7;
      color:#ffc4ef;
      font-size:28px;
      line-height:1.25;
    ">
      📍 ${item.place}<br>
      severity: ${item.type}<br>
      source: ${item.source}<br>
      next incident in: 00:02 ♡
    </div>
  `;

  setTimeout(() => {
    card.className = "incident-card show";
  }, 50);

  setTimeout(() => {
    card.className = "incident-card hidden";
  }, 9200);

  setTimeout(showIncident, 11200);
}

function createStars() {
  const symbols = ["✦", "✧", "⋆", "♡", "☆", "｡", "･ﾟ", "✩"];
  for (let i = 0; i < 45; i++) {
    const star = document.createElement("div");
    star.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    star.style.position = "fixed";
    star.style.left = Math.random() * 100 + "vw";
    star.style.top = Math.random() * 100 + "vh";
    star.style.color = Math.random() > 0.5 ? "#ff8ed8" : "#ffffff";
    star.style.fontSize = 12 + Math.random() * 26 + "px";
    star.style.textShadow = "0 0 12px #ff59c7";
    star.style.animation = `twinkle ${1 + Math.random() * 2}s infinite alternate`;
    star.style.pointerEvents = "none";
    document.body.appendChild(star);
  }
}

async function loadRealData() {
  try {
    const query = `
      {
        reports {
          title
          report_number
          date_published
          url
        }
      }
    `;

    const response = await fetch("https://incidentdatabase.ai/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    const json = await response.json();

    if (!json.data || !json.data.reports) {
      throw new Error("No reports found");
    }

    incidents = json.data.reports
      .filter(report => report.title)
      .slice(0, 300)
      .map(report => {
        const year = report.date_published
          ? String(new Date(report.date_published).getFullYear())
          : "????";

        return {
          id: "AIID-" + report.report_number,
          year,
          title: report.title,
          place: "documented incident",
          source: report.url ? new URL(report.url).hostname.replace("www.", "") : "incidentdatabase.ai",
          type: classify(report.title)
        };
      });

    statusEl.textContent = "connected";
  } catch (error) {
    statusEl.textContent = "fallback mode";
    incidents = fallbackIncidents;
  }
}

const style = document.createElement("style");
style.textContent = `
@keyframes twinkle {
  from { opacity: .15; transform: scale(.8); }
  to { opacity: 1; transform: scale(1.2); }
}
`;
document.head.appendChild(style);

createStars();

loadRealData().then(() => {
  showIncident();
});