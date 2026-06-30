'use strict';

// ================================================================
// DATA  —  4 units × 3 equipment = 12 sensors
// ================================================================
const HIST = 28;   // history points per sensor

const unitsData = [
  {
    id: 'turbine', nameEn: 'Turbine', nameAr: 'التوربين', icon: '⚙',
    equipment: [
      {
        id: 'tb1', nameEn: 'Main Bearing',   nameAr: 'المحمل الرئيسي',
        temp: 145, tempRange: [80,  200],
        vib:  1.8, vibRange:  [0.5, 6.0],
        pres: 12.5, presRange: [8,   22],
        confidence: 94, budgetImpact: 28000, budgetNote: 'تكلفة استبدال المحمل'
      },
      {
        id: 'tb2', nameEn: 'Rotor Blades',   nameAr: 'ريش الدوار',
        temp: 182, tempRange: [100, 220],
        vib:  3.2, vibRange:  [0.5, 6.0],
        pres: 18.1, presRange: [8,   22],
        confidence: 88, budgetImpact: 75000, budgetNote: 'تكلفة إصلاح الريش'
      },
      {
        id: 'tb3', nameEn: 'Shaft Seal',     nameAr: 'ختم العمود',
        temp: 98,  tempRange: [60,  150],
        vib:  0.9, vibRange:  [0.2, 4.0],
        pres: 9.8,  presRange: [5,   18],
        confidence: 97, budgetImpact: 12000, budgetNote: 'استبدال الختم'
      }
    ]
  },
  {
    id: 'generator', nameEn: 'Generator', nameAr: 'المولّد', icon: '⚡',
    equipment: [
      {
        id: 'gn1', nameEn: 'Stator Winding', nameAr: 'ملفات الستاتور',
        temp: 118, tempRange: [60,  140],
        vib:  2.1, vibRange:  [0.3, 4.0],
        pres: 3.2,  presRange: [1,   5],
        confidence: 91, budgetImpact: 95000, budgetNote: 'إعادة تغليف الملفات'
      },
      {
        id: 'gn2', nameEn: 'Cooling System', nameAr: 'نظام التبريد',
        temp: 72,  tempRange: [40,  110],
        vib:  0.7, vibRange:  [0.2, 3.0],
        pres: 2.1,  presRange: [0.5, 4],
        confidence: 96, budgetImpact: 18000, budgetNote: 'صيانة دورية للمبرد'
      },
      {
        id: 'gn3', nameEn: 'Exciter',        nameAr: 'المُثير الكهربائي',
        temp: 134, tempRange: [60,  140],
        vib:  3.8, vibRange:  [0.3, 4.0],
        pres: 4.7,  presRange: [1,   5],
        confidence: 98, budgetImpact: 140000, budgetNote: 'استبدال عاجل للمثير'
      }
    ]
  },
  {
    id: 'boiler', nameEn: 'Boiler', nameAr: 'المرجل', icon: '🔥',
    equipment: [
      {
        id: 'bl1', nameEn: 'Heat Exchanger', nameAr: 'المبادل الحراري',
        temp: 485, tempRange: [200, 580],
        vib:  4.2, vibRange:  [1.0, 8.0],
        pres: 195,  presRange: [40,  250],
        confidence: 92, budgetImpact: 62000, budgetNote: 'تنظيف وصيانة المبادل'
      },
      {
        id: 'bl2', nameEn: 'Steam Drum',     nameAr: 'طبل البخار',
        temp: 310, tempRange: [200, 420],
        vib:  1.8, vibRange:  [0.5, 5.0],
        pres: 168,  presRange: [80,  220],
        confidence: 95, budgetImpact: 38000, budgetNote: 'فحص وإحكام الوصلات'
      },
      {
        id: 'bl3', nameEn: 'Feed Pump',      nameAr: 'مضخة التغذية',
        temp: 88,  tempRange: [25,  120],
        vib:  6.8, vibRange:  [0.5, 8.0],
        pres: 238,  presRange: [40,  250],
        confidence: 99, budgetImpact: 210000, budgetNote: 'استبدال عاجل للمضخة'
      }
    ]
  },
  {
    id: 'fuelSystem', nameEn: 'Fuel System', nameAr: 'نظام الوقود', icon: '⛽',
    equipment: [
      {
        id: 'fs1', nameEn: 'Fuel Pump',         nameAr: 'مضخة الوقود',
        temp: 52,  tempRange: [25,  85],
        vib:  1.1, vibRange:  [0.2, 3.0],
        pres: 14.2, presRange: [2,   18],
        confidence: 95, budgetImpact: 22000, budgetNote: 'صيانة دورية للمضخة'
      },
      {
        id: 'fs2', nameEn: 'Filter Assembly',   nameAr: 'مجموعة الفلاتر',
        temp: 38,  tempRange: [20,  70],
        vib:  0.6, vibRange:  [0.1, 2.0],
        pres: 11.8, presRange: [2,   15],
        confidence: 89, budgetImpact: 8500, budgetNote: 'تغيير الفلاتر'
      },
      {
        id: 'fs3', nameEn: 'Injection Nozzles', nameAr: 'فوهات الحقن',
        temp: 65,  tempRange: [30,  85],
        vib:  1.4, vibRange:  [0.2, 3.0],
        pres: 16.5, presRange: [5,   18],
        confidence: 91, budgetImpact: 31000, budgetNote: 'تنظيف وضبط الفوهات'
      }
    ]
  }
];

