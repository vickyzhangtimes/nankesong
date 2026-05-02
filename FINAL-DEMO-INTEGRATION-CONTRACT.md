# 南客松最终 Demo 页面与后端/大模型接入合同

> 版本：2026-05-03 locked draft  
> 范围：`deliverables/_github_sync_wlxhz_nankesong` 前端演示包  
> 目标：让前端、后端、模型同学按同一条业务链路对页面、表、接口和大模型输出。

## 0. 结论

本次比赛不要再扩页面。最终演示锁定为：

- 当前物理页面目录：16 个。
- 正式主业务链路：9 个页面。
- 正式可回看/管理页：1 个页面。
- 演示入口/备查页：2 个页面。
- legacy / 弃用页：4 个页面，不接后端，不进主 Demo。

主 Demo 一句话：

```text
企业先建立企业身份与资料库 -> 输入/上传真实混乱需求 -> 大模型识别并填满七层岗位骨架 -> 确认 AI 员工 -> 进入工作台执行真实任务 -> 反馈生成 V2 并写回企业记忆。
```

第一条真实业务场景锁定：

```text
林蔷 / 校服制造 / 商品部尺码整理
真实输入：混乱 Excel / 图片表格 / 文本名单 / 特体名单 / 商品部编码规则
真实识别：大模型判断该需求需要新建“商品部 / 尺码整理流程助理 Agent”，并填满七层岗位骨架
真实执行：小尺读取资料，生成标准尺码表、异常清单、人工复核清单，并导出 Excel
```

第二条备选场景：

```text
虹科 / ToB 科技企业 / 市场部内容增长
用途：备份演示“不是所有需求都新建 Agent，而是可归入现有 Agent 并新增 workflow”；不作为 3 分钟主线真实产物。
```

选择理由：

- 评委能直接看到一个“从需求生成新 Agent”的完整链路。
- Excel 文件是可验证产物，比内容文案更不容易被看成普通 prompt 生成。
- 小尺场景天然包含“文件识别、表格清洗、异常标记、人工复核、导出”五个真实业务动作。
- 虹科内容增长仍保留为答辩支线，用来说明系统有编制治理能力：该新建时新建，不该新建时只新增 workflow。

重要安全约束：

- 前端不能保留真实 LLM API Key。当前 `assets/llm-config.js` 只适合本地演示，接后端时必须改成后端代理。
- 文件上传、模型调用、记忆写回都走后端接口。
- 任何自动发布、外部发送、删除、付款类动作不进本次 Demo。

## 1. 最终页面总数与分类

| 类别 | 数量 | 页面 | 是否接后端 | 说明 |
|---|---:|---|---|---|
| 主业务链路 | 9 | `login`, `company-onboarding`, `enterprise-memory`, `demand-diagnosis`, `job-agent-workbench`, `agent-birth-card`, `job-agent-workbench-prototype`, `feedback-evolution`, `ai-employee-roster` | 是 | 这是比赛正式闭环 |
| 对外入口/讲解 | 1 | `landing` | P1 | 可接静态配置，不影响主链路 |
| 演示 Hub / 备查 | 1 | `product-demo-hub` | P2 | 只做主持人跳转、备查，不作为业务真链路 |
| 根入口 | 1 | `app.html` / `index.html` | P2 | 本地启动入口，可保留 |
| 弃用/旧版 | 4 | `agent-birth-card-legacy`, `agent-birth-card-share-demo`, `job-agent-workbench-legacy`, `job-agent-workbench-prototype-legacy` | 否 | 不再维护接口 |
| 支线旧页 | 1 | `agent-employee` | 否 | 员工详情旧支线，主线用 `agent-birth-card` + `ai-employee-roster` |

主线页面顺序：

```text
landing/index.html
-> login/index.html
-> company-onboarding/index.html
-> enterprise-memory/index.html
-> demand-diagnosis/index.html
-> job-agent-workbench/index.html
-> agent-birth-card/index.html
-> job-agent-workbench-prototype/index.html
-> feedback-evolution/index.html
-> ai-employee-roster/index.html
```

