NKS.mountTopbar({ user: "张小北" });
    NKS.mountSidebar(4);
    NKS.mountTimeline(4);

    const data = NKS.getCompanyData();
    const agent = data.agent_birth_card || {};
    const identity = data.enterprise_identity || {};
    const workbench = data.workbench_run || {};

    document.getElementById("employee-avatar").textContent = (agent.name || "AI").charAt(0);
    document.getElementById("employee-name").textContent = agent.name || "AI 员工";
    document.getElementById("employee-id").textContent = `ID: ${agent.agent_id || "待分配"}`;
    document.getElementById("employee-status").textContent = agent.status || "已就绪";
    document.getElementById("employee-role").textContent = agent.role || "岗位 Agent";
    document.getElementById("employee-department").textContent = agent.department || "AI 工作空间";

    const responsibilitiesList = document.getElementById("responsibilities-list");
    responsibilitiesList.innerHTML = (agent.responsibilities || []).map((item) => `<li>${NKS.escapeHtml(item)}</li>`).join("");

    document.getElementById("persona-line").textContent = agent.persona_line || "待配置";

    const memoryStatus = agent.memory_status || {};
    document.getElementById("memory-status").textContent = `已读取 ${memoryStatus.read_count || 0} 条企业记忆`;

    const memoryItems = document.getElementById("memory-items");
    memoryItems.innerHTML = (memoryStatus.read_items || []).map((item) => `
      <div class="memory-item">
        <svg class="memory-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
        <div class="memory-item-content">
          <div class="memory-item-label">${NKS.escapeHtml(item)}</div>
        </div>
      </div>
    `).join("");

    const contextList = document.getElementById("context-list");
    contextList.innerHTML = `
      <div class="ctx-row"><span class="label">企业</span><span class="value">${NKS.escapeHtml(data.display_name || "")}</span></div>
      <div class="ctx-row"><span class="label">工作空间</span><span class="value">${NKS.escapeHtml(data.workspace_name || "")}</span></div>
      <div class="ctx-row"><span class="label">行业</span><span class="value">${NKS.escapeHtml(identity.industry_judgement || identity.industry || "待补")}</span></div>
    `;

    document.getElementById("context-hint").textContent = "Agent 员工配置完成后，将进入执行与进化阶段";
    document.getElementById("bottom-hint").textContent = "确认 Agent 员工配置后，将进入执行工作台";

    document.getElementById("edit-employee").addEventListener("click", function () {
      NKS.toast("编辑功能演示中", "success");
    });

    document.getElementById("back-btn").addEventListener("click", function () {
      window.location.href = "../agent-birth-card/index.html";
    });

    document.getElementById("continue-btn").addEventListener("click", function () {
      const status = document.getElementById("page-status");
      status.textContent = "正在保存配置并进入执行与进化页...";
      try {
        NKS.setState({ currentAgent: { name: agent.name, role: agent.role } });
        status.textContent = "配置已保存";
        NKS.toast("Agent 员工配置完成", "success");
        window.setTimeout(function () {
          window.location.href = "../job-agent-workbench-prototype/index.html";
        }, 520);
      } catch (error) {
        status.textContent = "保存失败，请重试";
        NKS.toast(error.message || "保存失败，请重试", "error");
      }
    });
