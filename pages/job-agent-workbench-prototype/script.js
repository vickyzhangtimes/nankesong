NKS.mountTopbar({ user: '张小北', tag: '员工工作台' });
NKS.mountTimeline(4);

(function () {
  function setText(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
  var data = NKS.getCompanyData();
  var state = NKS.getState() || {};
  var company = NKS.getCompany();
  var qs = new URLSearchParams(location.search);
  // 路由：?agent=secondary 或 state.activeAgentKey === 'secondary' 时使用第二员工闭环
  var agentKey = qs.get('agent') || state.activeAgentKey || 'primary';
  // 若 selectedEmployee 来自 roster，且其 employee_id 与 secondary 匹配，则强制 secondary
  if (state.selectedEmployee && data.secondary_agent
      && (state.selectedEmployee.id === data.secondary_agent.employee_id
        || state.selectedEmployee.name === data.secondary_agent.name)) {
    agentKey = 'secondary';
  }
  var dataAb = (agentKey === 'secondary' && data.secondary_agent)
    ? data.secondary_agent
    : (data.agent_birth_card || {});
  var taskV1Source = (agentKey === 'secondary' && data.secondary_task_v1)
    ? data.secondary_task_v1
    : (data.task_v1 || { outputs: [] });
  // 优先用诊断流程写入的 currentAgent / agentProfile；但若部门与当前公司不一致，回退
  var ab = dataAb;
  var stCur = state.currentAgent || {};
  var stPro = state.agentProfile || {};
  var sameDept = function (x) {
    return x && x.department && dataAb.department && x.department === dataAb.department;
  };
  // 只在 primary 路径才接受 state 注入（secondary 路径完全使用 mock-data，避免被 birth-card 残留覆盖）
  if (agentKey === 'primary') {
    if (sameDept(stCur)) ab = Object.assign({}, dataAb, stCur);
    if (sameDept(stPro)) {
      ab = Object.assign({}, ab, {
        name: stPro.name || ab.name,
        title: stPro.role || ab.title,
        department: stPro.department || ab.department,
        tasks_i_can_do: stPro.tasks_i_can_do || ab.tasks_i_can_do,
        red_lines: stPro.work_boundaries || ab.red_lines,
      });
    }
  }
  var taskV1 = taskV1Source;
  var memUsed = taskV1.memory_used || ['企业身份证', '部门库', '术语表', '红线规则'];
  var agentName = ab.name || '小薯';

  // ── 员工头像与标识 ──
  setText('empName', agentName);
  setText('empTitle', ab.title || 'ToB 内容增长专员');
  var empAvatar = document.querySelector('.wb-emp-avatar');
  if (empAvatar) empAvatar.textContent = ab.avatar_emoji || '🥔';

  // ── 中间运行区：标题/子标题/4 步执行 全部按公司动态 ──
  var tasksAll = ab.tasks_i_can_do || ['多平台改写', '行业洞察简报', '配图 prompt 生成', '内容复盘'];
  setText('currentTaskTitle', tasksAll[0] || '当前任务');
  setText('currentTaskSub', taskV1.input_summary || '当前任务输入 → V1 产物');

  var redLines = ab.red_lines || ['不自动发布', '不编造关键事实', '关键决策需人工确认'];
  var platforms = (taskV1.outputs || []).map(function (o) { return o.platform; }).filter(Boolean);
  var stepsByCompany = (company === 'longxia' || company === 'nankesong')
    ? [
        { b: '读取多源原始表', small: taskV1.input_summary || '当前任务原始数据已解析' },
        { b: '对齐字段与编码规则', small: '读取 ' + memUsed.length + ' 项记忆、' + redLines.length + ' 条红线' },
        { b: '生成 V1 标准化产物', small: platforms.length ? platforms.join(' / ') : '标准尺码表 / 异常清单' },
        { b: '标记需人工复核项，等待反馈', small: '特体与异常行交由你拍板' },
      ]
    : [
        { b: '读取需求与材料', small: taskV1.input_summary || '当前任务材料已解析' },
        { b: '调用岗位骨架与红线', small: '读取 ' + memUsed.length + ' 项记忆、' + redLines.length + ' 条红线' },
        { b: '生成 V1 多平台产物', small: platforms.length ? platforms.join(' / ') : '公众号 / 知乎 / LinkedIn / 小红书' },
        { b: '标记需复核段落，等待反馈', small: '下一步进入「反馈进化」由人审改' },
      ];
  var execStepsEl = document.getElementById('execSteps');
  if (execStepsEl) {
    execStepsEl.innerHTML = stepsByCompany.map(function (s) {
      return '<li><span class="step-dot"></span><div><b>' + NKS.escapeHtml(s.b) + '</b><small>' + NKS.escapeHtml(s.small) + '</small></div></li>';
    }).join('');
  }

  // ── tip & loading 文案 ──
  setText('tipText', agentName + '会在企业记忆与红线约束下生成 V1 产物。你来人工审改，反馈写入规则库后，V2 会更准、更专业 — 这正是下一步「反馈进化」要演示的事。');
  setText('loading-text', agentName + '正在执行任务…');

  // ── 可交办任务列表 ──
  var tasks = ab.tasks_i_can_do || ['多平台改写', '行业洞察简报', '配图 prompt 生成', '内容复盘'];
  var taskList = document.getElementById('taskList');
  if (taskList) {
    taskList.innerHTML = tasks.map(function (t, i) {
      var active = i === 0 ? ' active' : '';
      return '<li class="wb-task-item' + active + '" data-idx="' + i + '">' +
        '<span class="wb-task-dot"></span>' +
        '<div class="wb-task-meta"><b>' + NKS.escapeHtml(t) + '</b>' +
        (i === 0 ? '<small>当前任务 · 演示中</small>' : '<small>可交办</small>') +
        '</div></li>';
    }).join('');
    setText('taskTotal', String(tasks.length));

    // 任务点击：只切高亮，不真切换内容（Demo 演示）
    taskList.querySelectorAll('.wb-task-item').forEach(function (el) {
      el.addEventListener('click', function () {
        if (el.classList.contains('active')) return;
        taskList.querySelectorAll('.wb-task-item').forEach(function (x) {
          x.classList.remove('active');
          var s = x.querySelector('small');
          if (s) s.textContent = '可交办';
        });
        el.classList.add('active');
        var s = el.querySelector('small');
        if (s) s.textContent = '已选中（Demo 仅演示「多平台改写」）';
        NKS.toast('Demo 中只演示首项任务，本次仍跑「多平台改写」', 'info');
      });
    });
  }

  // ── 企业记忆 ──
  setText('memoryCount', '已读取 ' + (taskV1.memory_used_count || memUsed.length) + ' 条');
  var memEl = document.getElementById('memoryList');
  if (memEl) {
    memEl.innerHTML = memUsed.map(function (m) {
      return '<li>' + NKS.escapeHtml(m) + '</li>';
    }).join('');
  }

  // ── 红线 ──
  var rl = ab.red_lines || ['不自动发布', '不编造技术参数', '客户案例需脱敏'];
  var rlEl = document.getElementById('redlineList');
  if (rlEl) {
    rlEl.innerHTML = rl.map(function (r) {
      return '<li>' + NKS.escapeHtml(r) + '</li>';
    }).join('');
  }

  // ── 运行模式切换 ──
  var modeRadios = document.querySelectorAll('input[name="runtime-mode"]');
  modeRadios.forEach(function (r) {
    r.addEventListener('change', function () {
      document.querySelectorAll('.wb-mode').forEach(function (l) { l.classList.remove('active'); });
      r.closest('.wb-mode').classList.add('active');
      NKS.setState({ runtime_mode: r.value });
    });
  });

  // ── 执行任务 ──
  var runBtn = document.getElementById('runTaskBtn');
  var execStatus = document.getElementById('execStatus');
  var execSteps = document.getElementById('execSteps');
  var deliveryCard = document.getElementById('deliveryCard');
  var runHint = document.getElementById('runHint');
  var isSizeDemo = company === 'longxia' || company === 'nankesong';
  var downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) downloadBtn.textContent = isSizeDemo ? '导出 Excel' : '下载 Markdown';

  function backendFileUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//.test(path)) return path;
    var cfg = window.NKS_LLM_CONFIG || {};
    var base = (cfg.backendBaseURL || window.NKS_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');
    if (path.charAt(0) === '/') {
      try { return new URL(base).origin + path; } catch (e) { return path; }
    }
    return base + '/' + path.replace(/^\//, '');
  }

  function renderDelivery() {
    var grid = document.getElementById('deliveryGrid');
    if (!grid) return;
    var outs = (taskV1.outputs || []).slice(0, 4);
    if (!outs.length) {
      outs = [
        { platform: '公众号', title: '【重磅发布】下一代汽车总线测试工具链来了', body: '在汽车智能化的浪潮下…' },
        { platform: '知乎', title: '虹科 v3 速览', body: 'CAN FD/Ethernet 多协议并发场景实测延迟降低 35%…' },
        { platform: 'LinkedIn', title: 'HongKe Bus Test Toolchain v3', body: 'Built for OEM & Tier1 R&D teams…' },
        { platform: '小红书', title: '工程师在用什么工具测车？🚗', body: '今天来扒一扒车厂研发同事都在用的硬核工具…' },
      ];
    }
    grid.innerHTML = outs.map(function (o, idx) {
      return '<div class="wb-deliv-item" data-idx="' + idx + '">' +
        '<div class="wb-deliv-head">' +
          '<span class="wb-deliv-platform">' + NKS.escapeHtml(o.platform) + '</span>' +
          '<a href="#" class="wb-deliv-link" data-view="' + idx + '">查看全文 →</a>' +
        '</div>' +
        '<div class="wb-deliv-title">' + NKS.escapeHtml(o.title) + '</div>' +
        '<div class="wb-deliv-body">' + NKS.escapeHtml(o.body) + '</div>' +
        '</div>';
    }).join('');
    grid._outs = outs;
  }

  function excelEscape(value) {
    return NKS.escapeHtml(value == null ? '' : String(value));
  }

  function sizeStandardRows() {
    return [
      ['编号', '姓名', '身高', '原始尺码', '推荐尺码', '复核状态', '备注'],
      ['001', '张某某', '165', '165/80A', '165/80A', '通过', '字段完整'],
      ['002', '王某某', '170', '170/84A', '170/84A', '通过', '字段完整'],
      ['003', '李某某', '160', '160/76A', '', '待人工复核', '疑似偏小，不自动推荐'],
      ['015', '赵某某', '165', '165/96B', '', '待人工复核', '特体尺码，按红线留给人工确认'],
    ];
  }

  function sizeAnomalyRows() {
    return [
      ['异常类型', '数量', '处理方式', '写回规则'],
      ['字段缺失', '12', '进入人工复核清单', '缺失关键字段不生成最终尺码'],
      ['尺码超阈值', '6', '标红并保留原始值', '异常行必须可追溯到原始行'],
      ['特体待确认', '5', '推荐尺码留空', '特体不自动决策，必须人工确认'],
    ];
  }

  function buildExcelHtml() {
    function table(title, rows) {
      return '<h2>' + excelEscape(title) + '</h2><table border="1">' +
        rows.map(function (row, rowIndex) {
          return '<tr>' + row.map(function (cell) {
            var tag = rowIndex === 0 ? 'th' : 'td';
            return '<' + tag + '>' + excelEscape(cell) + '</' + tag + '>';
          }).join('') + '</tr>';
        }).join('') + '</table><br>';
    }
    return '\ufeff<html><head><meta charset="utf-8"></head><body>' +
      table('标准尺码表 v1', sizeStandardRows()) +
      table('异常与人工复核清单', sizeAnomalyRows()) +
      '</body></html>';
  }

  // ── 查看全文抽屉 / 下载 / 复制 ──
  var fullDrawer = document.getElementById('fullDrawer');
  var drawerTitle = document.getElementById('drawerTitle');
  var drawerBody = document.getElementById('drawerBody');
  function openDrawer(o) {
    if (!fullDrawer) return;
    drawerTitle.textContent = '[' + (o.platform || '') + '] ' + (o.title || '');
    drawerBody.innerHTML = '<pre class="wb-drawer-pre">' + NKS.escapeHtml(o.body || '') + '</pre>';
    fullDrawer.hidden = false;
  }
  function closeDrawer() { if (fullDrawer) fullDrawer.hidden = true; }
  if (fullDrawer) {
    fullDrawer.addEventListener('click', function (e) {
      if (e.target.getAttribute('data-close') === '1') closeDrawer();
    });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-view]');
    if (a) {
      e.preventDefault();
      var grid = document.getElementById('deliveryGrid');
      var outs = grid && grid._outs;
      var idx = parseInt(a.getAttribute('data-view'), 10);
      if (outs && outs[idx]) openDrawer(outs[idx]);
    }
    if (e.target.id === 'viewFullBtn') {
      var grid2 = document.getElementById('deliveryGrid');
      var outs2 = grid2 && grid2._outs;
      if (outs2 && outs2[0]) openDrawer(outs2[0]);
    }
    if (e.target.id === 'downloadBtn') {
      var grid3 = document.getElementById('deliveryGrid');
      var outs3 = (grid3 && grid3._outs) || [];
      if (isSizeDemo) {
        var exportItem = taskV1 && Array.isArray(taskV1.excel_exports)
          ? taskV1.excel_exports.find(function (item) { return item.type === 'standard_size_table'; }) || taskV1.excel_exports[0]
          : null;
        if (exportItem && exportItem.url) {
          var backendLink = document.createElement('a');
          backendLink.href = backendFileUrl(exportItem.url);
          backendLink.download = exportItem.label || ((agentName || '小尺') + '-标准尺码表-v1.xlsx');
          document.body.appendChild(backendLink);
          backendLink.click();
          backendLink.remove();
          NKS.toast('已请求后端 Excel 导出', 'success');
          return;
        }
        var excelBlob = new Blob([buildExcelHtml(outs3)], { type: 'application/vnd.ms-excel;charset=utf-8' });
        var excelUrl = URL.createObjectURL(excelBlob);
        var excelLink = document.createElement('a');
        excelLink.href = excelUrl;
        excelLink.download = (agentName || '小尺') + '-标准尺码表-v1.xls';
        document.body.appendChild(excelLink);
        excelLink.click();
        setTimeout(function () { URL.revokeObjectURL(excelUrl); excelLink.remove(); }, 200);
        NKS.toast('已导出标准尺码表 Excel', 'success');
        return;
      }
      var txt = outs3.map(function (o) {
        return '# [' + (o.platform || '') + '] ' + (o.title || '') + '\n\n' + (o.body || '') + '\n';
      }).join('\n---\n\n');
      var blob = new Blob([txt], { type: 'text/markdown;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a2 = document.createElement('a');
      a2.href = url; a2.download = (agentName || 'agent') + '-V1产物.md';
      document.body.appendChild(a2); a2.click();
      setTimeout(function () { URL.revokeObjectURL(url); a2.remove(); }, 200);
      NKS.toast('已下载 V1 产物 (.md)', 'success');
    }
    if (e.target.id === 'copyAllBtn') {
      var grid4 = document.getElementById('deliveryGrid');
      var outs4 = (grid4 && grid4._outs) || [];
      var txt2 = outs4.map(function (o) { return '[' + o.platform + '] ' + o.title + '\n' + o.body; }).join('\n\n');
      if (navigator.clipboard) navigator.clipboard.writeText(txt2);
      NKS.toast('已复制全部产物', 'success');
    }
  });

  if (runBtn) {
    runBtn.addEventListener('click', function () {
      if (runBtn.disabled) return;
      runBtn.disabled = true;
      runBtn.textContent = '执行中…';
      if (runHint) runHint.textContent = agentName + '正在调用企业记忆与红线，约 3 秒生成 V1';
      if (execStatus) { execStatus.textContent = '执行中'; execStatus.className = 'nks-tag primary'; }

      var runPromise = Promise.resolve(taskV1);
      if (window.NKS_LLM && window.NKS_LLM.executeTask) {
        runPromise = NKS_LLM.executeTask({
          company: company,
          agent: ab,
          input: taskV1.input_summary || (data.raw_demand && data.raw_demand.excerpt) || tasksAll[0] || '',
          memory_rules: memUsed,
          material_ids: state.materialIds || state.material_ids || [],
        });
      }

      var stepEls = execSteps ? execSteps.querySelectorAll('li') : [];
      var i = 0;
      function tick() {
        if (i < stepEls.length) {
          stepEls[i].classList.add('done');
          i++;
          setTimeout(tick, 700);
        } else {
          runPromise.then(function (result) {
            if (result && Array.isArray(result.outputs)) {
              taskV1 = Object.assign({}, taskV1, result);
              memUsed = taskV1.memory_used || memUsed;
            }
            renderDelivery();
            if (deliveryCard) deliveryCard.hidden = false;
            if (execStatus) { execStatus.textContent = '已完成'; execStatus.className = 'nks-tag success'; }
            runBtn.textContent = '已生成 V1';
            if (runHint) runHint.textContent = '产物已显示在下方，点击主按钮进入「反馈进化」';
            NKS.setState({
              currentTask: { name: tasksAll[0] || '当前任务', employee: agentName },
              taskV1: taskV1,
              activeAgentKey: agentKey,
            });
            var goFb = document.getElementById('goFeedbackBtn');
            if (goFb) goFb.href = '../feedback-evolution/index.html?agent=' + agentKey;
            deliveryCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }).catch(function () {
            renderDelivery();
            if (deliveryCard) deliveryCard.hidden = false;
            if (execStatus) { execStatus.textContent = '已完成'; execStatus.className = 'nks-tag success'; }
            runBtn.textContent = '已生成 V1';
            if (runHint) runHint.textContent = '后端暂未返回，已使用本地演示数据兜底';
            NKS.setState({ currentTask: { name: tasksAll[0] || '当前任务', employee: agentName }, taskV1: taskV1, activeAgentKey: agentKey });
            deliveryCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          });
        }
      }
      tick();
    });
  }
})();
