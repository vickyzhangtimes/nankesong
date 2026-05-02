// —— 工具：脱敏显示手机号 ——
    function maskPhone(p) {
      if (!p || p.length < 7) return p;
      return p.slice(0, 3) + ' **** ' + p.slice(-4);
    }

    // —— 选项卡：邮箱标"即将上线"，点了不切换 ——
    document.querySelectorAll('#tabs .tab').forEach(t => {
      t.addEventListener('click', () => {
        if (t.dataset.tab === 'email') {
          alert('邮箱密码登录即将上线，路演现场请用「手机验证码」或「演示账号一键登录」');
          return;
        }
      });
    });

    // —— 验证码倒计时 ——
    const sendBtn = document.getElementById('send-code');
    const phoneEl = document.getElementById('phone');
    const codeSent = document.getElementById('code-sent');
    const phoneHint = document.getElementById('phone-hint');
    const masked = document.getElementById('masked-phone');

    sendBtn.addEventListener('click', () => {
      const v = phoneEl.value.trim();
      // 简单校验：+86 走 11 位，其他放过
      const region = document.getElementById('region').value;
      const valid = region === '+86' ? /^1[3-9]\d{9}$/.test(v) : v.length >= 5;
      if (!valid) {
        phoneHint.classList.add('show');
        phoneEl.focus();
        return;
      }
      phoneHint.classList.remove('show');

      // 显示已发送
      masked.textContent = maskPhone(v);
      codeSent.classList.add('show');

      // 倒计时 60s
      sendBtn.classList.add('cooling');
      let s = 60;
      sendBtn.textContent = `${s}s 后重发`;
      const timer = setInterval(() => {
        s--;
        if (s <= 0) {
          clearInterval(timer);
          sendBtn.classList.remove('cooling');
          sendBtn.textContent = '重新发送';
        } else {
          sendBtn.textContent = `${s}s 后重发`;
        }
      }, 1000);
    });

    // —— 提交登录 ——
    document.getElementById('phone-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const code = document.getElementById('code').value.trim();
      const codeHint = document.getElementById('code-hint');
      const agree = document.getElementById('agree').checked;
      if (!agree) {
        alert('请先勾选同意《用户协议》与《隐私政策》');
        return;
      }
      // 演示规则：只有 123456 通过
      if (code !== '123456') {
        codeHint.classList.add('show');
        return;
      }
      codeHint.classList.remove('show');
      // 写入登录态（演示用）
      try {
        localStorage.setItem('nks_user', JSON.stringify({
          name: '张小北',
          phone: phoneEl.value.trim(),
          loginAt: Date.now(),
        }));
      } catch (e) {}
      // 进入完整用户里程起点：企业认知与空间
      location.href = '../company-onboarding/index.html';
    });

    // —— 演示账号一键登录 ——
    document.getElementById('demo-login').addEventListener('click', () => {
      try {
        localStorage.setItem('nks_user', JSON.stringify({
          name: '张小北',
          phone: '138 **** 8888',
          loginAt: Date.now(),
          isDemo: true,
        }));
      } catch (e) {}
      location.href = '../company-onboarding/index.html';
    });
