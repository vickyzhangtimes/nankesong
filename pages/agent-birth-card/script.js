NKS.mountTopbar({ user: '张小北', tag: 'AI 员工诞生' });
    NKS.mountSidebar(4);
    NKS.mountTimeline(3);

    /* ── 选头像 ── */
    function pickAvatar(dept, title) {
      const t = `${dept || ''}${title || ''}`;
      if (t.includes('市场') || t.includes('内容')) return '../../assets/avatars/mkt-cutout.png';
      if (t.includes('销售') || t.includes('客户')) return '../../assets/avatars/sales.png';
      if (t.includes('财务')) return '../../assets/avatars/finance.png';
      if (t.includes('HR') || t.includes('人力')) return '../../assets/avatars/hr.png';
      return '../../assets/avatars/ops.png';
    }

    /* ── 构建 role 数据：优先 DEMO_DATA，兜底兼容 roster 跳转 ── */
    function buildRole() {
      const data = NKS.getCompanyData();
      const company = NKS.getCompany();
      const state = NKS.getState();
      const fromRoster = new URLSearchParams(location.search).get('from') === 'roster';
      const emp = fromRoster && state.selectedEmployee ? state.selectedEmployee : null;
      const profile = !emp && state.agentProfile ? state.agentProfile : null;
      const agent = (!emp && state.currentAgent) ? state.currentAgent : (data.agent_birth_card || {});
      const libraries = data.libraries || [];
      const feedback = data.feedback || {};
      const feedbackRules = feedback.rules_added || [];
      const memUsed = (data.task_v1 && data.task_v1.memory_used) || libraries.map(l => l.name);
      const resources = [...new Set(libraries.map(l => l.name).concat(['当前任务资料']))].slice(0, 5);
      const learnings = feedbackRules.length
        ? feedbackRules.slice(0, 3).map((r, i) => i === 0 ? `已记住：${r}` : r)
        : ['已建立岗位边界', '已接入企业资料', '下次优先读取企业记忆'];

      return {
        name: emp ? emp.name : (profile && profile.name ? profile.name : (agent.name || '—')),
        displayName: emp
          ? `${emp.name} · ${emp.title}`
          : `${profile && profile.name ? profile.name : agent.name || '—'} · ${profile && profile.role ? profile.role : agent.title || '—'}`,
        code: (emp ? emp.id : agent.employee_id || 'AGT-000').replace(/^AGT-/, '').replace(/-/g, ' '),
        department: emp ? emp.department : (profile && profile.department ? profile.department : (agent.department || '—')),
        reportTo: profile && profile.reports_to ? profile.reports_to : (company === 'hongke' ? '张经理' : '商品部负责人'),
        hireDate: new Date().toISOString().slice(0, 10),
        memCount: profile && profile.memory_status ? profile.memory_status.read_count : (data.task_v1 ? (data.task_v1.memory_used_count || memUsed.length) : memUsed.length),
        status: profile && profile.status ? profile.status : '待确认',
        stage: profile && profile.employment_stage ? profile.employment_stage : '试用期',
        tasks: emp
          ? (function() {
              const t = `${emp.department}${emp.title}`;
              if (t.includes('内容') || t.includes('市场')) return ['写公众号初稿', '技术资料改写', '多平台内容适配', '内容复盘'];
              if (t.includes('销售') || t.includes('客户')) return ['整理客户摘要', '生成跟进清单', '写销售话术卡', '下一步动作'];
              if (t.includes('财务')) return ['费用归类汇总', '生成异常清单', '输出核对表', '标记人工复核项'];
              if (t.includes('尺码') || t.includes('商品')) return ['多格式数据识别', '表格合并清洗', '异常标记', '复核表生成'];
              return ['整理业务资料', '生成执行清单', '输出复核建议', '保存反馈规则'];
            })()
          : (agent.tasks_i_can_do || []),
        boundaries: profile && profile.work_boundaries
          ? profile.work_boundaries
          : emp
          ? (function() {
              const t = `${emp.department}${emp.title}`;
              if (t.includes('销售')) return ['不承诺成交结果', '不泄露客户隐私', '不绕过销售确认'];
              if (t.includes('财务')) return ['不自动审批付款', '不替代财务复核', '不改写原始凭证'];
              if (t.includes('尺码') || t.includes('商品')) return ['特体必须人工复核', '不直接系统提交', '原始数据不可覆盖'];
              return ['不自动发布', '不编造关键事实', '关键决策需人工确认'];
            })()
          : (agent.red_lines || []),
        resources: profile && profile.available_resources ? profile.available_resources : resources,
        learnings: profile && profile.learning_items ? profile.learning_items : learnings,
        color: company === 'hongke' ? '#12a795' : '#2f6df6',
        avatar: emp ? (emp.avatar || pickAvatar(emp.department, emp.title)) : pickAvatar(agent.department, agent.title),
        kpi: agent.kpi || '',
        persona: profile && profile.routing_decision && profile.routing_decision.action
          ? `已接入需求诊断：${profile.routing_decision.action}。`
          : `适合处理该岗位的日常重复任务，目标是：${agent.kpi || '提升效率，降低错误率'}。`,
      };
    }

    const role = buildRole();

    /* ── 设置 CSS 变量颜色 ── */
    document.documentElement.style.setProperty('--role-main', role.color);

    /* ── 渲染 ── */
    document.getElementById('pageTitle').textContent = `确认${role.department} AI 员工`;
    document.getElementById('nameText').textContent = role.displayName;
    document.getElementById('codeText').textContent = role.code;
    document.getElementById('statusText').textContent = role.status;
    document.getElementById('stageText').textContent = role.stage;
    document.getElementById('versionText').textContent = '资料已同步';
    document.getElementById('employeeImg').src = role.avatar;
    document.getElementById('departmentText').textContent = role.department;
    document.getElementById('reportsToText').textContent = role.reportTo;
    document.getElementById('hireDateText').textContent = role.hireDate;
    document.getElementById('memoryText').textContent = `已读取 ${role.memCount} 条`;
    document.getElementById('headlineText').innerHTML =
      `${role.name}<span class="accent">已准备好</span>加入${role.department}。`;
    document.getElementById('personaText').textContent = role.persona;
    document.getElementById('taskCountText').textContent = `现在可以交办 ${role.tasks.length} 类任务`;
    document.getElementById('bottomHint').textContent =
      `确认后，${role.name}会出现在员工仓库中，可以开始交办任务。`;

    function listHtml(items) {
      return items.map(i => `<li>${i}</li>`).join('');
    }
    document.getElementById('taskList').innerHTML = role.tasks.map(t =>
      `<li>${t}</li>`).join('');
    document.getElementById('boundaryList').innerHTML = listHtml(role.boundaries);
    document.getElementById('resourceList').innerHTML = listHtml(role.resources);
    document.getElementById('learningList').innerHTML = listHtml(role.learnings);

    /* ── 出生动画 ── */
    const steps = document.querySelectorAll('#birthSteps div');
    let stepIdx = 0;
    const overlay = document.getElementById('birthOverlay');
    const skipBirth = new URLSearchParams(location.search).get('birth') === '0';

    if (skipBirth) {
      overlay.remove();
      document.body.classList.remove('birthing');
      document.body.classList.add('birth-ready');
    } else {
      const timer = setInterval(() => {
        stepIdx++;
        if (stepIdx < steps.length) {
          steps[stepIdx].classList.add('active');
        } else {
          clearInterval(timer);
          setTimeout(() => {
            overlay.classList.add('hide');
            document.body.classList.remove('birthing');
            document.body.classList.add('birth-ready');
          }, 400);
        }
      }, 500);
    }
