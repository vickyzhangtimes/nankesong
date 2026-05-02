NKS.mountTopbar({ user: "张小北", tag: "反馈进化" });
NKS.mountSidebar(6);
NKS.mountTimeline(5);

(function () {
  // ── 数据准备：根据 ?agent=secondary 切换 ──
  var st = NKS.getState() || {};
  var sess = st.feedbackSession || {};
  var data = NKS.getCompanyData() || {};
  var qs = new URLSearchParams(location.search);
  var agentKey = qs.get("agent") || st.activeAgentKey || "primary";
  var isSec = agentKey === "secondary" && data.secondary_agent;
  var ab = isSec ? data.secondary_agent : (data.agent_birth_card || {});
  var taskV1 = isSec ? (data.secondary_task_v1 || {}) : (data.task_v1 || {});
  var taskV2 = isSec ? (data.secondary_task_v2 || {}) : (data.task_v2 || {});
  var fb = isSec ? (data.secondary_feedback || {}) : (data.feedback || {});
  var v1Outs = (taskV1.outputs || []).slice(0, 4);
  var v2Outs = (taskV2.outputs || []).slice(0, 4);
  var rules = (fb.rules_added || []).slice();
  var feedbackPrefill = sess.feedback_text || fb.raw || "";
  var agentName = ab.name || "AI 员工";
  var agentTitle = ab.title || "";
  var taskTitle = taskV1.input_summary || "本次任务";
  var roster = data.roster || [];

  // 模拟"企业记忆版本"基准。每次写回 +1。
  var memVer = (function () {
    var base = (data.memory_writeback && data.memory_writeback.version_to) || "v8";
    return base.replace("V", "v");
  })();
  var memVerNext = (function () {
    var m = /v(\d+)/i.exec(memVer);
    var n = m ? parseInt(m[1], 10) + 1 : 9;
    return "v" + n;
  })();

  var $ = function (id) { return document.getElementById(id); };
  var esc = NKS.escapeHtml;

  // ── 顶部叙事条 ──
  $("narrative-title").innerHTML = "把你给「" + esc(agentName) + "」的反馈，变成企业的下一条规则";
  $("narrative-sub").innerHTML =
    '你刚让 <b>' + esc(agentName) + (agentTitle ? ('·' + esc(agentTitle)) : '') + '</b> 完成了 <b>' + esc(taskTitle) + '</b>。' +
    '现在用一句话告诉他这次哪里不到位 → AI 拆成可执行规则 → <b>写入企业记忆，全员下次自动遵守</b>。';
  $("narrative-meta").innerHTML =
    '<div class="fb-meta-item"><span class="muted">企业</span><b>' + esc(data.display_name || "") + '</b></div>' +
    '<div class="fb-meta-item"><span class="muted">Agent</span><b>' + esc(agentName) + '</b></div>' +
    '<div class="fb-meta-item"><span class="muted">本次任务</span><b>' + esc(taskTitle.length > 28 ? taskTitle.slice(0, 28) + "…" : taskTitle) + '</b></div>';

  // 反馈输入框 placeholder 按 agent 动态生成
  var fbPlaceholder = (fb.raw && fb.raw.length < 90)
    ? "例如：" + fb.raw
    : "用一句话说出这次哪里不对、下次该怎么改。不需要严谨表述。";

  // ── 段 1：V1 / V2 对比 ──
  function renderOutputs(outs, container, opts) {
    opts = opts || {};
    if (!outs || !outs.length) {
      container.innerHTML = '<div class="fb-v2-placeholder"><div class="fb-v2-placeholder-dot"></div><div>暂无内容</div></div>';
      return;
    }
    container.innerHTML = outs.map(function (o, i) {
      var diffClass = (opts.markDiff && o.diff && o.diff.length) ? " fb-out-changed" : "";
      var diffBadge = (opts.markDiff && o.diff && o.diff.length)
        ? '<span class="fb-diff-badge">已变更：' + esc(o.diff.join(" / ")) + '</span>'
        : '';
      var bodyText = String(o.body || "");
      if (bodyText.length > 180) bodyText = bodyText.slice(0, 180) + "…";
      return '<div class="fb-out-card' + diffClass + '">' +
        '<div class="fb-out-head"><span class="fb-out-platform">' + esc(o.platform || ("输出 " + (i + 1))) + '</span>' + diffBadge + '</div>' +
        '<div class="fb-out-title">' + esc(o.title || "") + '</div>' +
        '<div class="fb-out-body">' + esc(bodyText) + '</div>' +
        '</div>';
    }).join("");
  }
  renderOutputs(v1Outs, $("v1-body"), { markDiff: false });
  $("v1-meta").textContent = agentName + " 刚生成 · " + v1Outs.length + " 项产出";

  // ── 段 2：反馈输入 ──
  var ta = $("feedback-ta");
  ta.placeholder = fbPlaceholder;
  ta.value = feedbackPrefill;
  var charEl = $("feedback-char");
  function syncChar() { charEl.textContent = ta.value.length + " / 500"; }
  ta.addEventListener("input", syncChar);
  syncChar();
  $("feedback-clear").addEventListener("click", function (e) {
    e.preventDefault();
    ta.value = "";
    syncChar();
  });

  // 渲染规则（支持逐条浮现）
  function renderRules(list, animate) {
    var ol = $("rules-list");
    if (!list || !list.length) {
      ol.innerHTML = '<li class="fb-rule fb-rule-empty">写完反馈、点击生成后，<br/>规则会一条条出现在这里</li>';
      return;
    }
    var checkSvg = '<span class="fb-rule-check" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>';
    if (!animate) {
      ol.innerHTML = list.map(function (r) {
        return '<li class="fb-rule">' + checkSvg + '<span>' + esc(r) + '</span></li>';
      }).join("");
      return;
    }
    ol.innerHTML = "";
    list.forEach(function (r, i) {
      setTimeout(function () {
        var li = document.createElement("li");
        li.className = "fb-rule fb-rule-in";
        li.innerHTML = checkSvg + '<span>' + esc(r) + '</span>';
        ol.appendChild(li);
      }, 280 * i);
    });
  }

  // ── 段 3：写回卡（默认未生效） ──
  function setWritebackPending(rulesCount) {
    $("mem-ver").textContent = memVer + " → " + memVerNext;
    $("mem-rules-count").textContent = "新增 " + rulesCount + " 条规则";
    var affected = roster.length ? ("全员 " + roster.length + " 个 Agent · 下次执行自动生效") : "全员 Agent · 下次执行自动生效";
    $("mem-affected").textContent = affected;
    $("mem-status").innerHTML = "";
    $("save-v2").disabled = rulesCount === 0;
  }
  function setWritebackDone() {
    $("mem-status").innerHTML =
      '<span class="fb-wb-done">已写入企业记忆 ' + memVerNext + '。' +
      '下次 ' + esc(agentName) + '（以及其他 Agent）执行同类任务时会自动遵守这 ' + (rules.length || 0) + ' 条规则。</span>' +
      ' <a href="../enterprise-memory/index.html">返回企业记忆查看 →</a>';
    var btn = $("save-v2");
    btn.textContent = "已写回企业记忆";
    btn.disabled = true;
    btn.classList.add("nks-btn-done");
  }

  // 初始：V1 已存在，规则未生成 → 写回禁用
  setWritebackPending(0);

  // 右栏上下文
  var ctxList = $("context-list");
  ctxList.innerHTML =
    '<div class="ctx-row"><span class="label">企业</span><span class="value">' + esc(data.display_name || "") + '</span></div>' +
    '<div class="ctx-row"><span class="label">当前 Agent</span><span class="value">' + esc(agentName) + '</span></div>' +
    '<div class="ctx-row"><span class="label">本次反馈生效范围</span><span class="value" style="color:var(--success);">全员 ' + roster.length + ' 个 Agent</span></div>' +
    '<div class="ctx-row"><span class="label">已沉淀规则总数</span><span class="value" id="ctx-total-rules">47 条</span></div>';

  // ── 生成 V2：假动效 + 真数据 ──
  function generateV2(userFeedback) {
    var btn = $("generate-v2");
    var statusEl = $("distill-status");
    btn.disabled = true;
    btn.textContent = "AI 提炼中…";
    statusEl.textContent = "AI 正在拆解…";
    statusEl.classList.add("active");
    $("v2-body").innerHTML = '<div class="fb-v2-placeholder loading"><div class="fb-v2-spinner"></div><div>正在按反馈重新生成 V2…</div></div>';

    setTimeout(function () {
      // 1. 渲染规则（逐条浮现）
      renderRules(rules, true);
      statusEl.textContent = "已提炼 " + rules.length + " 条规则";
    }, 800);

    setTimeout(function () {
      // 2. 渲染 V2 outputs（带 diff 高亮）
      var v2OutputsToShow = v2Outs.length ? v2Outs : v1Outs.map(function (o) {
        return Object.assign({}, o, { diff: ["已按反馈调整"] });
      });
      renderOutputs(v2OutputsToShow, $("v2-body"), { markDiff: true });
      $("v2-meta").textContent = "已应用 " + rules.length + " 条规则";
      // 3. 解锁写回按钮
      setWritebackPending(rules.length);
      btn.textContent = "重新生成";
      btn.disabled = false;
      statusEl.classList.remove("active");
      // 4. 滚动到 V2，让用户看见
      $("fb-compare").scrollIntoView({ behavior: "smooth", block: "start" });
      NKS.toast("改进版本已生成，下方可写入企业记忆", "success");

      // 5. 写入会话状态
      NKS.setState({
        feedbackSession: {
          feedback_text: userFeedback,
          rules_distilled: rules,
          generated_at: new Date().toISOString(),
        },
      });
    }, 1600);
  }

  $("generate-v2").addEventListener("click", function () {
    var fbText = ta.value.trim();
    if (!fbText) {
      NKS.toast("先用一句话写下你想改什么", "error");
      ta.focus();
      return;
    }
    generateV2(fbText);
  });

  $("save-v2").addEventListener("click", function () {
    NKS.setState({
      feedbackSession: Object.assign({}, st.feedbackSession || {}, {
        feedback_text: ta.value.trim(),
        rules_distilled: rules,
        saved: true,
        saved_at: new Date().toISOString(),
        memory_version: memVerNext,
      }),
    });
    setWritebackDone();
    var totalEl = $("ctx-total-rules");
    if (totalEl) {
      var m = /(\d+)/.exec(totalEl.textContent);
      var prev = m ? parseInt(m[1], 10) : 47;
      totalEl.innerHTML = (prev + rules.length) + ' 条 <span style="color:var(--success);font-size:11px;">↑ +' + rules.length + '</span>';
    }
    NKS.toast("已写入企业记忆 " + memVerNext + "，全员下次生效", "success");
  });

  $("restore-prev").addEventListener("click", function () {
    NKS.toast("已保留当前版本，本次反馈未写入记忆", "info");
  });
})();