比赛现场 3 分钟可以从 `login` 或 `company-onboarding` 开始。若时间紧，从下面直达页开始也成立：

```text
pages/demand-diagnosis/index.html
```

## 2. 页面跳转逻辑

| 当前页 | 主按钮/动作 | 下一页 | 状态写入 |
|---|---|---|---|
| `landing` | 立即体验 | `login` | 无 |
| `login` | Demo 登录/验证码登录 | `company-onboarding` | `nks_user` |
| `company-onboarding` | 生成企业空间 | `enterprise-memory` | `enterprise.onboardingAnswers` |
| `enterprise-memory` | 开始需求诊断 | `demand-diagnosis` | `demand.raw_demand`, 上传资料摘要 |
| `demand-diagnosis` | 开始诊断/确认诊断 | `job-agent-workbench` | `rawDemand`, `demandText`, `demandDiagnosis`, `routingDecision`, `sevenSkeleton`, `agentProfile` |
| `job-agent-workbench` | 识别并填满七层骨架 | 本页刷新骨架 | `rawDemand`, `demandText`, `demandDiagnosis` |
| `job-agent-workbench` | 确认并进入员工诞生卡 | `agent-birth-card` | `agentProfile`, `currentAgent`, `sevenSkeleton` |
| `agent-birth-card` | 给 AI 员工第一个任务 | `job-agent-workbench-prototype` | `currentAgent`, `agentProfile` |
| `job-agent-workbench-prototype` | 开始执行任务 | 本页展示 V1 | `currentTask`, `taskV1`, `activeAgentKey` |
| `job-agent-workbench-prototype` | 完成本次任务，进入反馈进化 | `feedback-evolution` | 读取 `taskV1` |
| `feedback-evolution` | 生成 V2 / 保存记忆 | 本页展示 V2，再回 `enterprise-memory` 或 `ai-employee-roster` | `feedbackSession`, `memory`, `taskV2` |
| `ai-employee-roster` | 选择员工/继续交办 | `job-agent-workbench-prototype?agent=...` | `selectedEmployee`, `activeAgentKey` |

## 3. 全局状态与后端实体映射

当前前端用 `localStorage` 跑通演示。后端接入时按下面实体替换。

| 当前前端字段 | 后端实体/表建议 | 说明 |
|---|---|---|
| `nks_user` | `users`, `auth_sessions` | 登录用户 |
| `nks_company` | `enterprise_spaces.key` | 当前演示企业：`hongke` / `longxia` |
| `enterprise.onboardingAnswers` | `enterprise_onboarding_messages` | 创建企业空间时的对话答案 |
| `enterprise.identity` | `enterprise_profiles` | 企业身份画像 |
| `demand.raw_demand` / `rawDemand` / `demandText` | `demand_inputs.raw_text` | 用户输入的真实混乱需求 |
| 上传文件名/资料 chips | `material_files`, `knowledge_items` | 企业资料、部门资料、本次任务资料 |
| `demandDiagnosis` | `demand_diagnoses` | 一次完整模型诊断 bundle |
| `routingDecision` | `route_decisions` | 复用/新增 workflow/新建岗位判断 |
| `diagnosisMetrics` | `diagnosis_metrics` | 4 个可量化业务指标 |
| `sevenSkeleton` | `seven_skeleton_layers` | 七层岗位骨架 |
| `agentProfile` / `currentAgent` | `agent_profiles` | AI 员工档案 |
| `currentTask` | `agent_tasks` | 当前交办任务 |
| `taskV1` | `agent_runs`, `run_outputs` | 执行记录和 V1 产物 |
| `feedbackSession` | `feedback_sessions` | 用户反馈 |
| `memory` / `rules_added` | `memory_rules`, `knowledge_items` | 写回企业记忆的规则 |
| `taskV2` | `run_versions`, `run_outputs` | V2 产物与版本 |

