(function () {
  var TIMEOUT_MS = 5000;
  var MODEL = "gpt-5";

  var SYS_DIAGNOSE =
    "你是一个企业岗位 Agent 治理顾问。\n\n你的任务：基于企业身份证 + 已有 AI 员工编制 + 用户原始混乱需求，判断这个需求应该：\n  (A) reuse_agent       —— 复用现有岗位 Agent\n  (B) add_workflow      —— 在现有岗位 Agent 下新增 workflow\n  (C) new_role_agent    —— 新建一个独立的岗位 Agent\n\n判断原则（按优先级）：\n1. 若需求属于现有 Agent 的岗位职责范围内的同类任务 → reuse_agent\n2. 若需求是现有岗位下的新流程 / 新场景 / 同部门同目标 → add_workflow\n3. 仅当需求构成独立岗位职责（新部门 / 新目标 / 新责任边界）时 → new_role_agent\n\n然后基于判断结果，输出：\n- 4 个核心业务指标（必须可量化、可对比、有 baseline 与 target，单位明确）\n- 七层岗位骨架：岗位边界 / 工作顺序 / 质量标准 / 质量红线 / 交付契约 / 工具目录 / 学习回路\n\n硬要求：\n- 输出严格 JSON，不要 markdown，不要解释，不要前后缀文字。\n- 所有字段基于输入资料，不要编造数字。无法判断时填 \"待补\"。\n- 中文输出。\n- seven_skeleton 必须 7 项，idx 从 1 到 7，title 顺序固定。\n- diagnosis_metrics 必须 4 项。\n- 红线必须包含\"不自动发布 / 关键决策需人工\"类条款。";

  var SYS_EXECUTE_PREFIX =
    "你是一个已上岗的企业岗位 Agent，按以下身份工作：\n";
  var SYS_EXECUTE_SUFFIX =
    "\n\n你的任务：基于企业身份证 + 用户输入的真实素材，输出岗位交付物。\n\n如果用户提供了反馈（feedback），你必须：\n1. 把反馈翻译成 1-3 条可复用规则（feedback_rules_added），写入企业记忆。\n2. 在本次输出中明显应用这些规则，使结果与上一版有可见差异。\n3. 在每个 output 上标注 diff 字段，列出\"和上一版相比改了哪里\"。\n\n硬要求：\n- 严格遵守 agent.red_lines（不能违反）。\n- 输出严格 JSON，不要 markdown，不要解释。\n- outputs 数量 = agent.tasks_i_can_do 范围内最多 4 项。\n- 每个 output 的 body 不超过 300 字（demo 用，给评委扫读）。\n- 中文输出。";

  function buildDiagnoseUser(p) {
    return (
      "【企业身份证】\n" +
      JSON.stringify(p.enterprise_identity != null ? p.enterprise_identity : {}, null, 2) +
      "\n\n【企业已有 AI 员工编制】\n" +
      JSON.stringify(p.existing_agents != null ? p.existing_agents : [], null, 2) +
      "\n\n【本次原始需求（来自会议记录 / 流程梳理表 / 邮件等混乱输入）】\n" +
      String(p.raw_demand || "") +
      "\n\n请按系统规则输出 JSON。"
    );
  }

  function buildExecuteUser(p) {
    return (
      "【企业身份证】\n" +
      JSON.stringify(p.enterprise_identity != null ? p.enterprise_identity : {}, null, 2) +
      "\n\n【本次输入素材】\n" +
      String(p.input_text || "") +
      "\n\n【企业记忆规则（之前累积，本次必须遵守）】\n" +
      JSON.stringify(p.memory_rules != null ? p.memory_rules : [], null, 2) +
      "\n\n【本次用户反馈（如有）】\n" +
      String(p.feedback_text_or_NONE != null ? p.feedback_text_or_NONE : "NONE") +
      "\n\n请按系统规则输出 JSON。"
    );
  }

  function withTimeout(promise, ms) {
    return new Promise(function (resolve, reject) {
      var t = setTimeout(function () {
        reject(new Error("TIMEOUT"));
      }, ms);
      promise.then(
        function (v) {
          clearTimeout(t);
          resolve(v);
        },
        function (e) {
          clearTimeout(t);
          reject(e);
        }
      );
    });
  }

  function getApiKey() {
    var c = window.NKS_LLM_CONFIG || {};
    return (c.apiKey && String(c.apiKey)) || window.NKS_API_KEY || "";
  }

  function getBaseURL() {
    var c = window.NKS_LLM_CONFIG || {};
    var b = c.baseURL || "https://api.openai-next.com/v1";
    return String(b).replace(/\/$/, "");
  }

  function getBackendBaseURL() {
    var c = window.NKS_LLM_CONFIG || {};
    var b = c.backendBaseURL || window.NKS_API_BASE_URL || "http://127.0.0.1:8000/api/v1";
    return String(b).replace(/\/$/, "");
  }

  function shouldUseBackend() {
    var c = window.NKS_LLM_CONFIG || {};
    return c.useBackend !== false;
  }

  function allowBrowserModelDirect() {
    var c = window.NKS_LLM_CONFIG || {};
    return c.allowBrowserModelDirect === true;
  }

  function unwrapApiPayload(payload) {
    if (payload && typeof payload.code === "number" && Object.prototype.hasOwnProperty.call(payload, "data")) {
      return payload.data;
    }
    return payload;
  }

  function collectAgentIds(list) {
    if (!Array.isArray(list)) return [];
    return list
      .map(function (item) {
        return item && (item.agent_id || item.employee_id || item.id);
      })
      .filter(Boolean);
  }

  function postBackendJson(path, body) {
    return fetch(getBackendBaseURL() + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    }).then(function (r) {
      return r.text().then(function (text) {
        var payload = text ? JSON.parse(text) : {};
        if (!r.ok) throw new Error("BACKEND_HTTP_" + r.status);
        return unwrapApiPayload(payload);
      });
    });
  }

  function buildDemandRecognitionPayload(args) {
    args = args || {};
    var company = args.company || (window.NKS && NKS.getCompany ? NKS.getCompany() : "longxia");
    return {
      space_id: company,
      raw_text: args.raw_demand || "",
      material_ids: Array.isArray(args.material_ids) ? args.material_ids : [],
      existing_agent_ids: collectAgentIds(args.existing_agents),
      mode: "route_and_generate_skeleton",
      enterprise_identity: args.enterprise_identity || {},
      existing_agents: Array.isArray(args.existing_agents) ? args.existing_agents : [],
    };
  }

  function buildAgentRunPayload(args) {
    args = args || {};
    var company = args.company || (window.NKS && NKS.getCompany ? NKS.getCompany() : "longxia");
    var agent = args.agent || {};
    var agentId = agent.agent_id || agent.employee_id || agent.id || "AGT-PRD-001";
    return {
      space_id: company,
      agent_id: agentId,
      task_type: args.task_type || (company === "longxia" || company === "nankesong" ? "size_table_cleanup" : "content_delivery"),
      material_ids: Array.isArray(args.material_ids) ? args.material_ids : [],
      run_mode: args.run_mode || "review_required",
      input_text: args.input || "",
      feedback: args.feedback || "",
      agent: agent,
      enterprise_identity: args.enterprise_identity || {},
      memory_rules: Array.isArray(args.memory_rules) ? args.memory_rules : [],
    };
  }

  function responsesOutputText(json) {
    if (json && typeof json.output_text === "string" && json.output_text) {
      return json.output_text;
    }
    var out = json && json.output;
    if (!Array.isArray(out)) return "";
    var s = "";
    for (var i = 0; i < out.length; i++) {
      var item = out[i];
      if (item && item.type === "message" && Array.isArray(item.content)) {
        for (var j = 0; j < item.content.length; j++) {
          var c = item.content[j];
          if (!c) continue;
          if ((c.type === "output_text" || c.type === "text") && typeof c.text === "string") {
            s += c.text;
          } else if (c.type === "refusal" && typeof c.refusal === "string") {
            s += c.refusal;
          }
        }
      }
    }
    return s;
  }

  function parseJsonFromResponseText(text) {
    var t = String(text || "").trim();
    if (!t) throw new Error("EMPTY_OUTPUT");
    return JSON.parse(t);
  }

  function postResponses(body) {
    if (!allowBrowserModelDirect()) throw new Error("BROWSER_MODEL_DIRECT_DISABLED");
    var key = getApiKey();
    if (!key) throw new Error("NO_API_KEY");
    var url = getBaseURL() + "/responses";
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + key,
      },
      body: JSON.stringify(body),
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (tx) {
        throw new Error("HTTP_" + r.status);
      });
      return r.json();
    });
  }

  function fallbackData(company) {
    var d = window.DEMO_DATA && window.DEMO_DATA[company];
    return d || {};
  }

  function validDiagnose(obj) {
    return (
      obj &&
      obj.routing_decision &&
      Array.isArray(obj.seven_skeleton) &&
      obj.seven_skeleton.length === 7 &&
      Array.isArray(obj.diagnosis_metrics)
    );
  }

  function validExecute(obj) {
    return obj && Array.isArray(obj.outputs);
  }

  function fallbackDiagnose(company) {
    var data = fallbackData(company);
    return {
      routing_decision: data.routing_decision,
      diagnosis_metrics: data.diagnosis_metrics,
      seven_skeleton: data.seven_skeleton,
    };
  }

  function fallbackExecute(company, hasFeedback) {
    var data = fallbackData(company);
    // 兼容两种 schema：data.task.{v1,v2} 与 data.{task_v1,task_v2}（本仓库 mock-data 用后者）
    var task = data.task || {};
    var block = hasFeedback
      ? (task.v2 || task.v2_outputs || data.task_v2)
      : (task.v1 || task.v1_outputs || data.task_v1);
    if (block && typeof block === "object" && Array.isArray(block.outputs)) {
      return {
        outputs: block.outputs,
        memory_used_count: block.memory_used_count != null ? block.memory_used_count : 0,
        memory_used: Array.isArray(block.memory_used) ? block.memory_used : [],
        feedback_rules_added: Array.isArray(block.feedback_rules_added)
          ? block.feedback_rules_added
          : [],
      };
    }
    return {
      outputs: [],
      memory_used_count: 0,
      memory_used: [],
      feedback_rules_added: [],
    };
  }

  async function callModelJson(system, user) {
    var body = {
      model: MODEL,
      max_output_tokens: 4096,
      text: { format: { type: "json_object" } },
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    };
    var raw = await withTimeout(postResponses(body), TIMEOUT_MS);
    var text = responsesOutputText(raw);
    return parseJsonFromResponseText(text);
  }

  async function diagnose(args) {
    var company = args && args.company;
    var data = fallbackData(company);
    if (shouldUseBackend()) {
      try {
        var backendObj = await withTimeout(
          postBackendJson("/demand-recognitions", buildDemandRecognitionPayload(args)),
          TIMEOUT_MS
        );
        if (!validDiagnose(backendObj)) throw new Error("BACKEND_SCHEMA_INVALID");
        return backendObj;
      } catch (e) {
        console.warn("[Backend] demand-recognitions fallback:", e && e.message ? e.message : e);
      }
    }
    try {
      var user = buildDiagnoseUser({
        enterprise_identity: args.enterprise_identity,
        existing_agents: args.existing_agents,
        raw_demand: args.raw_demand,
      });
      var obj = await callModelJson(SYS_DIAGNOSE, user);
      if (!validDiagnose(obj)) throw new Error("SCHEMA_INVALID");
      return obj;
    } catch (e) {
      console.warn("[LLM] diagnose fallback:", e && e.message ? e.message : e);
      return fallbackDiagnose(company);
    }
  }

  async function executeTask(args) {
    var company = args && args.company;
    var hasFeedback = !!(args && args.feedback && String(args.feedback).trim());
    if (shouldUseBackend()) {
      try {
        var backendObj = await withTimeout(
          postBackendJson("/agent-runs", buildAgentRunPayload(args)),
          TIMEOUT_MS
        );
        if (!validExecute(backendObj)) throw new Error("BACKEND_SCHEMA_INVALID");
        if (!Array.isArray(backendObj.memory_used)) backendObj.memory_used = [];
        if (!Array.isArray(backendObj.feedback_rules_added)) backendObj.feedback_rules_added = [];
        if (backendObj.memory_used_count == null) backendObj.memory_used_count = backendObj.memory_used.length;
        return backendObj;
      } catch (e) {
        console.warn("[Backend] agent-runs fallback:", e && e.message ? e.message : e);
      }
    }
    try {
      var agent = args.agent || {};
      var sys =
        SYS_EXECUTE_PREFIX +
        JSON.stringify(agent, null, 2) +
        SYS_EXECUTE_SUFFIX;
      var companyData =
        typeof window.NKS !== "undefined" && window.NKS.getCompanyData
          ? window.NKS.getCompanyData()
          : fallbackData(company);
      var ent =
        args.enterprise_identity != null
          ? args.enterprise_identity
          : companyData.enterprise_identity || {};
      var user = buildExecuteUser({
        enterprise_identity: ent,
        input_text: args.input,
        memory_rules: args.memory_rules,
        feedback_text_or_NONE: hasFeedback ? String(args.feedback) : "NONE",
      });
      var obj = await callModelJson(sys, user);
      if (!validExecute(obj)) throw new Error("SCHEMA_INVALID");
      if (!Array.isArray(obj.memory_used)) obj.memory_used = [];
      if (!Array.isArray(obj.feedback_rules_added)) obj.feedback_rules_added = [];
      if (obj.memory_used_count == null) obj.memory_used_count = obj.memory_used.length;
      return obj;
    } catch (e) {
      console.warn("[LLM] executeTask fallback:", e && e.message ? e.message : e);
      return fallbackExecute(company, hasFeedback);
    }
  }

  window.NKS_LLM = {
    diagnose: diagnose,
    executeTask: executeTask,
  };
})();
