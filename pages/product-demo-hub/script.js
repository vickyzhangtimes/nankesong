NKS.mountTopbar({ user: '张小北' });
    // home 不挂 timeline（不属于主链路 6 步）

    (function () {
      const data = NKS.getCompanyData();
      const id = data.enterprise_identity;

      // 时段问候
      const h = new Date().getHours();
      const greet = h < 6 ? '凌晨好' : h < 11 ? '早上好' : h < 13 ? '中午好' : h < 18 ? '下午好' : '晚上好';
      document.getElementById('greet-title').textContent = `${greet}，张小北`;

      // 当前公司
      document.getElementById('company-name').textContent = id.enterprise_name;

      // 召唤卡内容
      document.getElementById('demand-title').textContent = data.raw_demand.title;
      document.getElementById('demand-excerpt').textContent = data.raw_demand.excerpt;

      // 已完成数（取已上岗员工 tasks_done 之和）
      const totalDone = data.roster.reduce((s, e) => s + (e.tasks_done || 0), 0);
      document.getElementById('done-count').textContent = totalDone;
      document.getElementById('emp-count').textContent = data.roster.length;

      // 员工卡
      document.getElementById('roster').innerHTML = data.roster.map(e => `
        <a class="emp" href="../ai-employee-roster/index.html">
          <div class="top">
            <div class="avatar">${e.name.slice(-1)}</div>
            <div class="who">
              <div class="name">${e.name} · <span style="color:var(--muted);font-weight:500;font-size:13px;">${e.id}</span></div>
              <div class="title">${e.title} · ${e.department}</div>
            </div>
          </div>
          <div class="stats">
            <span><b>${e.tasks_done}</b>件已完成</span>
            <span style="color:var(--primary);">${e.status}</span>
          </div>
        </a>
      `).join('');

      // —— 诊断按钮：调真 LLM ——
      const mask = document.getElementById('diag-mask');
      const body = document.getElementById('diag-body');
      const memPill = document.getElementById('diag-mem-pill');
      const continueBtn = document.getElementById('diag-continue');
      const sourceEl = document.getElementById('diag-source');

      function escapeHtml(s) {
        return String(s == null ? '' : s)
          .replace(/&/g, '&amp;').replace(/</g, '&lt;')
          .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }

      function renderResult(d) {
        const r = d.routing_decision || {};
        const metrics = (d.diagnosis_metrics || []).slice(0, 4);
        const skel = (d.seven_skeleton || []).slice(0, 7);

        const decisionLabel = ({
          reuse_agent: '复用现有 Agent',
          add_workflow: '加挂 Workflow',
          new_role_agent: '新建岗位 Agent',
        })[r.decision] || r.decision || '—';

        const metricsHTML = metrics.map(m => `
          <div class="metric">
            <div class="name">${escapeHtml(m.name)}</div>
            <div class="vals">${escapeHtml(m.baseline)} → <em>${escapeHtml(m.target)}</em></div>
          </div>
        `).join('');

        const skelHTML = skel.map((s, i) => {
          const isLast = i === 6;
          const isRed = String(s.title || '').includes('红线');
          const items = Array.isArray(s.items) ? s.items : [String(s.content || '')];
          return `
            <div class="skeleton-card ${isLast ? 'last-span' : ''} ${isRed ? 'red-line' : ''}">
              <span class="idx">${s.idx || (i + 1)}</span>
              <span class="title">${escapeHtml(s.title)}</span>
              <ul>${items.map(it => `<li>${escapeHtml(it)}</li>`).join('')}</ul>
            </div>
          `;
        }).join('');

        body.innerHTML = `
          <div class="route-card">
            <div class="lab">路由判断</div>
            <h3>${escapeHtml(decisionLabel)} · ${escapeHtml(r.target_agent || '')}</h3>
            <div class="reason">${escapeHtml(r.reason || '')}</div>
          </div>
          <div class="metrics-grid">${metricsHTML}</div>
          <div class="skeleton-grid">${skelHTML}</div>
        `;

        memPill.style.visibility = 'visible';
        continueBtn.style.display = 'inline-flex';
      }

      function renderError(msg) {
        body.innerHTML = `
          <div class="err-card">
            <b>诊断失败：</b>${escapeHtml(msg)}<br>
            <span style="color:var(--muted);">已自动回退兜底数据，路演仍可继续。Ctrl+Shift+M 可强制兜底模式。</span>
          </div>
        `;
        continueBtn.style.display = 'inline-flex';
      }

      document.getElementById('btn-open-diag')?.addEventListener('click', function () {
        document.getElementById('btn-summon').click();
      });

      document.getElementById('btn-summon').addEventListener('click', async () => {
        sourceEl.textContent = data.raw_demand.title;
        body.innerHTML = `
          <div class="nks-loading">
            <div class="nks-spinner"></div>
            <span>读取企业身份证 · 路由判断 · 生成七层骨架（约 10 ~ 20 秒）…</span>
          </div>`;
        memPill.style.visibility = 'hidden';
        continueBtn.style.display = 'none';
        mask.classList.add('show');

        try {
          const result = await NKS_LLM.diagnose({
            company: NKS.getCompany(),
            enterprise_identity: data.enterprise_identity,
            existing_agents: data.roster,
            raw_demand: data.raw_demand.excerpt || data.raw_demand.title,
          });
          if (!result || !result.seven_skeleton) {
            return renderError('返回数据为空');
          }
          renderResult(result);
        } catch (err) {
          renderError(String((err && err.message) || err));
        }
      });

      document.getElementById('diag-close').addEventListener('click', () => {
        mask.classList.remove('show');
      });
      mask.addEventListener('click', (e) => {
        if (e.target === mask) mask.classList.remove('show');
      });
    })();