// ================================================================
// STATE
// ================================================================
const openUnits  = new Set();
let selectedUnit  = null;
let selectedEqId  = null;
let activeTab     = 'diag';   // 'diag' | 'analytics'
let _pendingEntry = false;     // true → next renderDetail plays slide-in

// ================================================================
// HELPERS
// ================================================================
function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

function randDelta(range, factor) {
  return (Math.random() * 2 - 1) * (range[1] - range[0]) * factor;
}

function stressRatio(val, range) {
  return (val - range[0]) / (range[1] - range[0]);
}

function computeHealth(eq) {
  const t = stressRatio(eq.temp, eq.tempRange);
  const v = stressRatio(eq.vib,  eq.vibRange);
  const p = stressRatio(eq.pres, eq.presRange);
  return Math.round(clamp(100 - (t * 0.35 + v * 0.45 + p * 0.20) * 70, 5, 99));
}

function computeRisk(health) {
  return health >= 75 ? 'low' : health >= 55 ? 'medium' : 'high';
}

function computePrediction(health) {
  if (health >= 85) return Math.round(40 + (health - 85) * 4);
  if (health >= 70) return Math.round(15 + (health - 70) * 1.67);
  if (health >= 55) return Math.round(7  + (health - 55) * 0.53);
  if (health >= 45) return Math.round(3  + (health - 45) * 0.4);
  return Math.max(1, Math.round(health * 0.07));
}

// ================================================================
// PREDICTIVE ANALYTICS
// ================================================================

// Remaining Useful Life (days) based on sensor stress and health
function computeRUL(eq) {
  const tS = stressRatio(eq.temp, eq.tempRange);
  const vS = stressRatio(eq.vib,  eq.vibRange);
  const pS = stressRatio(eq.pres, eq.presRange);
  const composite = tS * 0.35 + vS * 0.45 + pS * 0.20;
  const ratePerDay = 0.10 + composite * 2.40; // health pts/day
  return Math.min(730, Math.max(1, Math.round((eq.health - 15) / ratePerDay)));
}

// Failure probability at 7 / 30 / 90 days (exponential model)
function computeFailureProb(rul) {
  const p = n => Math.round(Math.min(99, (1 - Math.exp(-n / (rul * 0.55))) * 100));
  return { d7: p(7), d30: p(30), d90: p(90) };
}

// Root cause analysis from sensor stress levels
function getRootCauses(eq) {
  const tS = stressRatio(eq.temp, eq.tempRange);
  const vS = stressRatio(eq.vib,  eq.vibRange);
  const pS = stressRatio(eq.pres, eq.presRange);

  const CAUSE_MAP = {
    temp: [
      { ar: 'الحرارة ضمن النطاق الطبيعي',      detail: 'لا يوجد إجهاد حراري ملحوظ.' },
      { ar: 'ارتفاع طفيف في درجة الحرارة',     detail: 'قد يشير إلى نقص بسيط في التشحيم أو تراكم ترسبات.' },
      { ar: 'ارتفاع حاد — إجهاد حراري خطير',   detail: 'نقص التشحيم، انسداد دورة التبريد، أو تآكل احتكاكي متقدم.' }
    ],
    vib: [
      { ar: 'الاهتزاز ضمن الحدود الاعتيادية',  detail: 'ديناميكية التشغيل مستقرة.' },
      { ar: 'اهتزاز متصاعد — تحذير مبكر',      detail: 'بداية تآكل المحامل أو فقدان التوازن الدوار.' },
      { ar: 'اهتزاز مفرط — خطر انهيار ميكانيكي',detail: 'تآكل حاد في المحامل، خلل ديناميكي، أو كسر جزئي محتمل.' }
    ],
    pres: [
      { ar: 'الضغط ضمن النطاق الطبيعي',        detail: 'لا يوجد شذوذ في منظومة الضغط.' },
      { ar: 'تذبذب في الضغط',                  detail: 'ضعف في الصمامات أو انسداد جزئي في المرشحات.' },
      { ar: 'ضغط شاذ — خطر على السلامة',        detail: 'انسداد حاد في المرشحات، تآكل الصمامات، أو تراكم الرواسب.' }
    ]
  };

  const lvl = s => s > 0.68 ? 2 : s > 0.42 ? 1 : 0;

  return [
    { sensor: 'حراري',  stress: Math.round(tS*100), color: 'var(--chart-t)', ...CAUSE_MAP.temp[lvl(tS)] },
    { sensor: 'اهتزاز', stress: Math.round(vS*100), color: 'var(--chart-v)', ...CAUSE_MAP.vib[lvl(vS)]  },
    { sensor: 'ضغط',   stress: Math.round(pS*100), color: 'var(--chart-p)', ...CAUSE_MAP.pres[lvl(pS)] }
  ].sort((a, b) => b.stress - a.stress);
}