最小数据库表建议：

```text
users
enterprise_spaces
enterprise_profiles
enterprise_onboarding_messages
material_files
knowledge_items
demand_inputs
demand_diagnoses
route_decisions
diagnosis_metrics
seven_skeleton_layers
agent_profiles
agent_capabilities
agent_boundaries
agent_tasks
agent_runs
run_outputs
feedback_sessions
memory_rules
run_versions
audit_events
```

## 4. 接口口径

统一前缀建议：

```text
http://127.0.0.1:8000/api/v1
```

前端演示包当前运行在：

```text
http://127.0.0.1:8088/projects/sprints/nankesong-2026/deliverables/_github_sync_wlxhz_nankesong/
```

P0 必须打通的接口：

| 接口 | 方法 | 页面触发 | 用途 |
|---|---|---|---|
| `/auth/demo-login` | POST | `login` | 生成演示 session |
| `/enterprise-spaces` | POST | `company-onboarding` | 创建企业空间 |
| `/enterprise-spaces/{space_id}/identity:generate` | POST | `company-onboarding` / `enterprise-memory` | 生成企业身份画像 |
| `/materials` | POST multipart | `enterprise-memory`, `job-agent-workbench` | 上传企业/部门/任务资料 |
| `/materials/{material_id}:parse` | POST | 上传后 | 文件解析、OCR、表格抽取、摘要 |
| `/demand-recognitions` | POST | `job-agent-workbench` 的识别按钮 | 核心接口：识别需求并填满七层骨架 |
| `/demand-diagnoses/{diagnosis_id}:confirm` | POST | `job-agent-workbench` 确认按钮 | 确认诊断与骨架 |
| `/agent-profiles` | POST | `agent-birth-card` 前 | 生成 AI 员工档案 |
| `/agent-profiles/{agent_id}:activate` | POST | `agent-birth-card` 主按钮 | 员工上岗 |
| `/agent-runs` | POST | `job-agent-workbench-prototype` 开始执行 | 执行一次任务，返回 V1 |
| `/agent-runs/{run_id}/exports/excel` | GET | `job-agent-workbench-prototype` 导出按钮 | 小尺主线导出标准尺码表/异常清单 Excel |
| `/feedback-sessions` | POST | `feedback-evolution` | 提交用户反馈 |
| `/agent-runs/{run_id}:generate-v2` | POST | `feedback-evolution` | 按反馈生成 V2 |
| `/memory-rules` | POST | `feedback-evolution` 保存记忆 | 写回企业记忆/规则库 |
| `/agent-profiles` | GET | `ai-employee-roster` | 员工仓库列表 |

## 5. 每页可变数据位置、来源、去向

### 5.1 `login`

| 页面位置 | 数据字段 | 来源 | 去向 |
|---|---|---|---|
| 手机号/验证码表单 | `phone`, `code` | 用户输入 | `/auth/demo-login` |
| Demo 登录按钮 | `demo_user` | 前端固定 | `users`, `auth_sessions` |
| 登录成功跳转 | `session_token`, `user` | 后端 | `localStorage.nks_user`, 后续请求 header |

### 5.2 `company-onboarding`

| 页面位置 | 数据字段 | 来源 | 去向 |
|---|---|---|---|
| 企业对话区 | `messages[]`, `answer_text` | 用户对话 | `enterprise_onboarding_messages` |
| 企业名称/官网 | `enterprise_name`, `website` | 用户输入或 Demo 填充 | `enterprise_spaces`, `enterprise_profiles` |
| 生成企业空间按钮 | `space_payload` | 页面表单 + 对话答案 | `/enterprise-spaces` |
| 生成企业身份 | `enterprise_identity` | LLM 接口返回 | `enterprise_profiles` |

### 5.3 `enterprise-memory`

