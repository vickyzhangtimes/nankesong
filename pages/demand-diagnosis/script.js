NKS.mountTopbar({ user: "张小北", tag: "需求诊断" });
    NKS.mountTimeline(2);

    (function () {
      const company = NKS.getCompany();
      const data = NKS.getCompanyData();
      let diagnosis = {
        routing_decision: data.routing_decision,
        diagnosis_metrics: data.diagnosis_metrics,
        seven_skeleton: data.seven_skeleton
      };

      const refs = {
        app: document.getElementById("app"),
        demandTitle: document.getElementById("demandTitle"),
        demandExcerpt: document.getElementById("demandExcerpt"),
        sourceList: document.getElementById("sourceList"),
        decisionHeadline: document.getElementById("decisionHeadline"),
        statusPill: document.getElementById("statusPill"),
        decisionTag: document.getElementById("decisionTag"),
        decisionList: document.getElementById("decisionList"),
        nextStepText: document.getElementById("nextStepText"),
        metricGrid: document.getElementById("metricGrid"),
        skeletonGrid: document.getElementById("skeletonGrid"),
        rosterMini: document.getElementById("rosterMini"),
        memoryLine: document.getElementById("memoryLine"),
        memoryCount: document.getElementById("memoryCount"),
        bottomTitle: document.getElementById("bottomTitle"),
        bottomHint: document.getElementById("bottomHint"),
        confirmBtn: document.getElementById("confirmBtn"),
        rerunBtn: document.getElementById("rerunBtn")
      };

      function esc(value) {
        return String(value == null ? "" : value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      function decisionLabel(decision) {
        return {
          reuse_agent: "复用已有岗位 Agent",
          add_workflow: "不新建 Agent，新增 workflow",
          new_role_agent: "新建岗位 Agent"
        }[decision] || "待判断";
      }

      function inferTaskType(text) {
        const t = String(text || "");
        if (/内容|公众号|小红书|知乎|发布|改写/.test(t)) return "内容增长";
        if (/客户|销售|线索|跟进|商机/.test(t)) return "销售转化";
        if (/报销|费用|凭证|财务/.test(t)) return "财务处理";
        if (/商品|尺码|建档|图片|套图/.test(t)) return "商品运营";
        return "通用运营";
      }

      function inferComplexity(text) {
        const t = String(text || "");
        const score =
          (t.length > 180 ? 1 : 0) +
          (/多平台|同时|并且|以及|批量/.test(t) ? 1 : 0) +
          (/复核|审批|风控|口径/.test(t) ? 1 : 0);
        if (score >= 3) return "高";
        if (score === 2) return "中";
        return "低";
      }

      function inferAutomationRate(routeDecision) {
        if (routeDecision === "new_role_agent") return "70%";
        if (routeDecision === "add_workflow") return "62%";
        return "55%";
      }

      function inferRiskLevel(text) {
        const t = String(text || "");
        if (/发布|财务|付款|合同|对外/.test(t)) return "中高";
        if (/复核|审批|校验/.test(t)) return "中";
        return "低";
      }

      function isTargetRosterItem(item, targetAgent) {
        if (!targetAgent) return false;
        const title = String(item.title || "");
        const compactTitle = title.replace(/专员|助理|Agent|\s/g, "");
        const compactTarget = String(targetAgent).replace(/专员|助理|Agent|\s/g, "");
        return compactTarget.includes(compactTitle) || compactTitle.includes(compactTarget);
      }

      function renderStatic() {
        refs.demandTitle.textContent = data.raw_demand.title;
        refs.demandExcerpt.textContent = data.raw_demand.excerpt;

        refs.sourceList.innerHTML = (data.libraries || []).map((lib) => `
          <div class="source-item">
            <span class="source-dot"></span>
            <span><b>${esc(lib.name)}</b> · ${esc(lib.status)} · ${esc(lib.items.length)} 项</span>
          </div>
        `).join("");

        // 顶部需求卡来源数 + 折叠交互
        const srcCountEl = document.getElementById("demandSourceCount");
        if (srcCountEl) srcCountEl.textContent = `${(data.libraries || []).length} 个资料来源`;
        const toggleEl = document.getElementById("demandToggle");
        const detailEl = document.getElementById("demandDetail");
        const hintEl = document.getElementById("demandToggleHint");
        if (toggleEl && detailEl) {
          toggleEl.addEventListener("click", () => {
            const open = !detailEl.hidden;
            detailEl.hidden = open;
            if (hintEl) hintEl.textContent = open ? "点击查看原文 ▾" : "点击收起 ▴";
          });
        }

        // rosterMini：先渲染初始扫描态，runRouterScan() 再驱动动画
        const targetAgent = (data.routing_decision && data.routing_decision.target_agent) || "";
        refs.rosterMini.innerHTML = (data.roster || []).map((item, idx) => {
          const isTarget = isTargetRosterItem(item, targetAgent);
          return `
            <div class="roster-item" data-idx="${idx}" data-target="${isTarget ? "1" : "0"}">
              <span class="recommend-badge">⭐ 系统推荐复用</span>
              <strong>${esc(item.name)} · ${esc(item.title)}</strong>
              <span class="muted">${esc(item.department)} · ${esc(item.status)} · 已完成 ${esc(item.tasks_done)} 件</span>
              <div class="match-row">
                <span class="match-bar"><span class="match-fill"></span></span>
                <span class="match-pct">—</span>
                <span class="match-verdict no">待计算</span>
              </div>
            </div>
          `;
        }).join("");

        const memoryItems = Array.from(new Set(
          (data.task_v1 && data.task_v1.memory_used)
            ? data.task_v1.memory_used
            : (data.libraries || []).map((item) => item.name)
        )).slice(0, 6);

        refs.memoryCount.textContent = `已读取 ${memoryItems.length} 条`;
        refs.memoryLine.innerHTML = memoryItems.map((item, index) => `
          <div class="memory-item">
            <span>${esc(item)}</span>
            <span class="nks-tag ${index < 3 ? "success" : "muted"}">${index < 3 ? "已接入" : "可追溯"}</span>
          </div>
        `).join("");
      }

      function renderDiagnosis() {
        const route = diagnosis.routing_decision || {};
        const label = decisionLabel(route.decision);
        const demandText = (data.raw_demand && data.raw_demand.excerpt) || "";
        const taskType = inferTaskType(demandText);
        const complexity = inferComplexity(demandText);
        const automationRate = inferAutomationRate(route.decision);
        const riskLevel = inferRiskLevel(demandText);

        refs.decisionHeadline.textContent = label;
        refs.decisionTag.textContent = route.decision || "fallback";
        refs.statusPill.textContent = route.decision === "new_role_agent" ? "待确认新岗位" : "可归入编制";

        refs.decisionList.innerHTML = [
          ["任务类型", taskType],
          ["复杂度", complexity],
          ["自动化占比", automationRate],
          ["风险等级", riskLevel],
          ["建议归属", route.target_agent || "待补"],
          ["处理方式", route.action || "待补"],
          ["判断原因", route.reason || "待补"],
          ["不新建原因", route.not_create_reason || (route.decision === "new_role_agent" ? "已形成独立岗位职责" : "待补")]
        ].map(([k, v]) => `
          <div class="decision-row">
            <b>${esc(k)}</b>
            <span>${esc(v)}</span>
          </div>
        `).join("");

        const next = route.decision === "new_role_agent"
          ? `下一步先进入路由与七层骨架页，确认岗位边界后再生成「${route.target_agent || data.agent_birth_card.title}」的入职卡。`
          : `下一步先进入路由与七层骨架页，确认新增 workflow 和学习规则后再进入员工卡。`;
        refs.nextStepText.textContent = next;

        refs.bottomTitle.textContent = route.decision === "new_role_agent"
          ? "确认后，先检查岗位七层骨架"
          : `确认后，先检查「${route.target_agent || "已有 AI 员工"}」的新 workflow`;
        refs.bottomHint.textContent = "下一步会展示岗位边界、工作顺序、质量红线、交付契约和学习回路；确认后再生成员工卡。";
        refs.confirmBtn.textContent = route.decision === "new_role_agent"
          ? "查看七层骨架 →"
          : "查看 workflow 骨架 →";

        refs.metricGrid.innerHTML = (diagnosis.diagnosis_metrics || []).slice(0, 4).map((metric) => `
          <div class="metric-card">
            <strong>${esc(metric.name)}</strong>
            <div class="metric-change">
              <span>现状：${esc(metric.baseline)}</span>
              <b>目标：${esc(metric.target)}</b>
            </div>
          </div>
        `).join("");

        if (refs.skeletonGrid) refs.skeletonGrid.innerHTML = (diagnosis.seven_skeleton || []).slice(0, 7).map((item) => {
          const title = item.title || "";
          const cls = title.includes("红线") ? "redline" : title.includes("学习") ? "learning" : "";
          const items = Array.isArray(item.items) ? item.items : [];
          return `
            <section class="skeleton-card ${cls}">
              <h3><span class="idx">${esc(item.idx)}</span>${esc(title)}</h3>
              <ul class="clean-list">
                ${items.slice(0, 3).map((text) => `<li>${esc(text)}</li>`).join("")}
              </ul>
            </section>
          `;
        }).join("");
      }

      function runRouterScan() {
        const items = Array.from(refs.rosterMini.querySelectorAll(".roster-item"));
        if (!items.length) return;
        const statusEl = document.getElementById("routerScanStatus");
        const hintEl = document.getElementById("routerScanHint");
        const resultEl = document.getElementById("routerResult");
        const route = diagnosis.routing_decision || {};
        const targetAgent = route.target_agent || "";
        const decisionLabelText = decisionLabel(route.decision);

        // 重置
        items.forEach((el) => {
          el.classList.remove("scanning", "matched");
          const fill = el.querySelector(".match-fill");
          const pct = el.querySelector(".match-pct");
          const verdict = el.querySelector(".match-verdict");
          if (fill) fill.style.width = "0%";
          if (pct) pct.textContent = "—";
          if (verdict) { verdict.textContent = "待计算"; verdict.className = "match-verdict no"; }
        });
        if (resultEl) resultEl.hidden = true;
        if (statusEl) { statusEl.textContent = "扫描中"; statusEl.className = "nks-tag"; }
        if (hintEl) hintEl.textContent = "在企业现有 AI 员工中查找谁能接这个需求……";

        // 给目标员工高分数（72%–92%），其它员工低分数（5%–25%）
        const scores = items.map((el) => {
          const isTarget = el.dataset.target === "1";
          if (isTarget) return 72 + Math.floor(Math.random() * 20);
          return 5 + Math.floor(Math.random() * 20);
        });

        // 顺序扫描：每个 item 600ms 扫描 → 落分
        let i = 0;
        function step() {
          if (i >= items.length) {
            // 扫描结束
            if (statusEl) { statusEl.textContent = "完成"; statusEl.className = "nks-tag success"; }
            const matched = items.find((el) => el.classList.contains("matched"));
            if (matched && hintEl) {
              const name = matched.querySelector("strong").textContent;
              hintEl.textContent = `匹配完成：${name} 是当前最适合接这个需求的 AI 员工。`;
            }
            if (resultEl) {
              resultEl.hidden = false;
              if (route.decision === "new_role_agent") {
                resultEl.innerHTML = `<b>路由决策：${esc(decisionLabelText)}</b><br>现有员工最高匹配度仍不足，建议 <b>新建岗位 AI 员工</b>。`;
                resultEl.style.borderColor = "var(--primary)";
                resultEl.style.background = "var(--primary-soft)";
              } else {
                const matchedName = matched ? matched.querySelector("strong").textContent : (targetAgent || "推荐员工");
                resultEl.innerHTML = `<b>路由决策：${esc(decisionLabelText)}</b><br>把这次需求交给 <b>${esc(matchedName)}</b>，新增一个 workflow 即可，无需新建员工。`;
              }
            }
            return;
          }
          const el = items[i];
          el.classList.add("scanning");
          setTimeout(() => {
            el.classList.remove("scanning");
            const score = scores[i];
            const fill = el.querySelector(".match-fill");
            const pct = el.querySelector(".match-pct");
            const verdict = el.querySelector(".match-verdict");
            if (fill) fill.style.width = score + "%";
            if (pct) pct.textContent = score + "%";
            if (score >= 60) {
              el.classList.add("matched");
              if (verdict) { verdict.textContent = "✓ 推荐"; verdict.className = "match-verdict ok"; }
            } else {
              if (verdict) { verdict.textContent = "✗ 不匹配"; verdict.className = "match-verdict no"; }
            }
            i += 1;
            setTimeout(step, 180);
          }, 600);
        }
        step();
      }

      function buildAgentProfile() {
        const agent = data.agent_birth_card || {};
        const route = diagnosis.routing_decision || {};
        const memoryItems = (data.task_v1 && data.task_v1.memory_used)
          ? data.task_v1.memory_used
          : (data.libraries || []).map((item) => item.name);

        return {
          agent_id: agent.employee_id,
          version: route.decision === "new_role_agent" ? "新岗位待确认" : "新增 workflow 待确认",
          name: agent.name,
          role: agent.title,
          department: agent.department,
          reports_to: company === "hongke" ? "张经理" : "商品部负责人",
          status: "待确认",
          employment_stage: route.decision === "new_role_agent" ? "试用期" : "编制内更新",
          source_items: ["需求诊断", route.target_agent, route.action, "七层岗位骨架"].filter(Boolean).slice(0, 6),
          tasks_i_can_do: agent.tasks_i_can_do || [],
          work_boundaries: agent.red_lines || [],
          available_resources: Array.from(new Set((data.libraries || []).map((item) => item.name).concat(["当前任务资料"]))).slice(0, 6),
          learning_items: ["已接入本次需求诊断", "已保存路由判断", "下次优先复用已确认 workflow"],
          memory_status: {
            read_count: Math.max(3, memoryItems.length),
            completion: 82,
            read_items: memoryItems.slice(0, 6)
          },
          routing_decision: route,
          diagnosis_metrics: diagnosis.diagnosis_metrics,
          seven_skeleton: diagnosis.seven_skeleton
        };
      }

      async function runDiagnosis() {
        refs.app.classList.add("loading");
        refs.statusPill.textContent = "诊断中";
        try {
          const result = await NKS_LLM.diagnose({
            company,
            enterprise_identity: data.enterprise_identity,
            existing_agents: data.roster,
            raw_demand: data.raw_demand.excerpt
          });
          if (result && result.routing_decision && result.seven_skeleton) {
            diagnosis = result;
          }
        } catch (error) {
          diagnosis = {
            routing_decision: data.routing_decision,
            diagnosis_metrics: data.diagnosis_metrics,
            seven_skeleton: data.seven_skeleton
          };
        } finally {
          refs.app.classList.remove("loading");
          renderDiagnosis();
        }
      }

      refs.confirmBtn.addEventListener("click", () => {
        const agentProfile = buildAgentProfile();
        const routeDecision = (diagnosis.routing_decision && diagnosis.routing_decision.decision) || "new_role_agent";
        const routeTargetAgent = (diagnosis.routing_decision && diagnosis.routing_decision.target_agent) || "";
        NKS.setState({
          rawDemand: (data.raw_demand && data.raw_demand.excerpt) || "",
          demandText: (data.raw_demand && data.raw_demand.excerpt) || "",
          demandDiagnosis: diagnosis,
          routingDecision: diagnosis.routing_decision,
          diagnosisMetrics: diagnosis.diagnosis_metrics,
          sevenSkeleton: diagnosis.seven_skeleton,
          currentAgent: data.agent_birth_card,
          agentProfile,
          routeDecision,
          routeTargetAgent,
          demandConfirmedAt: new Date().toISOString()
        });
        location.href = routeDecision === "new_role_agent"
          ? "../job-agent-workbench/index.html"
          : "../job-agent-workbench/index.html?mode=reuse";
      });

      refs.rerunBtn.addEventListener("click", runDiagnosis);

      // 输入态控件
      const inputState = document.getElementById("inputState");
      const diagResults = document.getElementById("diagResults");
      const routerScanCard = document.getElementById("routerScanCard");
      const sideHintCard = document.getElementById("sideHintCard");
      const bottomConfirm = document.getElementById("bottomConfirm");
      const startBtn = document.getElementById("startDiagnosisBtn");
      const startBtnText = document.getElementById("startDiagnosisText");
      const useDemoBtn = document.getElementById("useDemoBtn");
      const diagInput = document.getElementById("diagInput");

      const DEMO_DEMAND = "市场部内容生产太慢。英文技术资料要翻译并改成公众号、知乎、LinkedIn、小红书等 10 个平台。每平台风格不一样，实习生搬运很累。行业洞察没人持续做，发布后数据复盘弱。担心 AI 写得太营销，也不能编造技术参数。";

      if (useDemoBtn && diagInput) {
        useDemoBtn.addEventListener("click", () => {
          diagInput.value = DEMO_DEMAND;
          diagInput.focus();
        });
      }

      function enterDiagnosedState() {
        if (inputState) inputState.hidden = true;
        if (diagResults) diagResults.hidden = false;
        if (routerScanCard) routerScanCard.hidden = false;
        if (sideHintCard) sideHintCard.hidden = true;
        if (bottomConfirm) bottomConfirm.hidden = false;
        if (refs.rerunBtn) refs.rerunBtn.hidden = false;
      }

      if (startBtn) {
        startBtn.addEventListener("click", async () => {
          const text = (diagInput && diagInput.value.trim()) || "";
          if (!text) {
            NKS.toast("请贴一段需求或点「用 Demo 数据」", "error");
            return;
          }
          // 把用户输入写入 raw_demand，让后续渲染使用
          if (data.raw_demand) data.raw_demand.excerpt = text;
          startBtn.disabled = true;
          if (startBtnText) startBtnText.textContent = "诊断中…";
          await runDiagnosis();
          enterDiagnosedState();
          renderStatic();
          renderDiagnosis();
          runRouterScan();
        });
      }

      // 静态渲染（侧栏数据 + roster mini）
      renderStatic();
    })();