// Spare parts catalog per equipment
const SPARE_PARTS_DB = {
  tb1: [
    { nameAr: 'محمل رئيسي SKF 6320',          qty: 2, leadDays: 21, cost: 8500 },
    { nameAr: 'زيت تشحيم صناعي Mobil (20L)',   qty: 4, leadDays: 3,  cost: 1200 },
    { nameAr: 'حشية مانعة تسرب مطاطية',       qty: 6, leadDays: 5,  cost: 380  }
  ],
  tb2: [
    { nameAr: 'ريشة توربين (Grade A)',          qty: 3, leadDays: 45, cost: 24000 },
    { nameAr: 'مسمار تثبيت الريشة M16',        qty: 16, leadDays: 7, cost: 85   },
    { nameAr: 'غاسل عزل اهتزاز',              qty: 4,  leadDays: 10, cost: 620  }
  ],
  tb3: [
    { nameAr: 'طوق ختم ميكانيكي',             qty: 2,  leadDays: 14, cost: 3200 },
    { nameAr: 'حشية عمود جرافيتية',           qty: 4,  leadDays: 7,  cost: 450  },
    { nameAr: 'خاتم كربوني للختم',             qty: 2,  leadDays: 10, cost: 780  }
  ],
  gn1: [
    { nameAr: 'شريط عازل Class H',             qty: 10, leadDays: 14, cost: 1800 },
    { nameAr: 'راتنج إيبوكسي للملفات',        qty: 2,  leadDays: 7,  cost: 2400 },
    { nameAr: 'موصل نحاسي للتوصيل',          qty: 4,  leadDays: 10, cost: 950  }
  ],
  gn2: [
    { nameAr: 'فلتر مياه تبريد',              qty: 3,  leadDays: 5,  cost: 680  },
    { nameAr: 'مضخة دوران مياه',             qty: 1,  leadDays: 21, cost: 6500 },
    { nameAr: 'حشية أنابيب سيليكون',          qty: 8,  leadDays: 3,  cost: 120  }
  ],
  gn3: [
    { nameAr: 'فرشاة كربون للمثير',           qty: 8,  leadDays: 7,  cost: 420  },
    { nameAr: 'خاتم انزلاق نحاسي',           qty: 2,  leadDays: 14, cost: 3800 },
    { nameAr: 'صمام تيار ثنائي',             qty: 4,  leadDays: 10, cost: 1200 }
  ],
  bl1: [
    { nameAr: 'أنبوب تبادل حراري (INOX)',    qty: 6,  leadDays: 30, cost: 4200 },
    { nameAr: 'حشية شبكة المبادل',           qty: 2,  leadDays: 14, cost: 1800 },
    { nameAr: 'مادة إحكام مقاومة للحرارة',   qty: 3,  leadDays: 7,  cost: 560  }
  ],
  bl2: [
    { nameAr: 'صمام أمان بخاري',             qty: 2,  leadDays: 21, cost: 7500 },
    { nameAr: 'وصلة مرنة مقاومة ضغط',        qty: 2,  leadDays: 14, cost: 2800 },
    { nameAr: 'حشية غطاء الطبل',             qty: 4,  leadDays: 7,  cost: 640  }
  ],
  bl3: [
    { nameAr: 'حلقة ختم ميكانيكي للمضخة',   qty: 2,  leadDays: 10, cost: 4600 },
    { nameAr: 'بكرة دفع المضخة',             qty: 1,  leadDays: 21, cost: 9800 },
    { nameAr: 'صمام رجعي (6 بوصة)',          qty: 2,  leadDays: 14, cost: 3200 }
  ],
  fs1: [
    { nameAr: 'بكرة مضخة وقود',             qty: 1,  leadDays: 14, cost: 5200 },
    { nameAr: 'حلقة O-Ring ختم الوقود',      qty: 8,  leadDays: 3,  cost: 90   },
    { nameAr: 'صمام رجعي وقود (3 بوصة)',    qty: 2,  leadDays: 10, cost: 1400 }
  ],
  fs2: [
    { nameAr: 'عنصر ترشيح وقود (10 ميكرون)',qty: 4,  leadDays: 5,  cost: 380  },
    { nameAr: 'حلقة إحكام O-Ring',           qty: 12, leadDays: 3,  cost: 45   },
    { nameAr: 'غطاء وعاء الفلتر',           qty: 1,  leadDays: 14, cost: 2100 }
  ],
  fs3: [
    { nameAr: 'رأس فوهة حقن (Type B)',       qty: 4,  leadDays: 21, cost: 6800 },
    { nameAr: 'مرشح دقيق الفوهة',           qty: 8,  leadDays: 7,  cost: 320  },
    { nameAr: 'مصبّر ضغط الحقن',            qty: 2,  leadDays: 14, cost: 1900 }
  ]
};