| 页面位置 | 数据字段 | 来源 | 去向 |
|---|---|---|---|
| 企业身份卡 | `industry`, `customers`, `products`, `tone`, `risk_rules` | `enterprise_profiles` | 确认后作为所有模型上下文 |
| 企业库/部门库卡片 | `library_scope`, `library_items[]` | `knowledge_items`, `material_files` | `knowledge_items` |
| 资料上传按钮 | `file`, `scope`, `department` | 用户上传 | `/materials` -> `/materials/{id}:parse` |
| 当前任务资料 | `raw_demand`, `demand_files[]` | 用户粘贴/上传 | `demand_inputs`, `material_files` |
| 开始诊断按钮 | `demand_id` | 保存后的需求 | `demand-diagnosis` |

### 5.4 `demand-diagnosis`

| 页面位置 | 数据字段 | 来源 | 去向 |
|---|---|---|---|
| `#diagInput` | `raw_text` | 用户粘贴的混乱需求 | `demand_inputs.raw_text` |
| 资料来源列表 | `source_materials[]` | `material_files`, `knowledge_items` | 作为模型上下文 |
| 员工编制扫描 | `existing_agents[]` | `agent_profiles` | 参与路由判断 |
| 诊断结论卡 | `route_decision` | `/demand-recognitions` 或 mock | `route_decisions` |
| 指标卡 | `diagnosis_metrics[]` | 模型输出 | `diagnosis_metrics` |
| 七层骨架预览 | `seven_skeleton[]` | 模型输出 | `seven_skeleton_layers` |
| 确认按钮 | `diagnosis_id`, `agent_profile_seed` | 当前诊断结果 | `job-agent-workbench` |

### 5.5 `job-agent-workbench`

这是最新核心页：需求应该以“和大模型对话 + 上传资料”的形式进入，识别后填满七层骨架。

| 页面位置 | DOM / 模块 | 数据字段 | 来源 | 去向 |
|---|---|---|---|---|
| 对话输入框 | `#raw-demand-input` | `raw_text` | 用户粘贴/从诊断页带入 | `/demand-recognitions` |
| 上传资料 | `#material-upload` | `files[]` | 用户上传 PPT/PDF/Excel/Docx/截图 | `/materials`, `/materials/{id}:parse` |
| 资料标签 | `#material-list` | `material_refs[]` | 上传/企业库/部门库 | 传给模型上下文 |
| 识别状态 | `#recognition-status` | `recognition_status` | 后端任务状态 | 页面展示 |
| 识别按钮 | `#recognize-demand` | `recognition_request` | 用户点击 | `/demand-recognitions` |
| 七层骨架 | `#skeleton-list` | `seven_skeleton[7]` | 模型返回 | `seven_skeleton_layers` |
| 企业/问题/记忆引用 | `#reference-panel` | `evidence` | 模型返回 | `recognized_evidence` |
| 路由方案对比 | `#comparison-grid` | `route_options[]` | 模型返回 | `route_decisions` |
| 指标条 | `#metric-strip` | `diagnosis_metrics[]` | 模型返回 | `diagnosis_metrics` |
| 确认进入员工卡 | `#enter-workbench` | `confirmed_bundle` | 用户确认 | `/demand-diagnoses/{id}:confirm` |

`POST /demand-recognitions` 请求建议：

```json
{
  "space_id": "hongke",
  "user_id": "demo-user",
  "raw_text": "市场部内容生产太慢...",
  "material_ids": ["mat_001", "mat_002"],
  "library_scopes": ["enterprise", "department", "task"],
  "existing_agent_ids": ["AGT-MKT-003", "AGT-MKT-004"],
  "mode": "route_and_generate_skeleton"
}
```

返回必须一次性包含：

