NKS.mountTopbar({ user: "张小北" });
    NKS.mountSidebar(2);
    NKS.mountTimeline(1);

    const data = NKS.getCompanyData();
    const identity = data.enterprise_identity || {};
    const demand = data.demand_input || {};
    let libraryMode = "enterprise";

    function list(items) {
      return (items || []).join("、");
    }

    function renderIdentity() {
      document.getElementById("identity-status").textContent = identity.status || "待生成";
      document.getElementById("identity-confidence").textContent = `置信度：${identity.confidence || "待补"}`;
      document.getElementById("identity-fields").innerHTML = `
        <div class="identity-field"><div class="field-label">行业判断</div><div class="field-value">${NKS.escapeHtml(identity.industry_judgement || "待补")}</div></div>
        <div class="identity-field"><div class="field-label">客户类型</div><div class="field-value">${NKS.escapeHtml(list(identity.customer_type))}</div></div>
        <div class="identity-field"><div class="field-label">业务目标</div><div class="field-value">${NKS.escapeHtml(list(identity.business_goal))}</div></div>
        <div class="identity-field"><div class="field-label">风险红线</div><div class="field-value risk">${NKS.escapeHtml(list(identity.risk_rules))}</div></div>
      `;
    }

    function currentLibrary() {
      return libraryMode === "enterprise" ? data.enterprise_library : data.department_library;
    }

    function renderLibrary() {
      const lib = currentLibrary();
      document.getElementById("enterprise-tab").classList.toggle("active", libraryMode === "enterprise");
      document.getElementById("department-tab").classList.toggle("active", libraryMode === "department");
      document.getElementById("library-desc").textContent = lib.description || "";
      document.getElementById("library-upload-title").textContent = lib.upload_hint || "点击上传";
      document.getElementById("library-formats").textContent = lib.formats || "";
      document.getElementById("library-limit").textContent = lib.limit || "";
      document.getElementById("library-tags").innerHTML = (lib.tags || []).map((tag) => `<span class="nks-pill">${NKS.escapeHtml(tag)}</span>`).join("");
    }

    renderIdentity();
    renderLibrary();

    document.getElementById("demand-title").textContent = demand.recommended_title || "推荐方式：粘贴需求文本";
    document.getElementById("demand-text").placeholder = demand.sample_text || "";
    document.getElementById("demand-upload-title").textContent = demand.upload_title || "上传文档";
    document.getElementById("demand-upload-hint").textContent = demand.upload_hint || "点击上传";
    document.getElementById("demand-formats").textContent = demand.formats || "";
    document.getElementById("demand-limit").textContent = demand.limit || "";
    document.getElementById("memory-hint").textContent = demand.memory_hint || "";

    const contextList = document.getElementById("context-list");
    contextList.innerHTML = `
      <div class="ctx-row"><span class="label">行业判断</span><span class="value">${NKS.escapeHtml(identity.industry_judgement || "待补")}</span></div>
      <div class="ctx-row"><span class="label">客户类型</span><span class="value">${NKS.escapeHtml((identity.customer_type || []).join("、") || "待补")}</span></div>
      <div class="ctx-row"><span class="label">业务目标</span><span class="value">${NKS.escapeHtml((identity.business_goal || []).join("、") || "待补")}</span></div>
    `;
    var rc = document.getElementById("rail-company");
    var rw = document.getElementById("rail-workspace");
    if (rc) rc.textContent = data.display_name || "";
    if (rw) rw.textContent = data.workspace_name || "";
    document.getElementById("context-hint").textContent = "确认企业身份证后，系统将自动进行需求归类和岗位判断";

    document.getElementById("confirm-identity").addEventListener("click", function () {
      const message = document.getElementById("identity-message");
      message.textContent = "企业身份证已确认";
      NKS.toast("企业身份证已确认", "success");
    });

    document.getElementById("enterprise-tab").addEventListener("click", function () {
      libraryMode = "enterprise";
      renderLibrary();
    });

    document.getElementById("department-tab").addEventListener("click", function () {
      libraryMode = "department";
      renderLibrary();
    });

    const libraryFile = document.getElementById("library-file");
    document.getElementById("library-upload").addEventListener("click", function () {
      libraryFile.click();
    });
    libraryFile.addEventListener("change", function () {
      const status = document.getElementById("library-status");
      status.textContent = `${currentLibrary().name}资料已上传`;
      NKS.toast(`${currentLibrary().name}资料已上传`, "success");
    });

    const demandText = document.getElementById("demand-text");
    const charCount = document.getElementById("char-count");
    demandText.addEventListener("input", function () {
      charCount.textContent = `${demandText.value.length} / 5000`;
    });

    const demandFile = document.getElementById("demand-file");
    document.getElementById("demand-upload").addEventListener("click", function () {
      demandFile.click();
    });
    demandFile.addEventListener("change", function () {
      const status = document.getElementById("demand-upload-status");
      status.textContent = "需求文档已上传";
      NKS.toast("需求文档已上传", "success");
    });

    document.getElementById("save-draft").addEventListener("click", function () {
      const rawDemand = demandText.value.trim() || demand.sample_text || "";
      NKS.setState({ demand: { draft: rawDemand } });
      NKS.toast("草稿已保存", "success");
    });

    document.getElementById("start-diagnosis").addEventListener("click", function () {
      const button = this;
      const restore = NKS.setButtonLoading(button, "诊断中...");
      const status = document.getElementById("diagnosis-status");
      const rawDemand = demandText.value.trim() || demand.sample_text || "";
      status.textContent = "正在保存需求材料并运行需求诊断...";
      try {
        NKS.setState({ demand: { raw_demand: rawDemand } });
        status.textContent = "诊断完成，正在进入路由与骨架页...";
        NKS.toast("需求诊断完成", "success");
        window.setTimeout(function () {
          window.location.href = "../demand-diagnosis/index.html";
        }, 520);
      } catch (error) {
        status.textContent = "诊断失败，请重试";
        NKS.toast(error.message || "诊断失败，请重试", "error");
        restore("开始需求诊断");
      }
    });