function getSpareParts(eq) {
  const base = (SPARE_PARTS_DB[eq.id] || []);
  const urgLabel = eq.risk === 'high' ? 'urgent' : eq.risk === 'medium' ? 'soon' : 'routine';
  return base.map(p => ({ ...p, urgency: urgLabel }));
}

function getRecommendedActions(eq, causes) {
  const rul = computeRUL(eq);
  const actions = [];
  const top = causes[0];

  if (eq.risk === 'high') {
    actions.push({ p: 'critical', icon: '🚨', text: 'إيقاف المعدة فوراً وإجراء فحص ميداني شامل', when: 'الآن' });
  } else if (eq.risk === 'medium') {
    actions.push({ p: 'high', icon: '⚠️', text: 'جدولة صيانة احترازية فورية', when: 'خلال 7 أيام' });
  }

  if (top.sensor === 'اهتزاز' && top.stress > 55) {
    actions.push({ p: 'high', icon: '🔧', text: 'فحص المحامل وقياس التوازن الديناميكي بمحلل الاهتزاز', when: 'خلال 48 ساعة' });
    actions.push({ p: 'medium', icon: '🔩', text: 'مراجعة إحكام جميع وصلات التثبيت', when: 'خلال أسبوع' });
  }
  if (top.sensor === 'حراري' && top.stress > 55) {
    actions.push({ p: 'high', icon: '🌡️', text: 'فحص مستوى الزيت ونظام التشحيم', when: 'خلال 24 ساعة' });
    actions.push({ p: 'medium', icon: '🧹', text: 'تنظيف مبادل الحرارة وفحص وحدة التبريد', when: 'خلال 72 ساعة' });
  }
  if (top.sensor === 'ضغط' && top.stress > 55) {
    actions.push({ p: 'medium', icon: '🔍', text: 'فحص الصمامات وتنظيف المرشحات', when: 'خلال 72 ساعة' });
    actions.push({ p: 'medium', icon: '📏', text: 'قياس معدل التدفق والتحقق من اتساق الضغط', when: 'خلال أسبوع' });
  }

  if (rul <= 60) {
    actions.push({ p: 'medium', icon: '📦', text: 'إرسال طلب شراء قطع الغيار المحددة', when: `خلال ${Math.min(7, Math.max(1, rul - 14))} أيام` });
  }
  actions.push({ p: 'low', icon: '📋', text: 'توثيق القراءات في نظام CMMS', when: 'دورياً' });

  return actions.slice(0, 6);
}

function riskLabel(r) { return { low: 'سليم', medium: 'تحذير', high: 'خطر' }[r]; }

function riskNote(r) {
  return {
    low:    'مستوى الخطورة منخفض',
    medium: 'مستوى الخطورة متوسط — يتطلب مراقبة',
    high:   'مستوى الخطورة عالٍ — تدخل عاجل'
  }[r];
}

function fmtVal(v, dec)  { return Number(v).toFixed(dec); }
function fmtBudget(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + ' مليون';
  if (n >= 1000)    return (n / 1000).toFixed(0) + 'K';
  return String(n);
}

function getUnit(id) { return unitsData.find(u => u.id === id); }
function getEq(uid, eid) {
  const u = getUnit(uid);
  return u ? u.equipment.find(e => e.id === eid) : null;
}

function unitTopRisk(unit) {
  const ord = { high: 0, medium: 1, low: 2 };
  return unit.equipment.reduce(
    (worst, eq) => ord[eq.risk] < ord[worst] ? eq.risk : worst, 'low'
  );
}

