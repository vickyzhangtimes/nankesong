/* ============================================================
 * 岗位 Agent 工厂 · 全链路兜底数据
 * 两个演示企业：hongke（虹科 · ToB 科技）/ longxia（校服龙虾 · 服装制造）
 * 真实素材来源：
 *   hongke  ← 20260423 AI 岗位交流会议逐字稿
 *   longxia ← 校服生产销售企业 OpenClaw 流程优化场景梳理表
 *
 * 用法：
 *   <script src="./assets/mock-data.js"></script>
 *   const data = window.DEMO_DATA[window.NKS.getCompany()];
 * ============================================================ */
(function () {
  const HONGKE = {
    key: 'hongke',
    label: '虹科 · ToB 科技',
    enterprise_identity: {
      enterprise_name: '虹科',
      website: 'https://www.hkaco.com',
      industry: 'ToB 科技 / 工业数字化',
      scale: '中型企业 · 集团市场部约 10% 人员',
      main_customers: ['汽车 OEM 与 Tier1', '工业品客户', '医疗 / 制造业'],
      main_products: ['汽车研发测试工具链', '自动驾驶仿真测试', '车用总线与电子架构测试', '工业传感器与显示屏'],
      tone: '专业、克制、技术可信',
      business_goals: ['提升内容生产效率', '提升获客与订单转化', '强化市场洞察体系化'],
      risk_rules: [
        '不编造技术参数',
        '不夸大产品能力',
        '不自动发布到任何平台',
        '客户案例需脱敏',
      ],
    },
    libraries: [
      { name: '企业库', scope: '全公司', items: ['公司介绍.pdf', '品牌语气规范.md', '通用红线清单.md'], status: '已上传' },
      { name: '市场部库', scope: '市场部', items: ['公众号历史文章 32 篇', '知乎技术专栏 14 篇', 'LinkedIn 风格样例.md'], status: '已上传' },
      { name: '当前任务资料', scope: '本次任务', items: ['AI 岗位交流会议-逐字稿.docx'], status: '已解析' },
    ],
    raw_demand: {
      title: '虹科 AI 岗位交流会议-逐字稿（节选）',
      excerpt: '市场部内容生产太慢。英文技术资料要翻译并改成公众号、知乎、LinkedIn、小红书等 10 个平台。每平台风格不一样，实习生搬运很累。行业洞察没人持续做，发布后数据复盘弱。担心 AI 写得太营销，也不能编造技术参数。',
    },
    routing_decision: {
      decision: 'add_workflow',
      target_agent: '市场部 · ToB 内容增长 Agent',
      reason: '该需求属于市场部内容增长岗位内的重复流程，不新建岗位 Agent。',
      action: '在现有 Agent 下新增 "技术资料多平台改写" workflow',
      not_create_reason: '它仍属于内容增长岗位，不是独立岗位职责',
    },
    diagnosis_metrics: [
      { name: '多平台改写耗时', baseline: '8h/篇', target: '≤ 4.5h/篇' },
      { name: 'workflow 复用率', baseline: '12%', target: '≥ 60%' },
      { name: '人工修改率', baseline: '38%', target: '≤ 15%' },
      { name: '技术事实错误率', baseline: '6%', target: '≤ 1%' },
    ],
    seven_skeleton: [
      { idx: 1, title: '岗位边界', items: ['负责技术资料内容化、多平台草稿、复盘建议', '不负责最终发布、预算决策、技术参数确认'] },
      { idx: 2, title: '工作顺序', items: ['读资料 → 提卖点 → 选题', '多平台改写 → 红线检查 → 反馈学习'] },
      { idx: 3, title: '质量标准', items: ['专业准确，符合 ToB 科技语气', '标题克制，可被销售/市场复用'] },
      { idx: 4, title: '质量红线', items: ['不编造技术参数，不夸大产品能力', '不自动发布，不泄露内部资料'] },
      { idx: 5, title: '交付契约', items: ['公众号 / 知乎 / LinkedIn / 小红书 草稿', '配图 prompt + 人工确认清单'] },
      { idx: 6, title: '工具目录', items: ['企业库 + 市场部库读取', '术语表 / 平台风格模板', '反馈规则注入'] },
      { idx: 7, title: '学习回路', items: ['用户反馈 → 写入规则库', '次次产出更专业'] },
    ],
    agent_birth_card: {
      avatar_emoji: '🥔',
      name: '小薯',
      employee_id: 'AGT-MKT-003',
      title: 'ToB 内容增长专员',
      department: '市场部',
      kpi: '周产 4 平台 × 1 篇技术内容，技术错误率 ≤ 1%',
      tasks_i_can_do: ['多平台改写', '行业洞察简报', '配图 prompt 生成', '内容复盘'],
      red_lines: ['不自动发布', '不编造技术参数', '客户案例需脱敏'],
      opening: '你好，我是小薯，市场部 ToB 内容增长专员，工号 AGT-MKT-003。我会读取企业库与市场部库，但不会编造数据，也不会未经确认发布。',
    },
    task_v1: {
      input_summary: '英文技术稿《Vehicle Bus Test Toolchain v3》→ 公众号 + 知乎 + LinkedIn + 小红书',
      memory_used_count: 6,
      memory_used: ['企业身份证', '市场部品牌语气', '公众号历史 32 篇', '术语表', '红线规则', '平台样例'],
      outputs: [
        { platform: '公众号', title: '【重磅发布】下一代汽车总线测试工具链来了！3 大颠覆性突破，定义行业新标准', body: '在汽车智能化的浪潮下，虹科凭借多年深耕，正式推出业界领先的车用总线测试工具链 v3，性能炸裂提升 200%……' },
        { platform: '知乎', title: '虹科车用总线测试工具链 v3 速览', body: '面向 OEM 与 Tier1 测试团队，v3 在 CAN FD/Ethernet 多协议并发场景下实测延迟降低 35% ……' },
        { platform: 'LinkedIn', title: 'HongKe Bus Test Toolchain v3', body: 'Built for OEM & Tier1 R&D teams, v3 delivers 35% lower latency in concurrent CAN FD / Automotive Ethernet test ……' },
        { platform: '小红书', title: '工程师在用什么工具测车？🚗', body: '今天来扒一扒车厂研发同事都在用的硬核工具——虹科 v3，超能打 ✨' },
      ],
    },
    feedback: {
      raw: '标题太营销了，不够专业，知乎那篇也偏夸张。',
      rules_added: [
        '标题应偏技术可信感，避免"重磅 / 颠覆性 / 炸裂"等夸张词',
        '关键英文术语保留（CAN FD / Automotive Ethernet 等）',
        'ToB 技术内容优先场景与业务价值，弱化营销修辞',
      ],
    },
    task_v2: {
      memory_used_count: 9,
      outputs: [
        { platform: '公众号', title: '虹科车用总线测试工具链 v3：在 CAN FD 与车载以太网并发场景下，实测延迟降低 35%', body: '面向 OEM 与 Tier1 研发团队，v3 在多协议并发的实际工况下提供更稳定的端到端测试能力……', diff: ['标题', '开头'] },
        { platform: '知乎', title: '虹科 v3 在 CAN FD/Automotive Ethernet 并发测试中的延迟实测', body: '本文从协议栈视角拆解 v3 的并发测试架构与延迟数据……', diff: ['标题'] },
      ],
    },
    roster: [
      { id: 'AGT-MKT-003', name: '小薯', title: 'ToB 内容增长专员', department: '市场部', status: 'V2 · 正在工作', tasks_done: 12 },
      { id: 'AGT-MKT-004', name: '小线', title: '客户线索整理专员', department: '市场部', status: 'V2 · 正在工作', tasks_done: 8 },
      { id: 'AGT-OPS-001', name: '小渠', title: '渠道合规审核专员', department: '运营部', status: '待启用', tasks_done: 0 },
    ],
    secondary_agent: {
      avatar_emoji: '📞',
      name: '小线',
      employee_id: 'AGT-MKT-004',
      title: '客户线索整理专员',
      department: '市场部',
      kpi: '每周汇总线索 ≥ 200 条，跟进提醒覆盖率 100%',
      tasks_i_can_do: ['线索去重与合并', '客户摄要整理', '下一步跟进清单', '商机评分'],
      red_lines: ['不伪造客户信息', '不跳过销售审核发送外部', '不泄露客户隐私于跨部门'],
      opening: '你好，我是小线，市场部客户线索整理专员，工号 AGT-MKT-004。我会把多源线索汇总去重、生成跟进清单，但不会代表销售发送任何外部信息。',
    },
    secondary_task_v1: {
      input_summary: 'CES 2026 展会营销表单 + 官网表单 + 销售手动记录 → 客户摄要 + 跟进清单',
      memory_used_count: 5,
      memory_used: ['企业身份证', '销售跟进 SOP', '客户分级规则', '红线规则', '去重字段表'],
      outputs: [
        { platform: '客户摄要', title: 'CES 2026 高意向客户 36 位', body: 'A 类（遇到过需求）：12；B 类（明确项目）：8；C 类（粗选）：16。已去重并与 CRM 库比对，新增客户 22 人。' },
        { platform: '跟进清单', title: '下周跟进 36 项（已按优先级排序）', body: '高优先 12 项（需销售亲自联系） / 中优先 8 项（备选邮件跳发） / 低优先 16 项（进营销池）。' },
        { platform: '商机评分', title: '商机评分 Top 5【仅供内部】', body: '某 OEM 智能驾驶 BU、5A；某 Tier1 测试部、4A……' },
      ],
    },
    secondary_feedback: {
      raw: '「C 类」不要直接进营销池，要先补企业信息再打分；高优先邮件不要你发，只生成草稿。',
      rules_added: [
        'C 类客户需补齐 5 字段后才能进营销池，缺字段一律进「待补齐」状态',
        '高优先跟进仅生成邮件草稿，标「需销售人工发送」，不自动发送',
        '商机评分 ≥ 4A 一律进「销售领导审核」问责，不直接下发',
      ],
    },
    secondary_task_v2: {
      memory_used_count: 8,
      outputs: [
        { platform: '客户摄要', title: 'CES 2026 高意向客户 36 位（v2）', body: 'C 类 16 人中 9 人进「待补齐」状态，7 人补齐后进营销池；A/B 类保持不变。', diff: ['C 类路径'] },
        { platform: '跟进清单', title: '下周跟进 36 项（v2）', body: '高优先 12 项只生成草稿（需销售亲自发）；中优先 8 项保留备选邮件；低优先 7 项（已补齐）进营销池。', diff: ['高优先草稿化', '低优先补齐门槛'] },
      ],
    },
  };

  const LONGXIA = {
    key: 'longxia',
    label: '林蔷 · 服装制造',
    enterprise_identity: {
      enterprise_name: '林蔷',
      website: 'https://www.example-uniform.com',
      industry: '服装制造 · 校服生产与销售',
      scale: '中型企业 · 商品 / 财务 / 设计 / 工厂多部门协同',
      main_customers: ['学校采购方', '家长终端', '区域代理'],
      main_products: ['校服整套（春夏秋冬）', '运动服', '配饰与定制款'],
      tone: '严谨、流程化、可追溯',
      business_goals: ['资料标准化', '流程自动化', '老师傅经验 Skill 化'],
      risk_rules: [
        '人工最终复核，AI 不替代核心决策',
        '特体尺码必须人工确认',
        '财务付款不自动审批，仅做预审',
        '不替代 CAD 制版与专业排版',
      ],
    },
    libraries: [
      { name: '企业库', scope: '全公司', items: ['公司介绍.pdf', '业务流程总览.md', '风险红线清单.md'], status: '已上传' },
      { name: '商品部库', scope: '商品部', items: ['校服编码规则 v2.md', '历史尺码档案 18 校', '条码模板.xlsx'], status: '已上传' },
      { name: '当前任务资料', scope: '本次任务', items: ['新校尺码原始表-混乱版.xlsx', '特体名单.docx'], status: '已解析' },
    ],
    raw_demand: {
      title: '校服生产销售企业 OpenClaw 流程优化场景梳理表（节选）',
      excerpt: '商品部学生尺码收集与整理：原始数据不统一、表格合并耗时、字段易出错、异常值人工筛查难、特体尺码需经验判断、人力耗费在基础整理。期望 AI 完成多格式识别、表格合并、异常清洗、尺码初步推荐、异常标记，并生成复核 / 最终表。',
    },
    routing_decision: {
      decision: 'new_role_agent',
      target_agent: '商品部 · 尺码整理流程助理 Agent',
      reason: '当前没有任何 Agent 负责"原始混乱数据 → 标准尺码表"这个岗位，需新建独立岗位 Agent。',
      action: '新建岗位 Agent，绑定商品部库与编码规则',
      not_create_reason: null,
    },
    diagnosis_metrics: [
      { name: '单批整理耗时', baseline: '6h/校', target: '≤ 1h/校' },
      { name: '异常漏检率', baseline: '11%', target: '≤ 2%' },
      { name: '特体识别准确率', baseline: '72%', target: '≥ 95%（人工复核兜底）' },
      { name: '系统录入错误率', baseline: '5%', target: '≤ 0.5%' },
    ],
    seven_skeleton: [
      { idx: 1, title: '岗位边界', items: ['负责数据识别 / 清洗 / 合并 / 异常标记 / 复核表生成', '不负责特体最终决策、不直接系统提交'] },
      { idx: 2, title: '工作顺序', items: ['读多源原始表 → 字段对齐 → 异常清洗', '尺码初步推荐 → 标记特体 → 输出复核 / 最终表'] },
      { idx: 3, title: '质量标准', items: ['字段命名 100% 符合编码规则', '所有异常必须可追溯到原始行'] },
      { idx: 4, title: '质量红线', items: ['特体不自动决策，必须人工复核', '原始数据不允许覆盖，仅追加版本'] },
      { idx: 5, title: '交付契约', items: ['标准尺码表 .xlsx', '异常清单 .xlsx', '人工复核清单 .pdf'] },
      { idx: 6, title: '工具目录', items: ['多格式数据识别', '编码规则库', '异常阈值规则', '复核表模板'] },
      { idx: 7, title: '学习回路', items: ['人工修正 → 沉淀新阈值规则', '下批数据自动应用'] },
    ],
    agent_birth_card: {
      avatar_emoji: '📏',
      name: '小尺',
      employee_id: 'AGT-PRD-001',
      title: '尺码整理流程助理',
      department: '商品部',
      kpi: '单校 ≤ 1h 出标准表，异常漏检率 ≤ 2%',
      tasks_i_can_do: ['多格式数据识别', '表格合并清洗', '异常标记', '复核表生成'],
      red_lines: ['特体必须人工复核', '不直接系统提交', '原始数据不可覆盖'],
      opening: '你好，我是小尺，商品部尺码整理流程助理，工号 AGT-PRD-001。我会按编码规则整理表格，但特体尺码我一定会留给你拍板。',
    },
    task_v1: {
      input_summary: '某中学高一新生原始尺码表 312 条 → 标准尺码表 + 异常清单',
      memory_used_count: 5,
      memory_used: ['企业身份证', '商品部编码规则 v2', '历史尺码档案 18 校', '异常阈值规则', '复核表模板'],
      outputs: [
        { platform: '标准尺码表（节选）', title: '高一新生标准尺码表 v1', body: '编号 001 · 张某某 · 165/80A\n编号 002 · 王某某 · 170/84A\n编号 003 · 李某某 · 160/76A（疑似偏小）\n……' },
        { platform: '异常清单', title: '异常 23 条', body: '12 条字段缺失、6 条尺码超阈值、5 条特体待确认（含 165/96B、180/72A 等）' },
      ],
    },
    feedback: {
      raw: '165/96B 这种特体直接归 96B 不对，要单独标"待人工复核"，不要给推荐值。',
      rules_added: [
        '特体（胸围-腰围差 > 18cm 或低于阈值）一律标记 "待人工复核"，不给推荐值',
        '复核清单中特体行加红色高亮',
        '推荐尺码栏对特体留空，避免误用',
      ],
    },
    task_v2: {
      memory_used_count: 8,
      outputs: [
        { platform: '标准尺码表（节选）', title: '高一新生标准尺码表 v2', body: '编号 001 · 张某某 · 165/80A\n编号 002 · 王某某 · 170/84A\n编号 015 · 赵某某 · 165/96B · 待人工复核（红）\n……', diff: ['特体行处理'] },
        { platform: '异常清单', title: '异常 23 条 + 特体复核 5 条', body: '5 条特体单独成区，红色高亮，推荐尺码栏留空。', diff: ['特体单独成区'] },
      ],
    },
    roster: [
      { id: 'AGT-PRD-001', name: '小尺', title: '尺码整理流程助理', department: '商品部', status: 'V2 · 正在工作', tasks_done: 18 },
      { id: 'AGT-FIN-002', name: '小账', title: '财务费用归集助理', department: '财务部', status: 'V2 · 正在工作', tasks_done: 11 },
      { id: 'AGT-DSN-001', name: '小图', title: '批量套图执行助理', department: '设计部', status: '待启用', tasks_done: 0 },
    ],
    secondary_agent: {
      avatar_emoji: '💰',
      name: '小账',
      employee_id: 'AGT-FIN-002',
      title: '财务费用归集助理',
      department: '财务部',
      kpi: '月度费用归类准确率 ≥ 98%，异常项 100% 标记人工复核',
      tasks_i_can_do: ['多格式费用表识别', '费用项目归类', '生成异常清单', '输出复核表'],
      red_lines: ['不自动审批付款', '不代替财务复核', '不改写原始凭证'],
      opening: '你好，我是小账，财务部费用归集助理，工号 AGT-FIN-002。我会按财务科目表归类费用并标记异常，但不会代你审批任何付款。',
    },
    secondary_task_v1: {
      input_summary: '4 月全公司费用报销原始表 487 条（差旅/营销/办公/其他混装）→ 归类汇总 + 异常清单',
      memory_used_count: 5,
      memory_used: ['企业身份证', '财务科目表 v3', '历史费用归类样本', '异常阈值规则', '复核表模板'],
      outputs: [
        { platform: '归类汇总表', title: '4 月费用归类汇总 v1', body: '差旅费 ¥28,400 / 营销费 ¥41,200 / 办公费 ¥16,800 / 待人工判断 ¥9,600。总计 487 条中 412 条自动归类成功。' },
        { platform: '异常清单', title: '异常 18 条', body: '超阈值 6 条（单笔 > ¥5000） / 发票与报销人不一致 4 条 / 备注模糊 8 条。' },
        { platform: '复核表（节选）', title: '待复核 18 条，重点 6 条超阈值', body: '金额 / 部门 / 报销人 / 原因描述 / AI 初判 / 人工复核意见（6 列）。' },
      ],
    },
    secondary_feedback: {
      raw: '「与供应商饭局」这种不要默认进「营销费」，要看是否含项目号；超 5000 不够，补一条 ¥1 万以上必须附 PDF 发票。',
      rules_added: [
        '含「供应商/客户/项目号」的餐饮费需人工确认是「营销费」或「项目费」，不自动归类',
        '单笔≥5000 且未附 PDF 发票一律标「凭证不全」，进异常清单',
        '备注模糊、金额≥1万的报销一律标「人工复核」，不给归类推荐',
      ],
    },
    secondary_task_v2: {
      memory_used_count: 8,
      outputs: [
        { platform: '归类汇总表', title: '4 月费用归类汇总 v2', body: '备注含「供应商」的 11 条餐饮费从营销费移出，进「人工复核」；总费用金额重新汇总。', diff: ['餐饮费路径'] },
        { platform: '异常清单', title: '异常 18 + 7 条（新增凭证不全）', body: '新增 7 条「凭证不全」条目（超 5000 不附 PDF），需补发票后重新提交。', diff: ['凭证不全门槛', '人工复核路径'] },
      ],
    },
  };

  // —— 6 个引导问题（用于"创建企业空间"那个 Q&A 卡片）——
  const ONBOARDING_QUESTIONS = [
    { idx: 1, q: '请问贵公司的名称是什么？', field: 'enterprise_name' },
    { idx: 2, q: '请提供贵公司的官方网站（如暂无可填写"暂无"）。', field: 'website' },
    { idx: 3, q: '请问贵公司所属的行业是什么？', field: 'industry' },
    { idx: 4, q: '贵公司的主要客户群体是谁？（可简要描述）', field: 'main_customers' },
    { idx: 5, q: '贵公司当前的业务目标是什么？（可多选或简要描述）', field: 'business_goals' },
    { idx: 6, q: '在使用 AI 员工过程中，贵公司的风险红线或合规要求是什么？', field: 'risk_rules' },
  ];

  const ONBOARDING_LABELS = {
    enterprise_name: '企业名称',
    website: '官方网站',
    industry: '所属行业',
    main_customers: '主要客户',
    business_goals: '业务目标',
    risk_rules: '风险红线',
  };

  function finalizeCompany(c) {
    var id = c.enterprise_identity;
    id.industry_judgement = id.industry;
    id.customer_type = id.main_customers ? id.main_customers.slice() : [];
    id.business_goal = id.business_goals ? id.business_goals.slice() : [];
    if (!id.status) id.status = '已生成';
    if (!id.confidence) id.confidence = '高';
    c.display_name = id.enterprise_name;
    c.workspace_name = id.enterprise_name + ' · 企捏捏空间';
    c.onboarding = {
      eta: '约 1 分钟',
      collected_hint: '可随时在右侧摘要中核对已填信息。',
      questions: ONBOARDING_QUESTIONS.map(function (row) {
        return {
          id: row.field,
          label: ONBOARDING_LABELS[row.field] || row.field,
          question: row.q,
        };
      }),
    };
    c.demand_input = {
      recommended_title: '推荐：粘贴会议纪要或需求片段',
      sample_text: c.raw_demand && c.raw_demand.excerpt ? c.raw_demand.excerpt : '',
      upload_title: '上传需求文档',
      upload_hint: '支持 Word / PDF / 飞书妙记导出',
      formats: 'Word · PDF · TXT',
      limit: '单文件 ≤ 20MB',
      memory_hint: '系统将结合企业库与部门库进行归类',
      feedback_text: c.feedback && c.feedback.raw ? c.feedback.raw : '',
    };
    c.enterprise_library = {
      name: '企业库',
      description: '企业级通用资产与红线',
      upload_hint: '拖拽或点击上传',
      formats: 'PDF · Word · MD',
      limit: '单文件 ≤ 20MB',
      tags: ['产品介绍', '品牌规范', '红线'],
    };
    c.department_library = {
      name: '部门库',
      description: '部门专属模板与语料',
      upload_hint: '拖拽或点击上传',
      formats: 'Excel · PDF · MD',
      limit: '单文件 ≤ 20MB',
      tags: ['模板', '样例', '术语表'],
    };
    var rd = c.routing_decision;
    rd.match_label = rd.match_label || '胜任匹配';
    rd.match_score = rd.match_score || '92%';
    c.route_options = [
      { title: '在现有 Agent 下新增 workflow', status: '推荐', tone: 'recommended', reason: '与路由结论一致，改动最小。' },
      { title: '合并到邻近岗位职责', status: '备选', tone: 'warning', reason: '需评估职责边界清晰度。' },
      { title: '新建独立岗位 Agent', status: '不推荐', tone: 'danger', reason: '除非出现全新岗位职责，否则不建议。' },
    ];
    c.evidence = {
      recognized_info: [id.enterprise_name, id.industry],
      key_problems: c.raw_demand && c.raw_demand.excerpt ? [String(c.raw_demand.excerpt).slice(0, 120) + '…'] : [],
      memory_refs: ['企业身份证', '部门红线', '历史样例'],
    };
    c.workbench_run = {
      current_agent: rd.target_agent,
      task: c.task_v1 && c.task_v1.input_summary ? c.task_v1.input_summary : '',
      memory_state: '已读取企业库',
      iteration_state: 'V2 已生成',
    };
    c.v1_output = {
      title: 'V1 初稿概览',
      summary: c.feedback && c.feedback.raw ? c.feedback.raw : '待用户反馈',
      issues: ['语气偏营销', '部分表述需核对事实'],
    };
    c.v2_output = {
      title: 'V2 优化概览',
      summary: '已按反馈收紧语气与事实表述',
      improvements: c.feedback && c.feedback.rules_added ? c.feedback.rules_added.slice() : [],
    };
    c.memory_writeback = {
      version_from: 'V1',
      version_to: 'V2',
      rules: c.feedback && c.feedback.rules_added ? c.feedback.rules_added.slice() : [],
      status: '已写入企业记忆',
      note: '全员 Agent 下次运行自动生效',
    };
    c.export_options = [
      { type: 'pdf', label: '导出 PDF', description: '含对比与审批流' },
      { type: 'doc', label: '导出 Word', description: '便于法务留存' },
    ];
    var ab = c.agent_birth_card;
    if (ab) {
      ab.agent_id = ab.agent_id || ab.employee_id;
      ab.status = ab.status || '已就绪';
      ab.role = ab.role || ab.title;
      ab.persona_line = ab.persona_line || ab.opening;
      ab.responsibilities = ab.responsibilities || ab.tasks_i_can_do || [];
      ab.memory_status = ab.memory_status || {
        read_count: c.task_v1 && c.task_v1.memory_used_count ? c.task_v1.memory_used_count : 0,
        read_items: c.task_v1 && c.task_v1.memory_used ? c.task_v1.memory_used.slice() : [],
      };
    }
    return c;
  }

  finalizeCompany(HONGKE);
  finalizeCompany(LONGXIA);

  // —— 给两家附加 secondary_* 闭环数据派生（v1_output / v2_output / workbench_run / memory_writeback）——
  function finalizeSecondary(c) {
    var sec = c.secondary_agent;
    var t1 = c.secondary_task_v1;
    var fb = c.secondary_feedback;
    var t2 = c.secondary_task_v2;
    if (!sec || !t1) return;
    c.secondary_workbench_run = {
      current_agent: (sec.department || '') + ' · ' + (sec.title || ''),
      task: t1.input_summary || '',
      memory_state: '已读取企业库',
      iteration_state: t2 ? 'V2 已生成' : 'V1 已生成',
    };
    c.secondary_v1_output = {
      title: 'V1 初稿概览',
      summary: (t1.outputs && t1.outputs[0] && t1.outputs[0].title) || '',
      issues: c._secondary_v1_issues || ['路径偏向默认归类', '高优先级处置过于激进'],
    };
    c.secondary_v2_output = {
      title: 'V2 优化概览',
      summary: '已按反馈收紧门槛与人工复核路径',
      improvements: (fb && fb.rules_added) ? fb.rules_added.slice() : [],
    };
    c.secondary_memory_writeback = {
      version_from: 'V1',
      version_to: 'V2',
      rules: (fb && fb.rules_added) ? fb.rules_added.slice() : [],
      status: '已写入企业记忆',
      note: '全员 Agent 下次运行自动生效',
    };
  }
  finalizeSecondary(HONGKE);
  finalizeSecondary(LONGXIA);

  window.DEMO_DATA = {
    hongke: HONGKE,
    longxia: LONGXIA,
    onboarding_questions: ONBOARDING_QUESTIONS,
  };
})();
