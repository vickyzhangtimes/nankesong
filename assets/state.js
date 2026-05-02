/* ============================================================
 * 岗位 Agent 工厂 · 全局状态 + 企业切换
 * 用法：所有页面在 </body> 前 <script src="./assets/state.js"></script>
 * 提供：
 *   window.NKS.getState()
 *   window.NKS.setState(patch)
 *   window.NKS.getCompany()
 *   window.NKS.switchCompany(key)
 *   window.NKS.mountCompanySwitch(elId)  // 顶栏挂载企业切换器
 *   window.NKS.mountTopbar(opts)         // 一行挂顶栏
 *   window.NKS.mountTimeline(activeIndex)// 一行挂底部时间线
 * ============================================================ */
(function () {
  const STATE_KEY = 'nks_state';
  const COMPANY_KEY = 'nks_company';
  const DEFAULT_COMPANY = 'hongke';

  function getCompany() {
    return localStorage.getItem(COMPANY_KEY) || DEFAULT_COMPANY;
  }
  function switchCompany(key) {
    if (!['hongke', 'longxia'].includes(key)) return;
    localStorage.setItem(COMPANY_KEY, key);
    location.reload();
  }
  function getState() {
    try {
      return JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
    } catch { return {}; }
  }
  function setState(patch) {
    const cur = getState();
    const next = Object.assign({}, cur, patch);
    localStorage.setItem(STATE_KEY, JSON.stringify(next));
    return next;
  }

  // 当前企业的兜底数据（DEMO_DATA 来自 mock-data.js）
  function getCompanyData() {
    const c = getCompany();
    return (window.DEMO_DATA && window.DEMO_DATA[c]) || null;
  }

  // —— 企业切换器（顶栏右侧）——
  function mountCompanySwitch(targetId) {
    const el = typeof targetId === 'string' ? document.getElementById(targetId) : targetId;
    if (!el) return;
    const cur = getCompany();
    const labelMap = { hongke: '虹科 · ToB 科技', longxia: '林蔷 · 服装制造' };
    el.className = 'nks-company-switch';
    el.innerHTML = `
      <span style="width:8px;height:8px;border-radius:999px;background:#22B77A;"></span>
      <span>企业 · ${labelMap[cur]}</span>
      <span style="opacity:.6;">▾</span>
    `;
    el.title = '点击切换演示企业';
    el.onclick = () => {
      const next = cur === 'hongke' ? 'longxia' : 'hongke';
      switchCompany(next);
    };
  }

  // —— 顶栏（统一）——
  function mountTopbar(opts) {
    opts = opts || {};
    const tagText = opts.tag || '';
    const userName = opts.user || '张小北';
    let host = document.getElementById('nks-topbar');
    if (!host) {
      host = document.createElement('header');
      host.id = 'nks-topbar';
      document.body.insertBefore(host, document.body.firstChild);
    }
    host.className = 'nks-topbar';
    host.innerHTML = `
      <div class="nks-brand">
        <div class="logo">A</div>
        <div>Agentry <span style="color:var(--muted);font-weight:400;font-size:13px;margin-left:4px;">企捏捏</span></div>
      </div>
      <div class="nks-topbar-right">
        <span id="nks-company-switch"></span>
        ${tagText ? `<span class="nks-tag muted">${tagText}</span>` : ''}
        <span style="display:inline-flex;align-items:center;gap:8px;">
          <span style="width:32px;height:32px;border-radius:999px;background:#EAF2FF;color:#173A89;display:grid;place-items:center;font-weight:700;">${userName.slice(0,1)}</span>
          ${userName}
        </span>
      </div>
    `;
    mountCompanySwitch('nks-company-switch');
  }

  // —— 底部 6 步时间线 ——
  const TIMELINE = [
    { n: 1, label: '认知与空间' },
    { n: 2, label: '企业记忆' },
    { n: 3, label: '路由与骨架' },
    { n: 4, label: '执行与迭代' },
    { n: 5, label: '进入工作台执行' },
    { n: 6, label: '反馈后持续迭代' },
  ];
  function mountTimeline(activeIndex) {
    let host = document.getElementById('nks-timeline');
    if (!host) {
      host = document.createElement('footer');
      host.id = 'nks-timeline';
      document.body.appendChild(host);
    }
    host.className = 'nks-timeline';
    host.innerHTML = TIMELINE.map((s, i) => `
      <div class="step ${i === activeIndex ? 'active' : ''}">
        <span class="n">${s.n}</span><span>${s.label}</span>
      </div>
    `).join('');
  }

  window.NKS = {
    getState, setState,
    getCompany, switchCompany, getCompanyData,
    mountTopbar, mountCompanySwitch, mountTimeline,
  };
})();