// ================================================================
// SPARKLINE SVG
// ================================================================
function sparklineSVG(values, range, color, uid) {
  const W = 300, H = 54;
  const [lo, hi] = range;
  const span = (hi - lo) || 1;
  const n = values.length;

  const pts = values.map((v, i) => {
    const x = (i / (n - 1)) * W;
    const y = H - 4 - ((v - lo) / span) * (H - 10);
    return [+x.toFixed(1), +y.toFixed(1)];
  });

  const ptStr   = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const fillStr = `0,${H} ${ptStr} ${W},${H}`;
  const lastPt  = pts[n - 1];
  const gid     = `sg_${uid}`.replace(/\W/g, '_');

  // Threshold line at 75% stress = risk boundary
  const threshY = H - 4 - (0.75 * span / span) * (H - 10);

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"
              style="width:100%;height:${H}px;display:block" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity=".22"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <line x1="0" y1="${threshY.toFixed(1)}" x2="${W}" y2="${threshY.toFixed(1)}"
          stroke="${color}" stroke-width="0.8" stroke-dasharray="4,3" opacity="0.35"/>
    <polygon points="${fillStr}" fill="url(#${gid})"/>
    <polyline points="${ptStr}" fill="none" stroke="${color}"
              stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${lastPt[0]}" cy="${lastPt[1]}" r="4" fill="${color}" stroke="#fff" stroke-width="1.5"/>
  </svg>`;
}

// ================================================================
// RENDER — SIDEBAR
// ================================================================
function renderUnits() {
  let html = '';
  unitsData.forEach(unit => {
    const isOpen = openUnits.has(unit.id);
    const uRisk  = unitTopRisk(unit);
    html += `
      <div class="unit-card ${isOpen ? 'is-open' : ''}">
        <div class="unit-header" data-unit="${unit.id}">
          <span class="unit-icon">${unit.icon}</span>
          <div class="unit-names">
            <div class="unit-name-en">${unit.nameEn}</div>
            <div class="unit-name-ar">${unit.nameAr}</div>
          </div>
          <span class="unit-risk-badge ${uRisk}">${riskLabel(uRisk)}</span>
          <span class="unit-chevron">▾</span>
        </div>
        <div class="eq-list">
          ${unit.equipment.map(eq => {
            const sel = selectedUnit === unit.id && selectedEqId === eq.id;
            return `<div class="eq-item ${sel ? 'is-selected' : ''}"
                         id="eq-${eq.id}" data-unit="${unit.id}" data-eq="${eq.id}">
              <span class="eq-dot ${eq.risk}"></span>
              <div class="eq-names">
                <div class="eq-name-en">${eq.nameEn}</div>
                <div class="eq-name-ar">${eq.nameAr}</div>
              </div>
              <span class="eq-health">${eq.health}%</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  });
  document.getElementById('unitsList').innerHTML = html;
  renderAlertSummary();
}

// ================================================================
// RENDER — ALERT SUMMARY
// ================================================================
function renderAlertSummary() {
  let hi = 0, md = 0, lo = 0;
  unitsData.forEach(u => u.equipment.forEach(eq => {
    if      (eq.risk === 'high')   hi++;
    else if (eq.risk === 'medium') md++;
    else                           lo++;
  }));
  document.getElementById('alertSummary').innerHTML = `
    <div class="alert-count"><span class="alert-dot high"></span>
      <span style="color:var(--red)">${hi} خطر</span></div>
    <div class="alert-count"><span class="alert-dot medium"></span>
      <span style="color:var(--amber)">${md} تحذير</span></div>
    <div class="alert-count"><span class="alert-dot low"></span>
      <span style="color:var(--green)">${lo} سليم</span></div>`;
}

// ================================================================
// RENDER — DETAIL PANEL
// ================================================================
function diagHTML(eq) {
  const tDec = eq.temp >= 100 ? 0 : 1;
  const pDec = eq.pres >= 100 ? 0 : 1;
  const predDays  = computePrediction(eq.health);
  const predColor = predDays <= 7 ? 'var(--red)' : predDays <= 21 ? 'var(--amber)' : 'var(--blue)';
  const rul  = computeRUL(eq);
  const prob = computeFailureProb(rul);

  const arrow = d =>
    d > 0 ? '<span class="trend-up">▲</span>'   :
    d < 0 ? '<span class="trend-down">▼</span>' :
            '<span class="trend-flat">—</span>';

  return `
    <div class="sensor-grid">
      <div class="sensor-card">
        <div class="sensor-label">TEMP</div>
        <div class="sensor-val-row">
          <span class="sensor-val">${fmtVal(eq.temp, tDec)}</span>
          <span class="sensor-unit">°C</span>
        </div>
        <div class="sensor-trend">${arrow(eq._dt)}</div>
      </div>
      <div class="sensor-card">
        <div class="sensor-label">VIBRATION</div>
        <div class="sensor-val-row">
          <span class="sensor-val">${fmtVal(eq.vib, 2)}</span>
          <span class="sensor-unit">mm/s</span>
        </div>
        <div class="sensor-trend">${arrow(eq._dv)}</div>
      </div>
      <div class="sensor-card">
        <div class="sensor-label">PRESSURE</div>
        <div class="sensor-val-row">
          <span class="sensor-val">${fmtVal(eq.pres, pDec)}</span>
          <span class="sensor-unit">bar</span>
        </div>
        <div class="sensor-trend">${arrow(eq._dp)}</div>
      </div>
    </div>

    <!-- RUL Timeline -->
    <div class="rul-block">
      <div class="rul-header-row">
        <span class="rul-label">العمر التشغيلي المتبقي</span>
        <span class="rul-days-val" style="color:${
          rul <= 14 ? 'var(--red)' : rul <= 60 ? 'var(--amber)' : 'var(--green)'
        }">${rul} يوم</span>
      </div>
      <div class="rul-bar-track">
        <div class="rul-bar-fill ${eq.risk}" style="width:${Math.min(100, Math.round(rul / 3))}%"></div>
      </div>
      <div class="rul-scale-row">
        <span>اليوم</span>
        <span style="color:${rul<=14?'var(--red)':rul<=60?'var(--amber)':'var(--green)'}">↓ عطل متوقع</span>
        <span>${Math.min(730, rul * 2)} يوم</span>
      </div>
    </div>

    <!-- Failure Probability -->
    <div class="prob-block">
      <div class="prob-block-title">احتمالية العطل</div>
      <div class="prob-boxes">
        <div class="prob-box ${prob.d7 >= 40 ? 'high' : prob.d7 >= 15 ? 'medium' : 'low'}">
          <div class="prob-num">${prob.d7}٪</div>
          <div class="prob-period">7 أيام</div>
        </div>
        <div class="prob-box ${prob.d30 >= 50 ? 'high' : prob.d30 >= 25 ? 'medium' : 'low'}">
          <div class="prob-num">${prob.d30}٪</div>
          <div class="prob-period">30 يوم</div>
        </div>
        <div class="prob-box ${prob.d90 >= 65 ? 'high' : prob.d90 >= 35 ? 'medium' : 'low'}">
          <div class="prob-num">${prob.d90}٪</div>
          <div class="prob-period">90 يوم</div>
        </div>
      </div>
    </div>

    <div class="pred-block">
      <div class="pred-header">
        <span class="pred-icon">⚠</span>
        <span class="pred-title">AI Failure Prediction</span>
      </div>
      <div class="pred-days" style="color:${predColor}">${predDays}</div>
      <div class="pred-sub">يوماً حتى الفشل المتوقع</div>
      <div class="pred-conf-row">
        <span>دقة التنبؤ: ${eq.confidence}%</span>
        <div class="pred-conf-bar">
          <div class="pred-conf-fill" style="width:${eq.confidence}%"></div>
        </div>
      </div>
    </div>

    <div class="budget-block">
      <div class="budget-label">Budget Impact</div>
      <div>
        <span class="budget-val">${fmtBudget(eq.budgetImpact)}</span>
        <span class="budget-unit"> SAR</span>
      </div>
      <div class="budget-note">${eq.budgetNote}</div>
    </div>`;
}

function maintenanceHTML(eq) {
  const causes  = getRootCauses(eq);
  const parts   = getSpareParts(eq);
  const actions = getRecommendedActions(eq, causes);
  const rul     = computeRUL(eq);
  const totalCost = parts.reduce((s, p) => s + p.cost * p.qty, 0);
  const maxLead   = Math.max(...parts.map(p => p.leadDays));

  const urgLabelMap = { urgent: 'عاجل', soon: 'خلال 30 يوم', routine: 'روتيني' };
  const urgClass    = { urgent: 'high',  soon: 'medium',       routine: 'low'     };
  const pClass      = { critical: 'high', high: 'high', medium: 'medium', low: 'low' };
  const pIcon       = { critical: '🚨', high: '⚠️', medium: '🔶', low: '✅' };

  return `
    <div class="maint-section-label">تحليل أسباب التدهور</div>
    ${causes.map(c => `
      <div class="rcause-card">
        <div class="rcause-top">
          <span class="rcause-sensor">${c.sensor}</span>
          <span class="rcause-stress ${c.stress > 68 ? 'high' : c.stress > 42 ? 'medium' : 'low'}">${c.stress}٪ إجهاد</span>
        </div>
        <div class="rcause-name">${c.ar}</div>
        <div class="rcause-detail">${c.detail}</div>
        <div class="rcause-bar-track">
          <div class="rcause-bar-fill" style="width:${c.stress}%;background:${c.color}"></div>
        </div>
      </div>`).join('')}

    <div class="maint-section-label" style="margin-top:14px">قطع الغيار المطلوبة</div>
    <table class="sparts-table">
      <thead><tr><th>القطعة</th><th>الكمية</th><th>الأولوية</th><th>التكلفة</th></tr></thead>
      <tbody>
        ${parts.map(p => `
          <tr>
            <td>${p.nameAr}</td>
            <td class="sparts-qty">${p.qty}</td>
            <td><span class="urgency-badge ${urgClass[p.urgency]}">${urgLabelMap[p.urgency]}</span></td>
            <td class="sparts-cost">${p.cost.toLocaleString('ar-SA')} ر.س</td>
          </tr>`).join('')}
      </tbody>
    </table>
    <div class="sparts-footer">
      <span>الإجمالي: <strong>${totalCost.toLocaleString('ar-SA')} ر.س</strong></span>
      <span>وقت التوريد: <strong>≤ ${maxLead} يوم</strong></span>
    </div>

    <div class="maint-section-label" style="margin-top:14px">الإجراءات الموصى بها</div>
    <ol class="action-list">
      ${actions.map(a => `
        <li class="action-item ${pClass[a.p] || 'low'}">
          <span class="action-icon-em">${pIcon[a.p] || '✅'}</span>
          <div class="action-body">
            <div class="action-text">${a.text}</div>
            <div class="action-when">${a.when}</div>
          </div>
        </li>`).join('')}
    </ol>`;
}

function analyticsHTML(eq) {
  const h = eq._hist;
  return `
    <div class="chart-section">
      <div class="chart-header">
        <span class="chart-label">درجة الحرارة</span>
        <span class="chart-current" style="color:var(--chart-t)">
          ${fmtVal(eq.temp, eq.temp >= 100 ? 0 : 1)} °C
        </span>
      </div>
      <div class="chart-wrap">
        ${sparklineSVG(h.temp, eq.tempRange, 'var(--chart-t)', eq.id + 't')}
      </div>
      <div class="chart-range">
        <span>${eq.tempRange[0]}°C</span><span>${eq.tempRange[1]}°C</span>
      </div>
    </div>

    <div class="chart-section">
      <div class="chart-header">
        <span class="chart-label">الاهتزاز</span>
        <span class="chart-current" style="color:var(--chart-v)">
          ${fmtVal(eq.vib, 2)} mm/s
        </span>
      </div>
      <div class="chart-wrap">
        ${sparklineSVG(h.vib, eq.vibRange, 'var(--chart-v)', eq.id + 'v')}
      </div>
      <div class="chart-range">
        <span>${eq.vibRange[0]}</span><span>${eq.vibRange[1]} mm/s</span>
      </div>
    </div>

    <div class="chart-section">
      <div class="chart-header">
        <span class="chart-label">الضغط</span>
        <span class="chart-current" style="color:var(--chart-p)">
          ${fmtVal(eq.pres, eq.pres >= 100 ? 0 : 1)} bar
        </span>
      </div>
      <div class="chart-wrap">
        ${sparklineSVG(h.pres, eq.presRange, 'var(--chart-p)', eq.id + 'p')}
      </div>
      <div class="chart-range">
        <span>${eq.presRange[0]}</span><span>${eq.presRange[1]} bar</span>
      </div>
    </div>`;
}

function renderDetail(eq) {
  const unit = unitsData.find(u => u.equipment.includes(eq));

  document.getElementById('detailEmpty').classList.add('hidden');
  const content = document.getElementById('detailContent');
  content.classList.remove('hidden');

  const doEntry = _pendingEntry;
  _pendingEntry = false;

  content.innerHTML = `
    <div class="detail-header">
      <div class="detail-eq-name">${eq.nameEn}</div>
      <div class="detail-eq-ar">${eq.nameAr}</div>
      <div class="detail-unit-path">${unit ? unit.nameEn + ' › ' + unit.nameAr : ''}</div>
    </div>

    <div class="health-block">
      <div class="health-row">
        <span class="health-label">HEALTH INDEX</span>
        <span class="health-value ${eq.risk}">${eq.health}<small style="font-size:14px">%</small></span>
      </div>
      <div class="health-bar-track">
        <div class="health-bar-fill ${eq.risk}" style="width:${eq.health}%"></div>
      </div>
      <div class="risk-row">
        <span class="risk-note">${riskNote(eq.risk)}</span>
        <span class="risk-badge ${eq.risk}">${riskLabel(eq.risk)}</span>
      </div>
    </div>

    <div class="dtabs-row">
      <button class="dtab ${activeTab === 'diag'        ? 'active' : ''}" data-pane="diag">تشخيص</button>
      <button class="dtab ${activeTab === 'analytics'   ? 'active' : ''}" data-pane="analytics">تحليلات</button>
      <button class="dtab ${activeTab === 'maintenance' ? 'active' : ''}" data-pane="maintenance">صيانة</button>
    </div>

    <div class="dtab-pane" id="pane-diag"
         style="${activeTab === 'diag' ? '' : 'display:none'}">
      ${diagHTML(eq)}
    </div>

    <div class="dtab-pane" id="pane-analytics"
         style="${activeTab === 'analytics' ? '' : 'display:none'}">
      ${analyticsHTML(eq)}
    </div>

    <div class="dtab-pane" id="pane-maintenance"
         style="${activeTab === 'maintenance' ? '' : 'display:none'}">
      ${maintenanceHTML(eq)}
    </div>`;

  if (doEntry) {
    content.classList.remove('is-entering');
    void content.offsetWidth;
    content.classList.add('is-entering');
    content.addEventListener('animationend', () => {
      content.classList.remove('is-entering');
    }, { once: true });
  }
}

// ================================================================
// RENDER — SVG HOTSPOTS
// ================================================================
function updateHotspots() {
  unitsData.forEach(unit => {
    const g = document.getElementById('hs-' + unit.id);
    if (!g) return;
    const risk = unitTopRisk(unit);
    const sel  = selectedUnit === unit.id ? ' hs-selected' : '';
    g.className.baseVal = 'hotspot-group hs-' + risk + sel;
  });
}

// ================================================================
// INTERACTION
// ================================================================
function openUnit(uid) {
  openUnits.has(uid) ? openUnits.delete(uid) : openUnits.add(uid);
  renderUnits();
}

function selectEquipment(uid, eid) {
  selectedUnit = uid;
  selectedEqId = eid;
  openUnits.add(uid);
  renderUnits();
  updateHotspots();
  const eq = getEq(uid, eid);
  if (eq) {
    _pendingEntry = true;
    renderDetail(eq);
  }
}

function initEvents() {
  // Sidebar clicks (event delegation)
  document.getElementById('unitsList').addEventListener('click', e => {
    const eqEl  = e.target.closest('.eq-item');
    const hdrEl = e.target.closest('.unit-header');
    if      (eqEl)  selectEquipment(eqEl.dataset.unit, eqEl.dataset.eq);
    else if (hdrEl) openUnit(hdrEl.dataset.unit);
  });

  // SVG map hotspot clicks
  document.getElementById('plantMap').addEventListener('click', e => {
    const g = e.target.closest('.hotspot-group');
    if (!g) return;
    const unit = getUnit(g.dataset.unit);
    if (unit && unit.equipment.length)
      selectEquipment(unit.id, unit.equipment[0].id);
  });

  // SVG keyboard support
  document.getElementById('plantMap').addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const g = e.target.closest('.hotspot-group');
    if (g) { e.preventDefault(); g.click(); }
  });

  // Tab switching (event delegation on stable parent)
  document.getElementById('detailPanel').addEventListener('click', e => {
    const tab = e.target.closest('.dtab');
    if (!tab) return;
    activeTab = tab.dataset.pane;
    document.querySelectorAll('.dtab').forEach(t =>
      t.classList.toggle('active', t.dataset.pane === activeTab)
    );
    document.querySelectorAll('.dtab-pane').forEach(p => {
      p.style.display = p.id === 'pane-' + activeTab ? 'flex' : 'none';
    });
  });
}

// ================================================================
// HIGH-RISK ALERT  (CSS animation only)
// ================================================================
function triggerAlert(eqId) {
  const el = document.getElementById('eq-' + eqId);
  if (!el) return;
  el.classList.remove('alert-new');
  void el.offsetWidth;   // reflow to restart animation
  el.classList.add('alert-new');
  el.addEventListener('animationend', () => el.classList.remove('alert-new'), { once: true });
}

// ================================================================
// LIVE SIMULATION
// ================================================================
function pushHist(arr, val) {
  arr.push(val);
  if (arr.length > HIST) arr.shift();
}

function tickSimulation() {
  const alerts = [];

  unitsData.forEach(unit => {
    unit.equipment.forEach(eq => {
      const prevRisk = eq.risk;

      eq._dt = randDelta(eq.tempRange, 0.018);
      eq._dv = randDelta(eq.vibRange,  0.020);
      eq._dp = randDelta(eq.presRange, 0.015);

      eq.temp = clamp(eq.temp + eq._dt, eq.tempRange[0], eq.tempRange[1]);
      eq.vib  = clamp(eq.vib  + eq._dv, eq.vibRange[0],  eq.vibRange[1]);
      eq.pres = clamp(eq.pres + eq._dp, eq.presRange[0], eq.presRange[1]);

      // Push to history buffers
      pushHist(eq._hist.temp, eq.temp);
      pushHist(eq._hist.vib,  eq.vib);
      pushHist(eq._hist.pres, eq.pres);

      eq.health = computeHealth(eq);
      eq.risk   = computeRisk(eq.health);

      if (eq.risk === 'high' && prevRisk !== 'high') alerts.push(eq.id);
    });
  });

  renderUnits();
  updateHotspots();

  // Apply CSS alerts AFTER DOM is rebuilt
  alerts.forEach(triggerAlert);

  // Refresh detail panel (preserves tab state via activeTab variable)
  if (selectedUnit && selectedEqId) {
    const eq = getEq(selectedUnit, selectedEqId);
    if (eq) renderDetail(eq);
  }

  setTimeout(tickSimulation, 4000 + Math.random() * 2000);
}

// ================================================================
// CLOCK
// ================================================================
function updateClock() {
  const n   = new Date();
  const pad = x => String(x).padStart(2, '0');
  const el  = document.getElementById('systemTime');
  if (el) el.textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
}

// ================================================================
// INIT
// ================================================================
function init() {
  unitsData.forEach(u => u.equipment.forEach(eq => {
    eq._dt = 0; eq._dv = 0; eq._dp = 0;
    eq.health = computeHealth(eq);
    eq.risk   = computeRisk(eq.health);

    // Pre-fill history with slight variation around initial value
    eq._hist = {
      temp: Array.from({ length: HIST }, (_, i) =>
        clamp(eq.temp + (Math.random() - 0.5) * (eq.tempRange[1] - eq.tempRange[0]) * 0.04,
              eq.tempRange[0], eq.tempRange[1])),
      vib:  Array.from({ length: HIST }, () =>
        clamp(eq.vib  + (Math.random() - 0.5) * (eq.vibRange[1]  - eq.vibRange[0])  * 0.04,
              eq.vibRange[0],  eq.vibRange[1])),
      pres: Array.from({ length: HIST }, () =>
        clamp(eq.pres + (Math.random() - 0.5) * (eq.presRange[1] - eq.presRange[0]) * 0.04,
              eq.presRange[0], eq.presRange[1]))
    };
  }));

  renderUnits();
  updateHotspots();
  initEvents();

  updateClock();
  setInterval(updateClock, 1000);

  setTimeout(tickSimulation, 5000);
}

init();