```json
{
  "diagnosis_id": "diag_001",
  "routing_decision": {
    "decision": "add_workflow",
    "target_agent": "市场部 / ToB 内容增长 Agent",
    "reason": "该需求属于现有内容增长岗位下的新流程",
    "action": "新增技术资料多平台改写 workflow",
    "match_score": "82%",
    "match_label": "胜任匹配"
  },
  "route_options": [
    {
      "title": "复用现有 Agent",
      "status": "推荐",
      "reason": "岗位边界一致，只需新增 workflow",
      "tone": "success"
    }
  ],
  "diagnosis_metrics": [
    {
      "name": "多平台改写耗时",
      "baseline": "8h/篇",
      "target": "≤4.5h/篇"
    }
  ],
  "seven_skeleton": [
    {
      "idx": 1,
      "title": "岗位边界",
      "items": ["负责技术资料内容化", "不负责最终发布"]
    }
  ],
  "evidence": {
    "recognized_info": ["企业：ToB 科技", "部门：市场部"],
    "key_problems": ["多平台改写耗时", "技术红线需要人工复核"],
    "memory_refs": ["企业库/品牌语气", "市场部库/历史文章"]
  },
  "agent_profile_seed": {
    "name": "小薯",
    "role": "ToB 内容增长专员",
    "department": "市场部"
  },
  "workflow_seed": {
    "name": "技术资料多平台改写",
    "steps": ["读取资料", "提取卖点", "生成多平台草稿", "红线检查", "等待人工确认"]
  }
}
```

硬性校验：

- `seven_skeleton` 必须恰好 7 层。
- `diagnosis_metrics` 建议 4 条。
- `routing_decision.decision` 只能是 `reuse_agent` / `add_workflow` / `new_role_agent`。
- 红线必须包含“关键决策/发布/外部发送需要人工确认”。

### 5.6 `agent-birth-card`

| 页面位置 | 数据字段 | 来源 | 去向 |
|---|---|---|---|
| 员工头像/姓名/工号 | `avatar`, `name`, `employee_id` | `agent_profile_seed` 或 `/agent-profiles` | `agent_profiles` |
| 岗位/部门/汇报对象 | `role`, `department`, `reports_to` | 诊断结果 + 企业组织 | `agent_profiles` |
| 可交办任务 | `tasks_i_can_do[]` | 七层骨架/工作流 | `agent_capabilities` |
| 不会越过的边界 | `red_lines[]` | 七层骨架第 4 层 | `agent_boundaries` |
| 会用这些资料 | `available_resources[]` | 企业库/部门库/任务资料 | `agent_profiles.resource_refs` |
| 最近学会了什么 | `learning_items[]` | 诊断/历史反馈 | `memory_rules` |
| 给第一个任务按钮 | `agent_id` | 用户确认 | `/agent-profiles/{id}:activate` |

### 5.7 `job-agent-workbench-prototype`

| 页面位置 | 数据字段 | 来源 | 去向 |
|---|---|---|---|
| 左侧员工信息 | `agent_profile` | `agent_profiles` | 页面展示 |
| 可交办任务列表 | `tasks_i_can_do[]` | `agent_capabilities` | 选择任务 |
| 企业记忆列表 | `memory_used[]` | `knowledge_items`, `memory_rules` | 模型执行上下文 |
| 红线列表 | `red_lines[]` | `agent_boundaries` | 模型执行约束 |
| 开始执行按钮 | `task_input`, `agent_id`, `mode` | 用户点击 | `/agent-runs` |
| 执行步骤 | `run_steps[]` | 后端返回/流式状态 | `agent_runs.steps` |
| V1 产物区 | `outputs[]` | 模型执行返回 | `run_outputs` |
| 查看全文/复制/下载 | `output_body`, `excel_export_url` | `run_outputs` | 小尺主线下载 Excel；内容支线下载 Markdown，P0 不外发 |

`POST /agent-runs` 返回建议：

