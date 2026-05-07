NKS.mountTopbar({ user: "张小北", tag: "路由与骨架" });
NKS.mountSidebar(4);
NKS.mountTimeline(2);

(function () {
  const data = NKS.getCompanyData();
  const st = NKS.getState();
  const rawDemand =
    (st.demand && st.demand.raw_demand) ||
    (st.rawDemand) ||
    (st.demandText) ||
    (data.raw_demand && data.raw_demand.excerpt) ||
    (data.raw_demand && data.raw_demand.title) ||
    "";

  const rawDemandInput = document.getElementById("raw-demand-input");
  const materialUpload = document.getElementById("material-upload");
  const materialList = document.getElementById("material-list");
  const recognitionStatus = document.getElementById("recognition-status");
  const recognitionHint = document.getElementById("recognition-hint");
  const recognizeBtn = document.getElementById("recognize-demand");
  const fillDemoBtn = document.getElementById("fill-demo-demand");

  const DEMO_DEMAND =
    (data.raw_demand && data.raw_demand.excerpt) ||
    "市场部内容生产太慢。英文技术资料要翻译并改成公众号、知乎、LinkedIn、小红书等 10 个平台。每平台风格不一样，实习生搬运很累。行业洞察没人持续做，发布后数据复盘弱。担心 AI 写得太营销，也不能编造技术参数。";

  let recognizedBundle = {
    routing_decision: data.routing_decision,
    route_options: data.route_options,
    seven_skeleton: data.seven_skeleton,
    evidence: data.evidence,
    diagnosis_metrics: data.diagnosis_metrics,
  };

  if (rawDemandInput) rawDemandInput.value = rawDemand || DEMO_DEMAND;

  function renderMaterialList(files) {
    if (!materialList) return;
    const names = files && files.length
      ? Array.from(files).map(function (file) { return file.name; })
      : ["企业身份证", "市场部历史文章 32 篇", "术语表", "平台样例"];
    materialList.innerHTML = names
      .map(function (name) {
        return '<span class="material-chip">' + NKS.escapeHtml(name) + "</span>";
      })
      .join("");
  }

  renderMaterialList();

  function applyBundle(bundle) {
    recognizedBundle = bundle;
    const routing = bundle.routing_decision || {};
    const routeOptions = bundle.route_options || data.route_options || [];
    const skeleton = bundle.seven_skeleton || [];
    const evidence = bundle.evidence || data.evidence || {};
    const metrics = bundle.diagnosis_metrics || [];

    document.getElementById("job-position").textContent = routing.target_agent || "待判断";
    document.getElementById("judgement-reason").textContent = routing.reason || "";
    document.getElementById("confidence-tag").textContent =
      (routing.match_label || "胜任匹配") + " " + (routing.match_score || "待补");

    const comparisonGrid = document.getElementById("comparison-grid");
    comparisonGrid.innerHTML = routeOptions
      .map(function (option) {
        return (
          '<div class="comparison-card ' +
          (option.status === "推荐" ? "recommended" : "") +
          '">' +
          '<div class="comparison-card-title">' +
          NKS.escapeHtml(option.title) +
          "</div>" +
          '<span class="comparison-card-status ' +
          (option.tone === "danger"
            ? "not-recommended"
            : option.tone === "warning"
              ? "optional"
              : "recommended") +
          '">' +
          NKS.escapeHtml(option.status) +
          "</span>" +
          '<div class="comparison-card-reason">' +
          NKS.escapeHtml(option.reason) +
          "</div></div>"
        );
      })
      .join("");

    document.getElementById("skeleton-title").textContent =
      (routing.target_agent || "岗位") + " 岗位骨架（七层）";

    const skeletonList = document.getElementById("skeleton-list");
    skeletonList.innerHTML = skeleton
      .map(function (layer) {
        const layerItems = (layer.items || []).slice(0, 3);
        return (
          '<article class="skeleton-item layer-' + NKS.escapeHtml(layer.idx || "") + '">' +
            '<div class="skeleton-item-head">' +
              '<span class="skeleton-item-number">' + NKS.escapeHtml(layer.idx || "") + "</span>" +
              '<div><small>第 ' + NKS.escapeHtml(layer.idx || "") + ' 层</small>' +
              '<div class="skeleton-item-label">' + NKS.escapeHtml(layer.title || "") + "</div></div>" +
            "</div>" +
            '<ul class="skeleton-points">' +
              layerItems.map(function (item) {
                return "<li>" + NKS.escapeHtml(item) + "</li>";
              }).join("") +
            "</ul>" +
          "</article>"
        );
      })
      .join("");

    const referencePanel = document.getElementById("reference-panel");
    referencePanel.innerHTML =
      '<div class="reference-block">' +
      '<div class="reference-title">识别到的企业信息</div>' +
      '<div class="reference-list">' +
      (evidence.recognized_info || [])
        .map(function (item) {
          return '<div class="reference-item">' + NKS.escapeHtml(item) + "</div>";
        })
        .join("") +
      "</div></div>" +
      '<div class="reference-block">' +
      '<div class="reference-title">识别到的关键问题</div>' +
      '<div class="reference-list">' +
      (evidence.key_problems || [])
        .map(function (item) {
          return '<div class="reference-item">' + NKS.escapeHtml(item) + "</div>";
        })
        .join("") +
      "</div></div>" +
      '<div class="reference-block">' +
      '<div class="reference-title">企业记忆引用</div>' +
      '<div class="reference-list">' +
      (evidence.memory_refs || [])
        .map(function (item) {
          return '<div class="reference-item">' + NKS.escapeHtml(item) + "</div>";
        })
        .join("") +
      "</div></div>";

    const metricHost = document.getElementById("metric-strip");
    if (metricHost) {
      metricHost.innerHTML = (metrics || [])
        .slice(0, 4)
        .map(function (m) {
          return (
            '<div class="metric-mini"><b>' +
            NKS.escapeHtml(m.name) +
            "</b><span>" +
            NKS.escapeHtml(m.baseline) +
            " → " +
            NKS.escapeHtml(m.target) +
            "</span></div>"
          );
        })
        .join("");
    }

    const contextList = document.getElementById("context-list");
    contextList.innerHTML =
      '<div class="ctx-row"><span class="label">企业名称</span><span class="value">' +
      NKS.escapeHtml(data.display_name || "") +
      "</span></div>" +
      '<div class="ctx-row"><span class="label">目标岗位</span><span class="value">' +
      NKS.escapeHtml(routing.target_agent || "待判断") +
      "</span></div>" +
      '<div class="ctx-row"><span class="label">匹配度</span><span class="value">' +
      NKS.escapeHtml(routing.match_score || "待补") +
      "</span></div>";
    document.getElementById("context-hint").textContent =
      "七层骨架已由模型结合企业资料生成，可返回修改需求或前往员工诞生卡。";

    var rc = document.getElementById("rail-company");
    if (rc) rc.textContent = data.display_name || "—";
    var bh = document.getElementById("bottom-hint");
    if (bh) {
      bh.textContent =
        "主流程：需求诊断 → 本页七层骨架 → 员工诞生卡 → 操作台跑任务 → 反馈迭代。";
    }
  }

  var base = recognizedBundle;
  applyBundle(base);

  function setRecognizedState(done) {
    if (!recognitionStatus) return;
    recognitionStatus.textContent = done ? "已识别" : "待识别";
    recognitionStatus.className = done ? "nks-tag success" : "nks-tag";
  }

  setRecognizedState(!!(rawDemandInput && rawDemandInput.value.trim()));

  if (materialUpload) {
    materialUpload.addEventListener("change", function () {
      renderMaterialList(materialUpload.files);
      if (recognitionHint) {
        recognitionHint.textContent = "资料已加入识别上下文。点击识别后，会和需求文本一起用于填充七层骨架。";
      }
      setRecognizedState(false);
    });
  }

  if (fillDemoBtn && rawDemandInput) {
    fillDemoBtn.addEventListener("click", function () {
      rawDemandInput.value = DEMO_DEMAND;
      rawDemandInput.focus();
      setRecognizedState(false);
    });
  }

  if (recognizeBtn && rawDemandInput) {
    recognizeBtn.addEventListener("click", function () {
      const text = rawDemandInput.value.trim();
      if (!text) {
        NKS.toast("请先输入岗位需求或填入 Demo 需求", "error");
        return;
      }
      recognizeBtn.disabled = true;
      recognizeBtn.textContent = "识别中…";
      if (recognitionStatus) {
        recognitionStatus.textContent = "识别中";
        recognitionStatus.className = "nks-tag";
      }
      if (recognitionHint) {
        recognitionHint.textContent = "正在识别需求类型、可自动化环节、红线边界和企业记忆引用……";
      }
      NKS.setState({ rawDemand: text, demandText: text });
      window.setTimeout(function () {
        applyBundle(recognizedBundle);
        setRecognizedState(true);
        recognizeBtn.disabled = false;
        recognizeBtn.textContent = "重新识别七层骨架 →";
        if (recognitionHint) {
          recognitionHint.textContent = "已根据需求与资料填满七层骨架。确认后可以进入 AI 员工诞生卡。";
        }
        document.querySelector(".skeleton-section").scrollIntoView({ behavior: "smooth", block: "start" });
      }, 780);
    });
  }

  if (window.NKS_LLM && window.NKS_LLM.diagnose) {
    NKS_LLM.diagnose({
      company: NKS.getCompany(),
      enterprise_identity: data.enterprise_identity,
      existing_agents: data.roster,
      raw_demand: rawDemand,
    })
      .then(function (res) {
        if (res && res.routing_decision && res.seven_skeleton && res.seven_skeleton.length) {
          NKS.setState({ demandDiagnosis: res });
          applyBundle(res);
        }
      })
      .catch(function () {});
  }

  document.getElementById("back-modify").addEventListener("click", function () {
    window.location.href = "../demand-diagnosis/index.html";
  });

  document.getElementById("enter-workbench").addEventListener("click", function () {
    var status = document.getElementById("page-status");
    status.textContent = "正在进入员工诞生卡…";
    NKS.toast("正在进入员工诞生卡", "success");
    window.setTimeout(function () {
      window.location.href = "../agent-birth-card/index.html";
    }, 400);
  });
})();
