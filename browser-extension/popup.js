// popup.js — 汉语言 AI 助手 弹出窗口逻辑

const knowledgeBase = {
  // ── 说文解字 ──
  shuowen: {
    "日": { explain: "实也。太阳之精不亏。象形。", liushu: "象形", bushou: "日部" },
    "月": { explain: "阙也。太阴之精。象形。", liushu: "象形", bushou: "月部" },
    "山": { explain: "宣也。宣气散，生万物。象形。", liushu: "象形", bushou: "山部" },
    "水": { explain: "准也。北方之行。象众水并流。", liushu: "象形", bushou: "水部" },
    "火": { explain: "毁也。南方之行。炎而上。象形。", liushu: "象形", bushou: "火部" },
    "木": { explain: "冒也。冒地而生。象形。", liushu: "象形", bushou: "木部" },
    "人": { explain: "天地之性最贵者也。象形。", liushu: "象形", bushou: "人部" },
    "上": { explain: "高也。指事。", liushu: "指事", bushou: "一部" },
    "下": { explain: "底也。指事。", liushu: "指事", bushou: "一部" },
    "天": { explain: "颠也。至高无上。会意。", liushu: "会意", bushou: "一部" },
    "武": { explain: "止戈为武。会意。", liushu: "会意", bushou: "止部" },
    "信": { explain: "诚也。从人从言。会意。", liushu: "会意", bushou: "人部" },
    "江": { explain: "水。出蜀湔氐徼外岷山。形声。", liushu: "形声", bushou: "水部" },
    "河": { explain: "水。出焞煌塞外昆仑山。形声。", liushu: "形声", bushou: "水部" },
    "莫": { explain: "日且冥也。从日在茻中。会意。", liushu: "会意", bushou: "茻部" },
  },
  
  // ── 平仄检测 ──
  pingze: {
    // 默认通用规则
    "default": "平仄检测：输入一句五言或七言诗，自动标注每个字的平仄。",
    "白日依山尽": { result: "仄仄平平仄 ✅", pingze: ["仄","仄","平","平","仄"], note: "合律，仄起首句不入韵式" },
    "黄河入海流": { result: "平平仄仄平 ✅", pingze: ["平","平","仄","仄","平"], note: "合律" },
    "欲穷千里目": { result: "仄平平仄仄 ✅", pingze: ["仄","平","平","仄","仄"], note: "合律，仄起" },
    "更上一层楼": { result: "仄仄仄平平 ✅", pingze: ["仄","仄","仄","平","平"], note: "合律" },
    "床前明月光": { result: "平平平仄平 ✅", pingze: ["平","平","平","仄","平"], note: "五言律句变格" },
    "疑是地上霜": { result: "平仄仄仄平 ❌", pingze: ["平","仄","仄","仄","平"], note: "出律，第三字应平" },
  },

  // ── 句读 ──
  juandu: {
    "default": "古籍句读：输入无标点的古文，自动添加标点断句。",
  },

  // ── 异体通假字 ──
  yitizi: {
    "莫": { type: "古今字", modern: "暮", note: "「莫」本义为日暮，后加「日」作「暮」表本义。" },
    "孰": { type: "古今字", modern: "熟", note: "「孰」本义为食物熟，后加「火」作「熟」。功能分化。" },
    "蚤": { type: "通假字", standard: "早", note: "《史记》多用「蚤」通「早」。" },
    "畔": { type: "通假字", standard: "叛", note: "《论语》「君子不畔」通「叛」。" },
    "说": { type: "通假字", standard: "悦", note: "《论语》「学而时习之，不亦说乎」通「悦」。" },
    "女": { type: "通假字", standard: "汝", note: "《诗经》「三岁贯女」通「汝」。" },
    "见": { type: "通假字", standard: "现", note: "《战国策》「图穷而匕首见」通「现」。" },
    "陈": { type: "古今字", modern: "阵", note: "「陈」古兼有「阵」义，后分化。" },
    "解": { type: "古今字", modern: "懈", note: "《诗经》「夙夜匪解」通「懈」。" },
    "峯": { type: "异体字", standard: "峰", note: "异体字关系，音义全同。" },
    "寔": { type: "异体字", standard: "实", note: "异体字关系。" },
  },

  // ── 经学引证 ──
  jingdian: {
    "天行健": { source: "《周易·乾卦》", text: "天行健，君子以自强不息。" },
    "学而时习之": { source: "《论语·学而》", text: "学而时习之，不亦说乎？" },
    "有朋自远方来": { source: "《论语·学而》", text: "有朋自远方来，不亦乐乎？" },
    "关关雎鸠": { source: "《诗经·周南·关雎》", text: "关关雎鸠，在河之洲。" },
    "昔我往矣": { source: "《诗经·小雅·采薇》", text: "昔我往矣，杨柳依依。" },
    "大道之行": { source: "《礼记·礼运》", text: "大道之行也，天下为公。" },
    "大学之道": { source: "《大学》", text: "大学之道，在明明德。" },
    "北冥有鱼": { source: "《庄子·逍遥游》", text: "北冥有鱼，其名为鲲。" },
    "道可道": { source: "《老子》", text: "道可道，非常道。" },
    "上善若水": { source: "《老子》", text: "上善若水。水善利万物而不争。" },
    "先天下之忧而忧": { source: "范仲淹《岳阳楼记》", text: "先天下之忧而忧，后天下之乐而乐。" },
  }
};