```json
{
  "run_id": "run_001",
  "agent_id": "AGT-MKT-003",
  "status": "completed",
  "memory_used_count": 6,
  "memory_used": ["企业身份", "品牌语气", "术语表", "红线规则"],
  "outputs": [
    {
      "output_id": "out_001",
      "type": "excel_table",
      "platform": "标准尺码表",
      "title": "高一新生标准尺码表 v1",
      "body": "可预览的表格摘要",
      "rows": [
        {
          "student_no": "001",
          "name_masked": "张某某",
          "height": 165,
          "size_recommendation": "165/80A",
          "review_status": "通过"
        }
      ]
    }
  ],
  "excel_exports": [
    {
      "label": "标准尺码表.xlsx",
      "url": "/api/v1/agent-runs/run_001/exports/excel?type=standard_size_table"
    },
    {
      "label": "异常清单.xlsx",
      "url": "/api/v1/agent-runs/run_001/exports/excel?type=anomaly_list"
    }
  ],
  "human_review_required": ["特体尺码", "缺失字段", "异常阈值"]
}
```

### 5.8 `feedback-evolution`

| 页面位置 | 数据字段 | 来源 | 去向 |
|---|---|---|---|
| V1 对比区 | `taskV1.outputs[]` | `run_outputs` | 页面展示 |
| 反馈输入框 | `feedback_text` | 用户输入 | `/feedback-sessions` |
| 生成 V2 按钮 | `feedback_session_id`, `run_id` | 用户点击 | `/agent-runs/{run_id}:generate-v2` |
| 新增规则区 | `feedback_rules_added[]` | 模型返回 | `memory_rules` |
| V2 输出区 | `taskV2.outputs[]` | 模型返回 | `run_versions`, `run_outputs` |
| 保存 V2/写回记忆 | `memory_writeback` | 用户确认 | `/memory-rules` |

### 5.9 `ai-employee-roster`

| 页面位置 | 数据字段 | 来源 | 去向 |
|---|---|---|---|
| 员工卡片列表 | `agent_profiles[]` | `/agent-profiles` | 页面展示 |
| 搜索/部门筛选/排序 | `query`, `department`, `sort` | 用户输入 | `/agent-profiles?query=...` |
| 状态统计 | `status_count`, `tasks_done`, `version` | `agent_profiles`, `agent_runs` | 页面展示 |
| 选择员工交办 | `selectedEmployee` | 用户点击 | `job-agent-workbench-prototype?agent=...` |

## 6. 大模型接入位置

### LLM-1 企业身份识别

| 项 | 内容 |
|---|---|
| 页面 | `company-onboarding`, `enterprise-memory` |
| 位置 | 企业对话区、企业资料上传区、身份卡 |
| 输入 | 企业名称、官网、用户对话答案、公司介绍/PPT/官网摘要 |
| 输出 | `enterprise_identity` |
| 预期结果 | 企业类型、行业、客户、产品、语气、业务目标、风险红线 |
| 写入 | `enterprise_profiles`, `knowledge_items` |

### LLM-2 文件解析与资料入库

| 项 | 内容 |
|---|---|
| 页面 | `enterprise-memory`, `job-agent-workbench` |
| 位置 | 企业库/部门库/当前任务资料上传 |
| 输入 | PDF/PPT/DOCX/XLSX/图片/截图 |
| 输出 | `material_parse_result` |
| 预期结果 | 文档摘要、结构化字段、表格抽取、OCR 文本、资料分类、可引用证据 |
| 写入 | `material_files`, `knowledge_items` |

### LLM-3 需求识别、路由判断、七层骨架生成

这是比赛核心模型接口。

| 项 | 内容 |
|---|---|
| 页面 | `demand-diagnosis`, `job-agent-workbench` |
| 具体位置 | `#diagInput`, `#raw-demand-input`, `#material-upload`, `#recognize-demand`, `#skeleton-list` |
| 输入 | 原始需求文本、上传资料解析结果、企业身份、企业库/部门库、已有 AI 员工编制 |
| 输出 | `diagnosis_bundle` |
| 预期结果 | 路由结论、路由方案对比、4 个指标、7 层骨架、证据引用、员工档案种子、workflow 种子 |
| 写入 | `demand_diagnoses`, `route_decisions`, `diagnosis_metrics`, `seven_skeleton_layers` |

### LLM-4 AI 员工档案生成

