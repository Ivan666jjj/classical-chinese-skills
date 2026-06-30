// popup.js — 汉语言 AI 助手
// 从 data.json 加载数据，支持本地查询和联网 AI 查询

let data = null;

// 加载数据
async function loadData() {
  try {
    const resp = await fetch(chrome.runtime.getURL('data.json'));
    data = await resp.json();
    console.log(`📜 已加载 ${data.pingze?.count || Object.keys(data.pingze||{}).length} 字`);
  } catch(e) {
    console.log('本地数据加载中...');
    data = { pingze: {}, shuowen: {} };
  }
}

// 工具按钮点击
document.querySelectorAll('[data-tool]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('searchInput').focus();
  });
});

// 搜索
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

  // ── 诗句平仄检测 ──
  if (input.length >= 2 && input.length <= 7 && data?.pingze) {
    const chars = input.split('');
    const tones = chars.map(c => data.pingze[c] || '？');
    const allKnown = tones.every(t => t !== '？');
    
    if (allKnown || tones.filter(t => t === '？').length <= 1) {
      found = true;
      const pattern = tones.map(t => t === '平' ? '平' : '仄').join('');
      const isMatch = checkPingzePattern(pattern, input.length);
      
      resultArea.innerHTML += `
        <div class="item">
          <div class="label">📐 平仄检测</div>
          <div class="content">
            ${chars.map((c, i) => `<b>${c}</b>(${tones[i]})`).join(' ')}
            <br><span class="explain">${isMatch ? '✅ 合律' : '⚠️ 请核对'}</span>
          </div>
        </div>`;
    }
  }

  // ── 说文解字 ──
  if (input.length === 1 && data?.shuowen?.[input]) {
    found = true;
    resultArea.innerHTML += `
      <div class="item">
        <div class="label">🔍 说文解字 · ${input}</div>
        <div class="content">${data.shuowen[input]}</div>
      </div>`;
  }

  // ── 单个字查平仄 ──
  if (input.length === 1 && data?.pingze?.[input]) {
    found = true;
    resultArea.innerHTML += `
      <div class="item">
        <div class="label">📐 平仄 · ${input}</div>
        <div class="content">「${input}」属 <b>${data.pingze[input] === '平' ? '平声' : '仄声'}</b></div>
      </div>`;
  }

  // ── 经学引证 ──
  const jingdian = {
    "天行健": "《周易·乾卦》：天行健，君子以自强不息。",
    "学而时习之": "《论语·学而》：学而时习之，不亦说乎？",
    "有朋自远方来": "《论语·学而》：有朋自远方来，不亦乐乎？",
    "关关雎鸠": "《诗经·周南·关雎》：关关雎鸠，在河之洲。",
    "昔我往矣": "《诗经·小雅·采薇》：昔我往矣，杨柳依依。",
    "大道之行": "《礼记·礼运》：大道之行也，天下为公。",
    "大学之道": "《大学》：大学之道，在明明德。",
    "北冥有鱼": "《庄子·逍遥游》：北冥有鱼，其名为鲲。",
    "道可道": "《老子》：道可道，非常道。",
    "上善若水": "《老子》：上善若水。水善利万物而不争。",
    "学而不思则罔": "《论语·为政》：学而不思则罔，思而不学则殆。",
    "温故而知新": "《论语·为政》：温故而知新，可以为师矣。",
    "三人行": "《论语·述而》：三人行，必有我师焉。",
    "己所不欲": "《论语·颜渊》：己所不欲，勿施于人。",
    "言必信": "《论语·子路》：言必信，行必果。",
    "先天下之忧而忧": "范仲淹《岳阳楼记》：先天下之忧而忧，后天下之乐而乐。",
    "落霞与孤鹜": "王勃《滕王阁序》：落霞与孤鹜齐飞，秋水共长天一色。",
  };
  
  const jdMatch = Object.keys(jingdian).find(k => input.includes(k));
  if (jdMatch) {
    found = true;
    resultArea.innerHTML += `
      <div class="item">
        <div class="label">🏛 经学引证</div>
        <div class="content">${jingdian[jdMatch]}<br>
          <span class="explain">关键词：${jdMatch}</span>
        </div>
      </div>`;
  }

  // ── 句读 ──
  if (input.includes('者') || input.includes('也') || input.includes('乎') || input.includes('矣') || input.includes('哉') || input.includes('曰')) {
    found = true;
    let result = input;
    result = result.replace(/者/g, '者，').replace(/也/g, '也。').replace(/乎/g, '乎？').replace(/矣/g, '矣。').replace(/哉/g, '哉！');
    if (input.includes('曰')) result = result.replace(/曰/g, '曰：「') + '」';
    resultArea.innerHTML += `
      <div class="item">
        <div class="label">📖 古籍句读</div>
        <div class="content">${result}</div>
      </div>`;
  }

  // ── 未找到 ──
  if (!found) {
    const allChars = input.split('');
    const knownChars = allChars.filter(c => data?.pingze?.[c]);
    const unknownChars = allChars.filter(c => !data?.pingze?.[c]);
    
    resultArea.innerHTML += `
      <div class="item">
        <div class="label">ℹ️ 查询结果</div>
        <div class="content">
          「${input}」<br>
          <span class="explain">
            已收录 ${knownChars.length} 字，待收录 ${unknownChars.length} 字。<br>
            试试：日、月、山、天行健、学而时习之<br>
            或输入一句诗检测平仄
          </span>
        </div>
      </div>`;
  }
}

function checkPingzePattern(pattern, len) {
  // 五言律句格式
  if (len === 5) {
    const valid = ['仄仄平平仄', '平平仄仄平', '仄平平仄仄', '平仄仄平平',
                   '平平平仄仄', '仄仄仄平平', '仄仄平平平', '平平仄仄仄'];
    return valid.includes(pattern);
  }
  if (len === 7) {
    const valid = ['平平仄仄平平仄', '仄仄平平仄仄平', '平平仄仄仄平平', '仄仄平平平仄仄'];
    return valid.includes(pattern);
  }
  return false;
}

// 初始化
loadData();

// 接收来自右键菜单的选择文字
chrome.storage.local.get(['selection'], (result) => {
  if (result.selection) {
    document.getElementById('searchInput').value = result.selection;
    search();
    chrome.storage.local.remove(['selection']);
  }
});
