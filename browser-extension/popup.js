// popup.js — 汉语言 AI 助手 v1.2
// 数据来源：广韵音系平仄 | 徐铉本说文解字 | 四库全书经部引证

let data = null;

async function loadData() {
  try {
    const resp = await fetch(chrome.runtime.getURL('data.json'));
    data = await resp.json();
    console.log(`📜 已加载：平仄${data.count?.pingze||'?'}字 · 说文${data.count?.shuowen||'?'}条 · 经学${data.count?.jingdian||'?'}条`);
  } catch(e) {
    data = { pingze: {}, shuowen: {}, jingdian: {} };
  }
}

document.querySelectorAll('[data-tool]').forEach(btn => {
  btn.addEventListener('click', () => document.getElementById('searchInput').focus());
});

document.getElementById('searchBtn').addEventListener('click', search);
document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') search();
});

function search() {
  const input = document.getElementById('searchInput').value.trim();
  if (!input) return;
  
  const resultArea = document.getElementById('resultArea');
  resultArea.innerHTML = '';
  let found = false;

  // ── 1. 诗句平仄检测 ──
  if (input.length >= 2 && input.length <= 7 && data?.pingze) {
    const chars = input.split('');
    const tones = chars.map(c => data.pingze[c] || '？');
    const knownCount = tones.filter(t => t !== '？').length;
    
    if (knownCount >= chars.length - 1) {
      found = true;
      const pattern = tones.map(t => t === '平' ? '平' : t === '？' ? '？' : '仄').join('');
      resultArea.innerHTML += `
        <div class="item">
          <div class="label">📐 平仄检测</div>
          <div class="content">
            ${chars.map((c,i) => `<b>${c}</b><small>${tones[i]}</small>`).join(' ')}
            <br><span class="explain">依广韵音系 · 王力中古音体系</span>
          </div>
        </div>`;
    }
  }

  // ── 2. 单个字查询 ──
  if (input.length === 1) {
    // 说文解字
    if (data?.shuowen?.[input]) {
      found = true;
      resultArea.innerHTML += `
        <div class="item">
          <div class="label">🔍 说文解字 · ${input}（徐铉本）</div>
          <div class="content">${data.shuowen[input]}</div>
        </div>`;
    }
    // 平仄
    if (data?.pingze?.[input]) {
      found = true;
      resultArea.innerHTML += `
        <div class="item">
          <div class="label">📐 平仄 · ${input}</div>
          <div class="content">「${input}」属 <b>${data.pingze[input] === '平' ? '平声' : '仄声'}</b>
          <br><span class="explain">依广韵音系</span></div>
        </div>`;
    }
  }

  // ── 3. 经学引证（从 data.json 加载）──
  if (data?.jingdian) {
    const jdMatch = Object.keys(data.jingdian).find(k => input.includes(k));
    if (jdMatch) {
      found = true;
      resultArea.innerHTML += `
        <div class="item">
          <div class="label">🏛 经学引证 · 《四库全书》经部</div>
          <div class="content">${data.jingdian[jdMatch]}</div>
        </div>`;
    }
  }

  // ── 4. 古籍句读 ──
  if (/[者也乎矣哉欤耶兮]/.test(input)) {
    found = true;
    let r = input;
    r = r.replace(/者/g,'者，').replace(/也/g,'也。').replace(/乎[^？]/, m=>m+'？').replace(/矣/g,'矣。').replace(/哉[^！]/g,'哉！').replace(/耶/g,'耶？').replace(/欤/g,'欤？');
    if (input.includes('曰')) {
      r = r.replace(/曰：?/g, '曰：「') + '」';
    }
    resultArea.innerHTML += `
      <div class="item">
        <div class="label">📖 古籍句读</div>
        <div class="content">${r}</div>
      </div>`;
  }

  // ── 5. 未找到──
  if (!found) {
    const allC = input.split('');
    const known = allC.filter(c => data?.pingze?.[c]);
    resultArea.innerHTML += `
      <div class="item">
        <div class="label">ℹ️ 查询结果</div>
        <div class="content">
          「${input}」<br>
          <span class="explain">已收录 ${known.length}/${allC.length} 字<br>
          试试：日、月、天、关关雎鸠、天行健、学而时习之</span>
        </div>
      </div>`;
  }
}

loadData();

chrome.storage.local.get(['selection'], (result) => {
  if (result.selection) {
    document.getElementById('searchInput').value = result.selection;
    search();
    chrome.storage.local.remove(['selection']);
  }
});
