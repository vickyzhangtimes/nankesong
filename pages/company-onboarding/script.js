NKS.mountTopbar({ user: "张小北" });
    NKS.mountSidebar(1);
    NKS.mountTimeline(0);

    const data = NKS.getCompanyData();
    const chatArea = document.getElementById("chat-area");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const summaryList = document.getElementById("summary-list");
    const pageStatus = document.getElementById("page-status");
    const generateButton = document.getElementById("generate-identity");
    const onboarding = data.onboarding || {};
    const questions = onboarding.questions || [];

    document.getElementById("progress-pill").textContent = `问题进度 0/${questions.length}`;
    document.getElementById("eta-pill").textContent = `预计用时 ${onboarding.eta || "1 分钟"}`;
    document.getElementById("collected-hint").textContent = onboarding.collected_hint || "";

    const summaryIcons = {
      enterprise_name: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>',
      website: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
      industry: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 2,7 12,12 22,7"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/></svg>',
      customer_group: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      business_goal: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>',
      risk_boundary: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
    };

    function getIcon(id) {
      return summaryIcons[id] || '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
    }

    let currentQuestionIndex = 0;
    const answers = {};

    function addAgentMessage(text, label) {
      const msg = document.createElement("div");
      msg.className = "chat-msg agent";
      msg.innerHTML = `
        <span class="chat-avatar">AI</span>
        <div class="chat-bubble">
          ${label ? `<div class="question-label">${NKS.escapeHtml(label)}</div>` : ""}
          ${NKS.escapeHtml(text)}
        </div>
      `;
      chatArea.appendChild(msg);
      chatArea.scrollTop = chatArea.scrollHeight;
    }

    function addUserMessage(text) {
      const msg = document.createElement("div");
      msg.className = "chat-msg user";
      msg.innerHTML = `
        <div class="chat-bubble">${NKS.escapeHtml(text)}</div>
        <span class="chat-avatar">张</span>
      `;
      chatArea.appendChild(msg);
      chatArea.scrollTop = chatArea.scrollHeight;
    }

    function showTyping() {
      const msg = document.createElement("div");
      msg.className = "chat-msg agent";
      msg.id = "typing-msg";
      msg.innerHTML = `
        <span class="chat-avatar">AI</span>
        <div class="chat-bubble">
          <div class="typing-indicator"><span></span><span></span><span></span></div>
        </div>
      `;
      chatArea.appendChild(msg);
      chatArea.scrollTop = chatArea.scrollHeight;
    }

    function hideTyping() {
      const typing = document.getElementById("typing-msg");
      if (typing) typing.remove();
    }

    function updateProgress() {
      document.getElementById("progress-pill").textContent = `问题进度 ${currentQuestionIndex}/${questions.length}`;
    }

    function renderSummary() {
      summaryList.innerHTML = questions.map((item) => `
        <div class="summary-item">
          <div class="summary-item-header">
            <span class="summary-icon">${getIcon(item.id)}</span>
            <span class="summary-label">${NKS.escapeHtml(item.label)}</span>
          </div>
          <div class="summary-value">${NKS.escapeHtml(answers[item.id] || "待补充")}</div>
        </div>
      `).join("");
    }

    function askNextQuestion() {
      if (currentQuestionIndex >= questions.length) {
        generateButton.style.display = "block";
        chatInput.disabled = true;
        sendBtn.disabled = true;
        chatInput.placeholder = "补充说明，例如特殊禁用词、客户类型、业务红线......";
        const chatHint = document.getElementById("chat-hint");
        chatHint.style.display = "flex";
        document.getElementById("chat-hint-text").textContent = `已收集 ${questions.length} 项企业信息，可生成企业身份证`;
        return;
      }

      const q = questions[currentQuestionIndex];
      updateProgress();

      showTyping();

      window.setTimeout(function () {
        hideTyping();
        addAgentMessage(q.question, `问题 ${currentQuestionIndex + 1}/${questions.length}`);
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
      }, 800 + Math.random() * 400);
    }

    function handleSend() {
      const text = chatInput.value.trim();
      if (!text) return;

      const q = questions[currentQuestionIndex];
      answers[q.id] = text;

      addUserMessage(text);
      chatInput.value = "";
      chatInput.disabled = true;
      sendBtn.disabled = true;

      renderSummary();

      currentQuestionIndex++;

      window.setTimeout(function () {
        askNextQuestion();
      }, 400);
    }

    sendBtn.addEventListener("click", handleSend);
    chatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    generateButton.addEventListener("click", function () {
      pageStatus.textContent = "正在创建企业空间并生成企业身份证...";
      try {
        NKS.setState({ enterprise: { onboardingAnswers: answers } });
        pageStatus.textContent = "企业身份证已生成，正在进入企业记忆页...";
        NKS.toast("企业身份证已生成", "success");
        window.setTimeout(function () {
          window.location.href = "../enterprise-memory/index.html";
        }, 520);
      } catch (error) {
        pageStatus.textContent = "生成失败，请重试";
        NKS.toast(error.message || "生成失败，请重试", "error");
      }
    });

    addAgentMessage("您好！我是岗位 Agent 工厂的智能助手。接下来我会通过 6 个问题了解您的企业，请逐一回答。", "");

    window.setTimeout(function () {
      askNextQuestion();
    }, 600);
