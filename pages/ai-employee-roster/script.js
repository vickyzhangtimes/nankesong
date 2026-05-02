NKS.mountTopbar({ user: '张小北', tag: 'AI 员工仓库' });
    NKS.mountTimeline(4);

    const data = NKS.getCompanyData();

    // 右侧上下文卡片
    document.getElementById('ctxCompany').textContent = data.enterprise_identity.enterprise_name;
    document.getElementById('ctxIndustry').textContent = data.enterprise_identity.industry;
    const company = NKS.getCompany();
    const searchInput = document.getElementById("searchInput");
    const categoryTabs = document.getElementById("categoryTabs");
    const employeeGrid = document.getElementById("employeeGrid");
    const summaryStrip = document.getElementById("summaryStrip");
    const emptyState = document.getElementById("emptyState");
    const reuseBanner = document.getElementById("reuse-banner");
    const sortButtons = Array.from(document.querySelectorAll(".sort-switch button"));
    const routeState = NKS.getState();
    const reuseMode = new URLSearchParams(location.search).get("mode") === "reuse";
    const reuseTarget = (routeState.routeTargetAgent || "").trim();

    let activeCategory = "全部";
    let activeSort = "hot";

    function avatarFor(department, title) {
      const text = `${department || ""}${title || ""}`;
      if (text.includes("市场") || text.includes("内容")) return "../../assets/avatars/mkt-cutout.png";
      if (text.includes("销售") || text.includes("客户")) return "../../assets/avatars/sales.png";
      if (text.includes("财务")) return "../../assets/avatars/finance.png";
      if (text.includes("人力") || text.includes("HR")) return "../../assets/avatars/hr.png";
      return "../../assets/avatars/ops.png";
    }

    function statusType(status) {
      if (String(status).includes("正在") || String(status).includes("启用")) return "active";
      if (String(status).includes("试")) return "trial";
      return "pending";
    }

    function baseEmployees() {
      const roster = (data.roster || []).map((item, index) => ({
        id: item.id,
        name: item.name,
        title: item.title,
        department: item.department,
        status: item.status,
        tasksDone: item.tasks_done || 0,
        tags: [item.department, item.status.split("·")[0].trim()],
        desc: `${item.title}，负责${item.department}的重复流程和资料整理，可从企业库、部门库和历史反馈中读取上下文。`,
        avatar: avatarFor(item.department, item.title),
        createdAt: 10 - index,
        canUse: true
      }));

      const recommendations = company === "hongke" ? [
        {
          id: "AGT-MKT-009",
          name: "小察",
          title: "行业洞察报告员",
          department: "市场部",
          status: "待配置",
          tasksDone: 0,
          tags: ["行业洞察", "选题支持"],
          desc: "持续收集公开行业信息，输出技术趋势、竞品动态和内容选题建议。",
          avatar: "../../assets/avatars/mkt.png",
          createdAt: 2,
          canUse: false
        },
        {
          id: "AGT-SAL-012",
          name: "小跟",
          title: "客户线索整理专员",
          department: "销售部",
          status: "试运行",
          tasksDone: 5,
          tags: ["线索整理", "跟进提醒"],
          desc: "把活动报名、官网咨询和销售记录整理成客户摘要与下一步跟进清单。",
          avatar: "../../assets/avatars/sales.png",
          createdAt: 4,
          canUse: true
        },
        {
          id: "AGT-DOC-018",
          name: "小档",
          title: "文档生成专员",
          department: "运营部",
          status: "待配置",
          tasksDone: 0,
          tags: ["文档生成", "模板套用"],
          desc: "根据企业模板自动生成说明文档、会议纪要和复盘报告。",
          avatar: "../../assets/avatars/ops.png",
          createdAt: 1,
          canUse: false
        }
      ] : [
        {
          id: "AGT-PRD-006",
          name: "小码",
          title: "商品建档与编码助理",
          department: "商品部",
          status: "待配置",
          tasksDone: 0,
          tags: ["商品编码", "建档检查"],
          desc: "按校服编码规则自动生成建档表、查重验缺，并输出条码数据表。",
          avatar: "../../assets/avatars/ops.png",
          createdAt: 2,
          canUse: false
        },
        {
          id: "AGT-FIN-009",
          name: "小报",
          title: "费用归集助理",
          department: "财务部",
          status: "试运行",
          tasksDone: 7,
          tags: ["费用归类", "汇总表"],
          desc: "读取多格式费用数据，自动归类、汇总并标记异常项。",
          avatar: "../../assets/avatars/finance.png",
          createdAt: 3,
          canUse: true
        },
        {
          id: "AGT-DSN-003",
          name: "小图",
          title: "批量套图执行助理",
          department: "设计部",
          status: "待配置",
          tasksDone: 0,
          tags: ["图片处理", "批量归档"],
          desc: "按规则批量上传图片、生成模特图、下载并归档结果文件。",
          avatar: "../../assets/avatars/mkt.png",
          createdAt: 1,
          canUse: false
        }
      ];

      const existingKeys = new Set(roster.map((item) => `${item.department}-${item.title}`));
      return roster.concat(recommendations.filter((item) => !existingKeys.has(`${item.department}-${item.title}`)));
    }

    let employees = baseEmployees();
    const categories = ["全部"].concat(Array.from(new Set(employees.map((item) => item.department))));

    function renderSummary(list) {
      const active = list.filter((item) => statusType(item.status) === "active").length;
      const trial = list.filter((item) => statusType(item.status) === "trial").length;
      const pending = list.filter((item) => statusType(item.status) === "pending").length;
      const tasks = list.reduce((sum, item) => sum + item.tasksDone, 0);
      summaryStrip.innerHTML = [
        ["已启用", `${active} 位`],
        ["试运行", `${trial} 位`],
        ["待配置", `${pending} 位`],
        ["累计交办", `${tasks} 件`]
      ].map(([label, value]) => `
        <div class="summary-card">
          <b>${value}</b>
          <span>${label}</span>
        </div>
      `).join("");
    }

    function renderCategories() {
      categoryTabs.innerHTML = categories.map((category) => `
        <button class="${category === activeCategory ? "active" : ""}" data-category="${category}">${category}</button>
      `).join("");
      categoryTabs.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          activeCategory = button.dataset.category;
          render();
        });
      });
    }

    function filteredEmployees() {
      const keyword = searchInput.value.trim().toLowerCase();
      let list = employees.filter((item) => {
        const inCategory = activeCategory === "全部" || item.department === activeCategory;
        const haystack = `${item.name} ${item.title} ${item.department} ${item.tags.join(" ")} ${item.desc}`.toLowerCase();
        return inCategory && (!keyword || haystack.includes(keyword));
      });

      list = list.slice().sort((a, b) => {
        if (activeSort === "new") return b.createdAt - a.createdAt;
        return b.tasksDone - a.tasksDone;
      });
      return list;
    }

    function isTargetEmployee(item) {
      if (!reuseTarget) return false;
      const target = reuseTarget.replace(/\s/g, "");
      const probe = `${item.name}${item.title}${item.department}`.replace(/\s/g, "");
      return target.includes(item.title) || target.includes(item.name) || probe.includes(target);
    }

    function openEmployee(item) {
      var data = NKS.getCompanyData() || {};
      var sec = data.secondary_agent || {};
      var isSecondary = item && (item.id === sec.employee_id || item.name === sec.name);
      var isPrimary = item && data.agent_birth_card && (item.id === data.agent_birth_card.employee_id || item.name === data.agent_birth_card.name);
      NKS.setState({
        selectedEmployee: item,
        rosterEntryMode: true,
        rosterSelectedAt: new Date().toISOString(),
        activeAgentKey: isSecondary ? 'secondary' : 'primary',
      });
      // 已有闭环员工（primary / secondary）直接进工作台
      if (isPrimary || isSecondary) {
        location.href = '../job-agent-workbench-prototype/index.html?agent=' + (isSecondary ? 'secondary' : 'primary');
        return;
      }
      location.href = item.canUse
        ? "../agent-birth-card/index.html?birth=0&from=roster"
        : "../job-agent-workbench-prototype/index.html#diagnosis";
    }

    function renderGrid(list) {
      emptyState.style.display = list.length ? "none" : "block";
      employeeGrid.innerHTML = list.map((item, index) => `
        <article class="employee-card ${isTargetEmployee(item) ? "target" : ""}" data-index="${index}">
          <div class="employee-top">
            <div class="avatar">${item.avatar ? `<img src="${item.avatar}" alt="${item.name}">` : `<span>${item.name.slice(-1)}</span>`}</div>
            <div class="who">
              <h3 title="${item.title}">${item.title}</h3>
              <div class="tag-row">
                ${item.tags.slice(0, 2).map((tag) => `<span class="mini-tag">${tag}</span>`).join("")}
              </div>
            </div>
          </div>
          <p class="employee-desc">${item.desc}</p>
          <div class="employee-foot">
            <span><b>${item.name}</b> · ${item.tasksDone} 次交办</span>
            <span class="status ${statusType(item.status)}">${item.status}</span>
          </div>
        </article>
      `).join("");

      employeeGrid.querySelectorAll(".employee-card").forEach((card) => {
        card.addEventListener("click", () => openEmployee(list[Number(card.dataset.index)]));
      });
    }

    function render() {
      const list = filteredEmployees();
      if (reuseMode && reuseBanner) {
        reuseBanner.style.display = "block";
        reuseBanner.innerHTML = `<div style="font-size:14px;color:var(--ink);font-weight:600;">系统建议复用员工：${reuseTarget || "已上岗员工"}</div><div style="margin-top:6px;color:var(--muted);font-size:13px;">请点击对应员工确认复用，进入员工卡后可继续执行交付。</div>`;
      }
      renderCategories();
      renderSummary(list);
      renderGrid(list);
    }

    searchInput.addEventListener("input", render);
    sortButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeSort = button.dataset.sort;
        sortButtons.forEach((item) => item.classList.toggle("active", item === button));
        render();
      });
    });

    render();

    // 右侧汇总（渲染后计算）
    function updateCtxSidebar() {
      const all = baseEmployees();
      document.getElementById('ctxActive').textContent = all.filter(i => statusType(i.status) === 'active').length + ' 位';
      document.getElementById('ctxTrial').textContent = all.filter(i => statusType(i.status) === 'trial').length + ' 位';
      document.getElementById('ctxPending').textContent = all.filter(i => statusType(i.status) === 'pending').length + ' 位';
      document.getElementById('ctxTasks').textContent = all.reduce((s, i) => s + i.tasksDone, 0) + ' 件';
    }
    updateCtxSidebar();
