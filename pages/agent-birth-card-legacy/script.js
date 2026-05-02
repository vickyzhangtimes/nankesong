const roles = [
      {
        id: "agt-2026-003",
        code: "MKT 003",
        version: "card-v1.2",
        name: "小策",
        displayName: "小策 · ToB 内容增长 Agent",
        sideRole: "市场部内容增长专员",
        headline: "小策已准备好加入市场部。",
        role: "ToB 内容增长专员",
        department: "市场部",
        reports_to: "张经理",
        status: "待确认",
        employment_stage: "试用期",
        hire_date: "2026-05-02",
        color: "#12a795",
        avatar: "../../assets/avatars/mkt-cutout.png",
        persona_line: "适合处理市场部日常内容任务，",
        one_sentence_value: "默认遵守专业、克制的表达规则。",
        source_items: ["企业画像", "市场部资料", "历史公众号", "岗位说明", "历史反馈"],
        tasks_i_can_do: ["写公众号初稿", "技术资料改写", "多平台内容适配", "标题优化建议"],
        work_boundaries: ["不编造技术参数", "不使用夸张营销表达", "不未经确认自动发布", "不处理未授权敏感资料"],
        available_resources: ["企业库", "市场部库", "历史公众号", "产品资料", "标题风格规则"],
        learning_items: ["已记住：标题要更专业", "新增规则：避免夸张营销词", "下次优先：技术场景和业务价值"],
        memory_status: {
          read_count: 6,
          completion: 82,
          read_items: ["企业画像", "标题规则", "术语规则", "历史内容风格", "人工确认红线", "上次反馈"]
        }
      },
      {
        id: "agt-2026-012",
        code: "SAL 012",
        version: "card-v1.0",
        name: "小跟",
        displayName: "小跟 · 客户线索整理 Agent",
        sideRole: "销售部线索整理专员",
        headline: "小跟已准备好加入销售部。",
        role: "客户线索整理专员",
        department: "销售部",
        reports_to: "李主管",
        status: "待确认",
        employment_stage: "试用期",
        hire_date: "2026-05-02",
        color: "#2f6df6",
        avatar: "../../assets/avatars/sales.png",
        persona_line: "适合整理销售线索和客户跟进材料，",
        one_sentence_value: "默认输出清晰、可执行的下一步动作。",
        source_items: ["企业画像", "销售流程", "CRM 摘要", "客户授权资料", "历史话术"],
        tasks_i_can_do: ["整理客户摘要", "生成跟进清单", "写销售话术卡", "提醒下一步动作"],
        work_boundaries: ["不承诺成交结果", "不泄露客户隐私", "不绕过销售确认", "不处理未授权客户资料"],
        available_resources: ["企业库", "销售部库", "CRM 摘要", "历史跟进记录", "客户授权资料"],
        learning_items: ["已记住：跟进建议要更短", "新增规则：一句话行动建议", "下次优先：先给销售下一步动作"],
        memory_status: {
          read_count: 5,
          completion: 76,
          read_items: ["企业画像", "销售流程", "客户分层规则", "历史话术", "隐私红线"]
        }
      },
      {
        id: "agt-2026-021",
        code: "OPS 021",
        version: "card-v1.0",
        name: "小规",
        displayName: "小规 · 渠道合规风控 Agent",
        sideRole: "运营部渠道合规风控专员",
        headline: "小规已准备好加入运营部。",
        role: "渠道合规风控专员",
        department: "运营部",
        reports_to: "王总监",
        status: "待复核",
        employment_stage: "观察期",
        hire_date: "2026-05-02",
        color: "#c69345",
        avatar: "../../assets/avatars/ops.png",
        persona_line: "适合初筛渠道异常和合规风险，",
        one_sentence_value: "默认保留判断依据，方便人工复核。",
        source_items: ["企业画像", "运营流程", "合规红线", "渠道数据", "异常案例库"],
        tasks_i_can_do: ["生成风险报告", "识别异常渠道", "输出复核建议", "整理异常清单"],
        work_boundaries: ["不替代最终合规决策", "不绕过人工审批", "不隐藏异常数据", "不处理未授权敏感资料"],
        available_resources: ["企业库", "运营部库", "合规规则", "渠道数据", "异常案例库"],
        learning_items: ["已记住：风险等级要更明确", "新增规则：等级、证据、动作三段式", "下次优先：先输出人工复核优先级"],
        memory_status: {
          read_count: 7,
          completion: 88,
          read_items: ["企业画像", "运营流程", "合规红线", "历史异常", "渠道规则", "审批规则", "复核反馈"]
        }
      }
    ];

    function compactEmployeeId(id) {
      return String(id || "AGT-000")
        .replace(/^AGT-/, "")
        .replace(/-/g, " ");
    }

    function pickAvatar(agent) {
      const text = `${agent.department || ""}${agent.title || ""}`;
      if (text.includes("市场") || text.includes("内容")) return "../../assets/avatars/mkt-cutout.png";
      if (text.includes("销售") || text.includes("客户")) return "../../assets/avatars/sales.png";
      if (text.includes("财务")) return "../../assets/avatars/finance.png";
      if (text.includes("HR") || text.includes("人力")) return "../../assets/avatars/hr.png";
      return "../../assets/avatars/ops.png";
    }

    function tasksForEmployee(employee) {
      const text = `${employee.department || ""}${employee.title || ""}`;
      if (text.includes("内容") || text.includes("市场")) {
        return ["写公众号初稿", "技术资料改写", "多平台内容适配", "内容复盘"];
      }
      if (text.includes("销售") || text.includes("客户")) {
        return ["整理客户摘要", "生成跟进清单", "写销售话术卡", "提醒下一步动作"];
      }
      if (text.includes("财务")) {
        return ["费用归类汇总", "生成异常清单", "输出核对表", "标记人工复核项"];
      }
      if (text.includes("尺码") || text.includes("商品")) {
        return ["多格式数据识别", "表格合并清洗", "异常标记", "复核表生成"];
      }
      return ["整理业务资料", "生成执行清单", "输出复核建议", "保存反馈规则"];
    }

    function boundariesForEmployee(employee) {
      const text = `${employee.department || ""}${employee.title || ""}`;
      if (text.includes("销售") || text.includes("客户")) {
        return ["不承诺成交结果", "不泄露客户隐私", "不绕过销售确认", "不处理未授权客户资料"];
      }
      if (text.includes("财务")) {
        return ["不自动审批付款", "不替代财务复核", "不改写原始凭证", "不处理未授权账目"];
      }
      if (text.includes("尺码") || text.includes("商品")) {
        return ["特体必须人工复核", "不直接系统提交", "原始数据不可覆盖", "异常项必须留痕"];
      }
      return ["不自动发布", "不编造关键事实", "不处理未授权敏感资料", "关键决策需人工确认"];
    }

    function makeRoleFromSelectedEmployee() {
      if (!window.NKS || !window.NKS.getState) return null;
      const params = new URLSearchParams(location.search);
      if (params.get("from") !== "roster") return null;

      const state = window.NKS.getState();
      const employee = state.selectedEmployee;
      if (!employee) return null;

      const data = window.NKS.getCompanyData ? window.NKS.getCompanyData() : null;
      const libraries = data && Array.isArray(data.libraries) ? data.libraries : [];
      const tasks = tasksForEmployee(employee);
      const boundaries = boundariesForEmployee(employee);
      const readItems = libraries.map((item) => item.name).concat(["最近任务记录", "历史反馈"]).slice(0, 6);
      const resources = Array.from(new Set(libraries.map((item) => item.name).concat(["当前任务资料"]))).slice(0, 6);

      return {
        id: employee.id || "AGT-000",
        code: compactEmployeeId(employee.id),
        version: employee.status || "已启用",
        name: employee.name || "小员",
        displayName: `${employee.name || "小员"} · ${employee.title || "AI 员工"}`,
        sideRole: `${employee.department || "当前部门"} · ${employee.title || "AI 员工"}`,
        headline: `${employee.name || "这名员工"}已准备好继续工作。`,
        role: employee.title || "AI 员工",
        department: employee.department || "当前部门",
        reports_to: employee.department === "销售部" ? "销售负责人" : employee.department === "财务部" ? "财务负责人" : "部门负责人",
        status: employee.status || "已启用",
        employment_stage: employee.canUse === false ? "待配置" : "可使用",
        hire_date: new Date().toISOString().slice(0, 10),
        color: employee.department === "销售部" ? "#2f6df6" : employee.department === "财务部" ? "#12a795" : "#12a795",
        avatar: employee.avatar || pickAvatar(employee),
        persona_line: employee.desc || "适合处理该岗位的日常重复任务，",
        one_sentence_value: "会读取企业库、部门库和历史反馈后再开始执行。",
        source_items: ["员工仓库", ...readItems].slice(0, 6),
        tasks_i_can_do: tasks,
        work_boundaries: boundaries,
        available_resources: resources,
        learning_items: ["已读取历史交办记录", "已接入部门资料", "下次优先复用已确认规则"],
        memory_status: {
          read_count: Math.max(4, readItems.length),
          completion: employee.canUse === false ? 58 : 86,
          read_items: readItems,
        },
      };
    }

    function makeRoleFromDemoData() {
      if (!window.NKS || !window.NKS.getCompanyData) return null;
      const data = window.NKS.getCompanyData();
      if (!data || !data.agent_birth_card) return null;

      const agent = data.agent_birth_card;
      const company = window.NKS.getCompany ? window.NKS.getCompany() : "hongke";
      const libraries = Array.isArray(data.libraries) ? data.libraries : [];
      const feedbackRules = data.feedback && Array.isArray(data.feedback.rules_added)
        ? data.feedback.rules_added
        : [];
      const learningItems = feedbackRules.length
        ? feedbackRules.slice(0, 3).map((rule, index) => index === 0 ? `已记住：${rule}` : rule)
        : ["已建立岗位边界", "已接入企业资料", "下次优先读取企业记忆"];
      const readItems = (data.task_v1 && data.task_v1.memory_used)
        || libraries.map((item) => item.name)
        || ["企业画像"];
      const sourceItems = [
        "企业画像",
        ...libraries.map((item) => item.name),
        "七层岗位骨架",
      ].slice(0, 6);

      return {
        id: agent.employee_id || "AGT-000",
        code: compactEmployeeId(agent.employee_id),
        version: "已生成",
        name: agent.name,
        displayName: `${agent.name} · ${agent.title}`,
        sideRole: `${agent.department} · ${agent.title}`,
        headline: `${agent.name}已准备好加入${agent.department}。`,
        role: agent.title,
        department: agent.department,
        reports_to: company === "hongke" ? "张经理" : "商品部负责人",
        status: "待确认",
        employment_stage: "试用期",
        hire_date: new Date().toISOString().slice(0, 10),
        color: company === "hongke" ? "#12a795" : "#2f6df6",
        avatar: pickAvatar(agent),
        persona_line: "适合处理该岗位的日常重复任务，",
        one_sentence_value: agent.kpi ? `目标是：${agent.kpi}。` : "默认遵守企业资料和岗位边界。",
        source_items: sourceItems,
        tasks_i_can_do: agent.tasks_i_can_do || [],
        work_boundaries: agent.red_lines || [],
        available_resources: Array.from(new Set(libraries.map((item) => item.name).concat(["当前任务资料"]))).slice(0, 6),
        learning_items: learningItems,
        memory_status: {
          read_count: data.task_v1 && data.task_v1.memory_used_count
            ? data.task_v1.memory_used_count
            : Math.max(3, readItems.length),
          completion: company === "hongke" ? 82 : 78,
          read_items: readItems,
        },
      };
    }

    const generatedRole = makeRoleFromSelectedEmployee() || makeRoleFromDemoData();
    if (generatedRole) {
      roles.splice(0, roles.length, generatedRole);
    }

    const refs = {
      roleTabs: document.getElementById("roleTabs"),
      employeeCard: document.getElementById("employeeCard"),
      sideRole: document.getElementById("sideRole"),
      sideVersion: document.getElementById("sideVersion"),
      codeText: document.getElementById("codeText"),
      nameText: document.getElementById("nameText"),
      statusText: document.getElementById("statusText"),
      stageText: document.getElementById("stageText"),
      versionText: document.getElementById("versionText"),
      employeeImg: document.getElementById("employeeImg"),
      departmentText: document.getElementById("departmentText"),
      reportsToText: document.getElementById("reportsToText"),
      hireDateText: document.getElementById("hireDateText"),
      memoryText: document.getElementById("memoryText"),
      headlineText: document.getElementById("headlineText"),
      personaText: document.getElementById("personaText"),
      sourceText: document.getElementById("sourceText"),
      taskList: document.getElementById("taskList"),
      boundaryList: document.getElementById("boundaryList"),
      resourceList: document.getElementById("resourceList"),
      learningList: document.getElementById("learningList"),
      memoryDonut: document.getElementById("memoryDonut"),
      memoryStatus: document.getElementById("memoryStatus"),
      versionStatus: document.getElementById("versionStatus"),
      workspaceStatus: document.getElementById("workspaceStatus"),
      chipRow: document.getElementById("chipRow"),
      pageTitle: document.getElementById("pageTitle"),
      departmentPill: document.getElementById("departmentPill"),
      bottomHint: document.getElementById("bottomHint"),
      resetBtn: document.getElementById("resetBtn"),
      upgradeBtn: document.getElementById("upgradeBtn"),
      primaryStartBtn: document.getElementById("primaryStartBtn"),
      switchCompanyBtn: document.getElementById("switchCompanyBtn"),
      birthOverlay: document.getElementById("birthOverlay"),
      birthSteps: document.getElementById("birthSteps")
    };

    const readinessRefs = [
      [document.getElementById("metric1"), document.getElementById("metric1Label")],
      [document.getElementById("metric2"), document.getElementById("metric2Label")],
      [document.getElementById("metric3"), document.getElementById("metric3Label")],
      [document.getElementById("metric4"), document.getElementById("metric4Label")]
    ];

    const routeParams = new URLSearchParams(location.search);
    const isFromRoster = routeParams.get("from") === "roster";
    let selected = 0;
    let upgraded = false;

    function list(items) {
      return items.map((item) => `<li>${item}</li>`).join("");
    }

    function buildProfile(role) {
      const profile = {
        agent_id: role.id,
        version: role.version,
        name: role.name,
        role: role.role,
        department: role.department,
        reports_to: role.reports_to,
        status: role.status,
        employment_stage: role.employment_stage,
        source_items: role.source_items,
        tasks_i_can_do: role.tasks_i_can_do,
        work_boundaries: role.work_boundaries,
        available_resources: role.available_resources,
        learning_items: role.learning_items,
        memory_status: role.memory_status,
        latest_update: role.learning_items[0]
      };

      if (!upgraded) return profile;

      return {
        ...profile,
        version: "card-v1.3",
        work_boundaries: [...profile.work_boundaries, "标题避免夸张营销词"],
        learning_items: ["已记住：标题要更专业", "新增规则：避免夸张营销词", "下次优先：技术场景和业务价值"],
        memory_status: {
          ...profile.memory_status,
          read_count: profile.memory_status.read_count + 1,
          completion: Math.min(96, profile.memory_status.completion + 6),
          read_items: [...profile.memory_status.read_items, "标题专业化规则"]
        },
        latest_update: "标题专业化规则已写入学习回路"
      };
    }

    function renderTabs() {
      if (roles.length <= 1) {
        refs.roleTabs.innerHTML = "";
        return;
      }

      refs.roleTabs.innerHTML = roles.map((role, index) => `
        <button class="role-tab ${index === selected ? "active" : ""}" style="--role-main:${role.color}" data-index="${index}">
          ${role.name} · ${role.code}
        </button>
      `).join("");

      refs.roleTabs.querySelectorAll(".role-tab").forEach((button) => {
        button.addEventListener("click", () => {
          selected = Number(button.dataset.index);
          render();
        });
      });
    }

    function renderCard() {
      const role = roles[selected];
      const profile = buildProfile(role);
      refs.employeeCard.style.setProperty("--role-main", role.color);
      document.documentElement.style.setProperty("--role-main", role.color);
      refs.pageTitle.textContent = `确认${profile.department} AI 员工`;
      refs.departmentPill.textContent = profile.department;
      refs.bottomHint.textContent = `确认后，这名 AI 员工会出现在${profile.department}工作台中。`;
      refs.resetBtn.textContent = isFromRoster ? "返回员工仓库" : "返回修改";
      refs.sideRole.textContent = role.sideRole;
      refs.sideVersion.textContent = `已接入 ${profile.source_items.slice(0, 3).join("、")}。`;
      refs.codeText.textContent = role.code;
      refs.nameText.textContent = role.displayName;
      refs.statusText.textContent = profile.status;
      refs.stageText.textContent = profile.employment_stage;
      refs.versionText.textContent = upgraded ? "已根据反馈更新" : "资料已同步";
      refs.employeeImg.src = role.avatar;
      refs.departmentText.textContent = profile.department;
      refs.reportsToText.textContent = profile.reports_to;
      refs.hireDateText.textContent = role.hire_date;
      refs.memoryText.textContent = `已读取 ${profile.memory_status.read_count} 条`;
      refs.headlineText.innerHTML = role.headline.replace("已准备好", "<span>已准备好</span>");
      refs.personaText.textContent = `${role.persona_line}${role.one_sentence_value}`;
      refs.sourceText.textContent = profile.source_items.join(" · ");

      const readiness = [
        [`${profile.tasks_i_can_do.length} 类`, "可交办任务"],
        [`${profile.memory_status.read_count} 条`, "已读取资料"],
        [`${profile.available_resources.length} 类`, "可调用资料"],
        [`${profile.work_boundaries.length} 条`, "已启用边界"]
      ];

      readiness.forEach(([value, label], index) => {
        readinessRefs[index][0].textContent = value;
        readinessRefs[index][1].textContent = label;
      });

      refs.taskList.innerHTML = list(profile.tasks_i_can_do);
      refs.boundaryList.innerHTML = list(profile.work_boundaries.slice(0, upgraded ? 5 : 4));
      refs.resourceList.innerHTML = list(profile.available_resources);
      refs.learningList.innerHTML = list(profile.learning_items);
      refs.memoryDonut.textContent = `${profile.memory_status.read_count}条`;
      refs.memoryDonut.style.setProperty("--value", profile.memory_status.completion);
      refs.memoryStatus.innerHTML = `${profile.memory_status.read_items.slice(0, 3).join("、")} 已接入<br>共读取 ${profile.memory_status.read_count} 条资料`;
      refs.versionStatus.textContent = upgraded ? "已根据你的建议更新标题表达规则。" : "已记住：标题要更专业，避免夸张营销表达。";
      refs.workspaceStatus.textContent = `该 AI 员工已准备好接收${profile.department}任务。`;
      refs.chipRow.innerHTML = profile.tasks_i_can_do.slice(0, 4).map((item) => `<span class="chip">${item}</span>`).join("");
    }

    function render() {
      renderTabs();
      renderCard();
    }

    refs.upgradeBtn.addEventListener("click", () => {
      upgraded = true;
      renderCard();
    });

    refs.resetBtn.addEventListener("click", () => {
      location.href = isFromRoster ? "../ai-employee-roster/index.html" : "../job-agent-workbench-prototype/index.html#diagnosis";
    });

    refs.primaryStartBtn.addEventListener("click", () => {
      const role = roles[selected];
      const profile = buildProfile(role);
      const data = window.NKS && window.NKS.getCompanyData ? window.NKS.getCompanyData() : null;
      if (window.NKS && window.NKS.setState) {
        window.NKS.setState({
          currentAgent: data && data.agent_birth_card ? data.agent_birth_card : profile,
          agentProfile: profile,
          sevenSkeleton: data ? data.seven_skeleton : [],
          routingDecision: data ? data.routing_decision : null,
          birthConfirmed: true,
          birthConfirmedAt: new Date().toISOString()
        });
      }
      location.href = "../job-agent-workbench-prototype/index.html#workspace";
    });

    refs.switchCompanyBtn.addEventListener("click", () => {
      if (!window.NKS || !window.NKS.getCompany || !window.NKS.switchCompany) return;
      window.NKS.switchCompany(window.NKS.getCompany() === "hongke" ? "longxia" : "hongke");
    });

    function playBirthAnimation() {
      const params = new URLSearchParams(location.search);
      if (params.get("birth") === "0") {
        document.body.classList.remove("birthing");
        if (refs.birthOverlay) refs.birthOverlay.remove();
        return;
      }

      const steps = refs.birthSteps ? Array.from(refs.birthSteps.children) : [];
      steps.forEach((step, index) => {
        setTimeout(() => {
          steps.forEach((item, itemIndex) => {
            item.classList.toggle("active", itemIndex <= index);
          });
        }, 420 * index);
      });

      setTimeout(() => {
        document.body.classList.remove("birthing");
        document.body.classList.add("birth-ready");
        if (refs.birthOverlay) refs.birthOverlay.classList.add("hide");
      }, 1900);

      setTimeout(() => {
        if (refs.birthOverlay) refs.birthOverlay.remove();
      }, 2350);
    }

    render();
    playBirthAnimation();