// 工具按钮点击
document.querySelectorAll('[data-tool]').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById('searchInput');
    input.placeholder = `输入要查的内容...`;
    input.focus();
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

  // 查说文
  const swResult = knowledgeBase.shuowen[input];
  if (swResult) {
    resultArea.innerHTML += `
      <div class="item">
        <div class="label">🔍 说文解字 · ${input}</div>
        <div class="content">${swResult.explain}<br>
          <span class="explain">六书：${swResult.liushu} · 部首：${swResult.bushou}</span>
        </div>
      </div>`;
  }

  // 查平仄
  const pzKeys = Object.keys(knowledgeBase.pingze);
  if (pzKeys.includes(input)) {
    const pz = knowledgeBase.pingze[input];
    resultArea.innerHTML += `
      <div class="item">
        <div class="label">📐 平仄检测</div>
        <div class="content">${pz.result}<br>
          <span class="explain">${pz.pingze.join(' ')} · ${pz.note}</span>
        </div>
      </div>`;
  }

  // 查异体通假字
  const ytResult = knowledgeBase.yitizi[input];
  if (ytResult) {
    resultArea.innerHTML += `
      <div class="item">
        <div class="label">🔤 异体/通假/古今字 · ${input}</div>
        <div class="content">
          ${ytResult.type}：${ytResult.standard || ytResult.modern}<br>
          <span class="explain">${ytResult.note}</span>
        </div>
      </div>`;
  }

  // 查经学引证
  const jdResult = knowledgeBase.jingdian[input];
  if (jdResult) {
    resultArea.innerHTML += `
      <div class="item">
        <div class="label">🏛 经学引证 · ${jdResult.source}</div>
        <div class="content">${jdResult.text}</div>
      </div>`;
  }

  // 句读示例
  if (input.includes("子曰") || input.includes("者也")) {
    resultArea.innerHTML += `
      <div class="item">
        <div class="label">📖 古籍句读</div>
        <div class="content">${input.split('').join('').replace(/者/g,'者，').replace(/也/g,'也。')}</div>
      </div>`;
  }

  // 查不到
  if (!resultArea.innerHTML) {
    resultArea.innerHTML = `
      <div class="item">
        <div class="label">ℹ️ 未找到</div>
        <div class="content">「${input}」暂未收录，正在逐步完善中。<br>
          <span class="explain">你可以试试：日、月、天、武、信、白日依山尽、天行健</span>
        </div>
      </div>`;
  }
}
