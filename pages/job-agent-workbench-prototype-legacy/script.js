NKS.mountTopbar({ user: '张小北' });
    NKS.mountTimeline(2);
    // 右侧上下文卡片用 DEMO_DATA 驱动
    const data = NKS.getCompanyData();
    document.getElementById('ctx-company').textContent = data.enterprise_identity.enterprise_name;
    document.getElementById('ctx-identity').textContent = data.enterprise_identity.industry;
    document.getElementById('ctx-memory').textContent = (data.libraries||[]).reduce((s,l)=>s+(l.items?l.items.length:0),0) + ' 条';
    // 当前 Agent 卡片（如有）
    const agent = (data.roster && data.roster[0]) || {};
    document.getElementById('agent-name').textContent = agent.name || '—';
    document.getElementById('agent-role').textContent = agent.title || '—';
    // Tab 切换
    document.querySelectorAll('.workspace-tabs .tab').forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll('.workspace-tabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('chat-tab').style.display = tab.dataset.tab === 'chat' ? '' : 'none';
        document.getElementById('feedback-tab').style.display = tab.dataset.tab === 'feedback' ? '' : 'none';
      };
    });
    // 预留：发送/反馈按钮事件
    document.getElementById('send-btn').onclick = () => alert('【预留】AI对话功能，后续接入 LLM');
    document.getElementById('iterate-btn').onclick = () => alert('【预留】反馈迭代功能，后续接入 LLM');
    document.getElementById('reset-feedback').onclick = () => document.getElementById('feedback-input').value = '';