| 项 | 内容 |
|---|---|
| 页面 | `agent-birth-card` |
| 位置 | 员工身份区、可交办任务、边界、学习项 |
| 输入 | `diagnosis_bundle`, `seven_skeleton`, `workflow_seed`, 企业组织信息 |
| 输出 | `agent_profile` |
| 预期结果 | 名字、工号、岗位、部门、汇报对象、任务能力、红线、开场白 |
| 写入 | `agent_profiles`, `agent_capabilities`, `agent_boundaries` |

### LLM-5 任务执行生成 V1

| 项 | 内容 |
|---|---|
| 页面 | `job-agent-workbench-prototype` |
| 位置 | `#runTaskBtn`, 执行步骤区、交付物区 |
| 输入 | `agent_profile`, `task_input`, `memory_rules`, `knowledge_items`, `red_lines` |
| 输出 | `agent_run_result` |
| 预期结果 | V1 交付物、使用的企业记忆、人工复核点、执行步骤 |
| 写入 | `agent_runs`, `run_outputs`, `audit_events` |

### LLM-6 反馈转规则并生成 V2

| 项 | 内容 |
|---|---|
| 页面 | `feedback-evolution` |
| 位置 | 反馈输入框、生成 V2、保存记忆 |
| 输入 | V1 产物、用户反馈、当前 agent、企业记忆 |
| 输出 | `feedback_rules_added`, `task_v2.outputs`, `memory_writeback` |
| 预期结果 | 1-3 条可复用规则、明显更好的 V2、写回企业记忆的位置 |
| 写入 | `feedback_sessions`, `memory_rules`, `run_versions`, `run_outputs` |

## 7. 主业务链路数据流

```text
user/session
-> enterprise_space
-> enterprise_profile
-> material_files + knowledge_items
-> demand_input
-> demand_recognition / diagnosis_bundle
-> route_decision + seven_skeleton
-> agent_profile + workflow
-> agent_run V1 + outputs
-> feedback_session
-> run_version V2
-> memory_rules writeback
-> next run reads updated memory
```

## 8. 后端同学对齐清单

P0 今天要确认：

- 已建表能否覆盖：企业空间、资料文件、需求、诊断、七层骨架、员工、执行、反馈、记忆规则。
- `/demand-recognitions` 是否能一次返回 `diagnosis_bundle`，这是最关键接口。
- 文件上传是否至少支持：`pdf`, `docx`, `xlsx`, `txt`, `png/jpg`。
- 模型失败时后端是否返回兜底 mock，保证现场不白屏。
- 每次模型输出是否保存 raw response 和 normalized JSON，便于答辩时证明“真实跑过”。
- 前端仍可本地 mock，但切到后端时不要改页面路径，只改 API base 和调用函数。

P1 再做：

- 流式执行状态。
- 多企业真实切换。
- 员工仓库分页、搜索、权限。
- Webhook/API Key 配置入口。
- Word/Excel 导出。

## 9. 前端当前已验证状态

最新验证页：

```text
pages/job-agent-workbench/index.html?mode=reuse
```

验证结果：

```text
识别状态：已识别
七层骨架数量：7
桌面 scrollWidth = clientWidth = 1280
console/pageerror：无错误
截图：_screenshots/final-workbench-contract-check-1280.png
```

## 10. 后端表已建后的下一步

后端同学把现有表结构发过来后，只需要做一次映射：

```text
本合同建议表名 -> 后端实际表名
字段名 -> 实际字段名
接口路径 -> 实际 controller/router
模型输出 schema -> normalized DTO
```

映射完以后，前端优先只接 5 个接口就能让评委看到真实链路：

```text
1. POST /materials
2. POST /demand-recognitions
3. POST /agent-runs
4. GET /agent-runs/{run_id}/exports/excel
5. POST /feedback-sessions + POST /memory-rules
```

这 5 个接口跑通，项目就从静态原型升级为真实业务闭环。若现场时间只够跑主线，反馈写回可以降级为页面展示，Excel 导出不能降级。
