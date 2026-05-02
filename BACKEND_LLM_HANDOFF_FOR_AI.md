# 给后端与大模型链路 AI 的阅读文档

> 项目：南客松 Agentry / 企捏捏  
> 日期：2026-05-03  
> 读者：后端同学、负责提示词/模型链路的 AI、负责接口联调的 AI  
> 目标：不要再发散，按本文把“真实可跑 Demo”接通。

## 1. 先读结论

本次比赛现场真实跑通的主链路只选一个：

```text
林蔷校服制造企业
-> 上传/粘贴混乱尺码整理需求
-> 大模型识别需求
-> 生成一个新的 AI 员工：小尺，商品部 / 尺码整理流程助理 Agent
-> 填满七层岗位骨架
-> 小尺执行一次尺码整理任务
-> 输出标准尺码表、异常清单、人工复核清单
-> 导出 Excel
```

虹科 / 内容增长 Agent 只做备份和答辩支线，不作为 3 分钟主 Demo 的真实产物。

原因：

- 小尺能展示“根据需求生成新 Agent”。
- 小尺能展示“Agent 真的做了一件业务事”。
- Excel 是可检查的真实产物，比文案生成更容易让评委相信。
- 这个场景包含文件识别、表格清洗、异常判断、人工复核、导出五个业务动作。

## 2. 不要做什么

请后端和模型链路 AI 明确避开这些事：

- 不要同时接虹科内容生成和小尺尺码整理两条真链路。
- 不要把主 Demo 做成聊天机器人。
- 不要让用户先懂 Agent、懂 prompt、懂 workflow 才能用。
- 不要自动发布、自动发消息、自动提交外部系统。
- 不要在前端保存真实 LLM API Key。
- 不要让 Excel 导出降级成“页面上看一下表格”。
- 不要再维护 legacy 页面。

## 3. 当前前端位置

前端同步包根目录：

```text
E:/vicky-ai-system/projects/sprints/nankesong-2026/deliverables/_github_sync_wlxhz_nankesong
```

本地访问根路径：

```text
http://127.0.0.1:8088/projects/sprints/nankesong-2026/deliverables/_github_sync_wlxhz_nankesong/
```

主线关键页面：

```text
pages/company-onboarding/index.html
pages/enterprise-memory/index.html
pages/demand-diagnosis/index.html
pages/job-agent-workbench/index.html
pages/agent-birth-card/index.html
pages/job-agent-workbench-prototype/index.html
pages/feedback-evolution/index.html
pages/ai-employee-roster/index.html
```

目前默认企业已经改为：

```text
longxia = 林蔷 / 校服制造
```

## 4. 比赛现场要让评委看到的 5 个动作

### 动作 1：输入真实混乱需求

页面：

```text
pages/job-agent-workbench/index.html
```

页面位置：

```text
#raw-demand-input
#material-upload
#recognize-demand
```

评委要看到：

```text
用户不需要自己写 Agent 配置，只要输入一段真实业务需求，或上传混乱表格/截图/文件。
```

### 动作 2：模型识别并生成七层骨架

页面位置：

```text
#skeleton-list
#reference-panel
#comparison-grid
#metric-strip
```

评委要看到：

```text
系统判断这是商品部尺码整理需求，需要生成“小尺”这个新岗位 Agent。
七层骨架完整出现：
1. 岗位边界
2. 工作顺序
3. 质量标准
4. 质量红线
5. 交付契约
6. 工具目录
7. 学习回路
```

硬性要求：

```text
seven_skeleton.length 必须等于 7。
不能缺层。
不能只返回一段自然语言。
```

### 动作 3：确认 AI 员工小尺

页面：

```text
pages/agent-birth-card/index.html
```

评委要看到：

```text
这不是生成一段 prompt，而是生成一个能上岗的 AI 员工。
它有名字、工号、岗位、部门、能做的任务、不会越过的边界。
```

### 动作 4：小尺执行真实任务

页面：

```text
pages/job-agent-workbench-prototype/index.html
```

评委要看到：

```text
小尺读取企业记忆、商品部规则、当前任务资料和红线。
点击开始执行后，生成 V1 产物。
```

### 动作 5：导出 Excel

页面位置：

```text
#downloadBtn
```

当前前端已经把小尺场景按钮改成：

```text
导出 Excel
```

评委要看到：

```text
下载文件名类似：小尺-标准尺码表-v1.xls
打开后至少有两个 sheet 或两个表区：
1. 标准尺码表
2. 异常与人工复核清单
```

## 5. P0 接口，只接这 5 个

接口前缀建议：

```text
http://127.0.0.1:8000/api/v1
```

### 5.1 上传资料

```http
POST /materials
Content-Type: multipart/form-data
```

用途：

```text
上传混乱 Excel、图片表格、文本名单、特体名单、商品部规则文件。
```

请求字段建议：

```text
space_id = longxia
scope = task | department | enterprise
file = 上传文件
```

返回：

```json
{
  "material_id": "mat_001",
  "file_name": "新生尺码原始表.xlsx",
  "file_type": "xlsx",
  "scope": "task",
  "parse_status": "parsed",
  "summary": "包含 312 条学生尺码记录，存在缺失字段、特体尺码和异常值"
}
```

### 5.2 需求识别 + 七层骨架生成

```http
POST /demand-recognitions
Content-Type: application/json
```

这是最关键接口。

请求：

```json
{
  "space_id": "longxia",
  "raw_text": "商品部学生尺码收集与整理，原始数据不统一，表格合并耗时，字段容易出错，特体尺码需要经验判断，希望 AI 完成多格式识别、表格合并、异常清洗、尺码初步推荐，并生成复核表。",
  "material_ids": ["mat_001", "mat_002"],
  "existing_agent_ids": [],
  "mode": "route_and_generate_skeleton"
}
```

返回必须是结构化 JSON：

```json
{
  "diagnosis_id": "diag_size_001",
  "routing_decision": {
    "decision": "new_role_agent",
    "target_agent": "商品部 / 尺码整理流程助理 Agent",
    "reason": "当前企业没有负责原始混乱尺码数据到标准尺码表的岗位 Agent，需要新建独立岗位 Agent。",
    "action": "新建小尺，绑定商品部库、编码规则、异常阈值和人工复核流程",
    "match_score": "待新建",
    "match_label": "新岗位需求"
  },
  "diagnosis_metrics": [
    {
      "name": "单批整理耗时",
      "baseline": "6h/校",
      "target": "≤1h/校"
    },
    {
      "name": "异常漏检率",
      "baseline": "11%",
      "target": "≤2%"
    },
    {
      "name": "特体识别准确率",
      "baseline": "72%",
      "target": "≥95%（人工复核兜底）"
    },
    {
      "name": "系统录入错误率",
      "baseline": "5%",
      "target": "≤0.5%"
    }
  ],
  "seven_skeleton": [
    {
      "idx": 1,
      "title": "岗位边界",
      "items": [
        "负责多源尺码数据识别、清洗、合并、异常标记和复核表生成",
        "不负责特体最终决策，不直接提交生产系统"
      ]
    },
    {
      "idx": 2,
      "title": "工作顺序",
      "items": [
        "读取多源原始表",
        "字段对齐",
        "异常清洗",
        "尺码初步推荐",
        "标记特体",
        "输出复核表和最终表"
      ]
    },
    {
      "idx": 3,
      "title": "质量标准",
      "items": [
        "字段命名符合商品部编码规则",
        "所有异常必须能追溯到原始行",
        "输出表可被人工复核和二次导入"
      ]
    },
    {
      "idx": 4,
      "title": "质量红线",
      "items": [
        "特体不自动决策，必须人工复核",
        "原始数据不可覆盖，只追加版本",
        "不直接提交生产系统"
      ]
    },
    {
      "idx": 5,
      "title": "交付契约",
      "items": [
        "标准尺码表.xlsx",
        "异常清单.xlsx",
        "人工复核清单.xlsx"
      ]
    },
    {
      "idx": 6,
      "title": "工具目录",
      "items": [
        "多格式文件解析",
        "表格合并清洗",
        "编码规则库",
        "异常阈值规则",
        "Excel 导出"
      ]
    },
    {
      "idx": 7,
      "title": "学习回路",
      "items": [
        "人工修正写回异常规则",
        "新阈值下次自动应用",
        "保留每批任务版本"
      ]
    }
  ],
  "evidence": {
    "recognized_info": ["企业：校服制造", "部门：商品部", "任务：尺码整理"],
    "key_problems": ["多格式原始表混乱", "异常值难筛查", "特体依赖经验判断"],
    "memory_refs": ["商品部编码规则", "历史尺码档案", "风险红线清单"]
  },
  "agent_profile_seed": {
    "name": "小尺",
    "employee_id": "AGT-PRD-001",
    "role": "尺码整理流程助理",
    "department": "商品部"
  }
}
```

### 5.3 执行任务，生成 V1

```http
POST /agent-runs
Content-Type: application/json
```

请求：

```json
{
  "space_id": "longxia",
  "agent_id": "AGT-PRD-001",
  "task_type": "size_table_cleanup",
  "material_ids": ["mat_001", "mat_002"],
  "run_mode": "review_required"
}
```

返回：

```json
{
  "run_id": "run_size_001",
  "agent_id": "AGT-PRD-001",
  "status": "completed",
  "memory_used_count": 5,
  "memory_used": [
    "企业身份",
    "商品部编码规则 v2",
    "历史尺码档案 18 校",
    "异常阈值规则",
    "复核表模板"
  ],
  "outputs": [
    {
      "output_id": "out_standard_table",
      "type": "excel_table",
      "platform": "标准尺码表",
      "title": "高一新生标准尺码表 v1",
      "body": "已生成标准尺码表，特体与异常行已标记为待人工复核。",
      "rows_preview": [
        {
          "student_no": "001",
          "name_masked": "张某某",
          "height": 165,
          "raw_size": "165/80A",
          "recommended_size": "165/80A",
          "review_status": "通过"
        },
        {
          "student_no": "015",
          "name_masked": "赵某某",
          "height": 165,
          "raw_size": "165/96B",
          "recommended_size": "",
          "review_status": "待人工复核"
        }
      ]
    },
    {
      "output_id": "out_anomaly_list",
      "type": "excel_table",
      "platform": "异常清单",
      "title": "异常 23 条 + 特体复核 5 条",
      "body": "字段缺失 12 条，尺码超阈值 6 条，特体待确认 5 条。"
    }
  ],
  "human_review_required": [
    "特体尺码",
    "缺失字段",
    "异常阈值"
  ],
  "excel_exports": [
    {
      "type": "standard_size_table",
      "label": "标准尺码表.xlsx",
      "url": "/api/v1/agent-runs/run_size_001/exports/excel?type=standard_size_table"
    },
    {
      "type": "anomaly_list",
      "label": "异常清单.xlsx",
      "url": "/api/v1/agent-runs/run_size_001/exports/excel?type=anomaly_list"
    }
  ]
}
```

### 5.4 导出 Excel

```http
GET /agent-runs/{run_id}/exports/excel?type=standard_size_table
```

要求：

```text
返回真实可下载 Excel 文件。
文件名建议：小尺-标准尺码表-v1.xlsx
```

最小 sheet：

```text
Sheet 1：标准尺码表
Sheet 2：异常与人工复核清单
```

标准尺码表最小列：

```text
student_no
name_masked
height
raw_size
recommended_size
review_status
source_row
notes
```

异常清单最小列：

```text
anomaly_type
count
rows
handling_rule
requires_human_review
```

### 5.5 反馈与记忆写回

这条可以作为 P0.5。若时间不够，页面展示即可；若时间够，接真实接口。

```http
POST /feedback-sessions
POST /memory-rules
```

示例反馈：

```text
165/96B 这种特体不要给推荐值，单独标为待人工复核。
```

模型应转成规则：

```json
{
  "rules_added": [
    "特体尺码一律标记为待人工复核，不生成推荐尺码",
    "复核清单中特体行必须高亮",
    "推荐尺码栏对特体留空，避免误用"
  ],
  "memory_target": "商品部库 / 尺码异常规则",
  "version_to": "memory-v2"
}
```

## 6. 大模型链路提示词要完成的任务

模型链路可以拆成 3 次，也可以一次返回完整 bundle。现场稳定优先，建议后端做兜底。

### 模型任务 A：需求识别与路由

输入：

```text
企业身份
已有 AI 员工列表
用户原始需求
上传资料解析摘要
```

输出：

```text
reuse_agent / add_workflow / new_role_agent 三选一
```

小尺主线必须输出：

```text
new_role_agent
```

### 模型任务 B：七层岗位骨架

输出必须严格 7 层：

```text
岗位边界
工作顺序
质量标准
质量红线
交付契约
工具目录
学习回路
```

每层至少 2 条 `items`。

### 模型任务 C：任务执行

输入：

```text
小尺的 agent_profile
七层骨架
商品部规则
原始表格解析结果
用户任务
```

输出：

```text
标准尺码表数据
异常清单数据
人工复核清单
导出文件元信息
```

## 7. 前端状态字段

前端现在主要用 `localStorage`：

```text
nks_company = longxia
nks_state.rawDemand
nks_state.demandText
nks_state.demandDiagnosis
nks_state.routingDecision
nks_state.diagnosisMetrics
nks_state.sevenSkeleton
nks_state.agentProfile
nks_state.currentAgent
nks_state.currentTask
nks_state.taskV1
nks_state.feedbackSession
```

后端接入时不用完全沿用这些名字，但要保证页面能拿到同等数据。

## 8. 验收标准

主 Demo 合格标准：

- 打开七层骨架页，默认企业是林蔷。
- 点击识别后，页面显示小尺相关的岗位判断。
- 七层骨架数量为 7。
- 确认后能进入员工诞生卡。
- 小尺工作台点击开始执行后，出现 V1 产物。
- 下载按钮是“导出 Excel”。
- 能下载一个可打开的 Excel。
- Excel 里有标准尺码表和异常/人工复核清单。
- 模型失败时有兜底数据，不白屏。

当前前端已验证：

```text
job-agent-workbench:
默认企业：林蔷
识别状态：已识别
岗位：商品部 · 尺码整理流程助理 Agent
七层骨架：7
移动端 scrollWidth = 390

job-agent-workbench-prototype:
员工：小尺
岗位：尺码整理流程助理
执行后：已生成 V1
下载按钮：导出 Excel
下载文件名：小尺-标准尺码表-v1.xls
console/pageerror：无错误
```

## 9. 推荐联调顺序

按这个顺序来，不要并行乱接：

```text
1. 先让 /demand-recognitions 返回固定小尺 JSON，前端能渲染七层骨架。
2. 再让 /agent-runs 返回固定标准尺码表和异常清单。
3. 再接真实 Excel 导出。
4. 再把上传资料解析接进去。
5. 最后接反馈写回记忆。
```

如果时间只够 2 小时：

```text
只做 1、2、3。
```

如果时间只够 1 小时：

```text
只做 1 和 3，中间执行结果用固定数据。
```

## 10. 给模型链路 AI 的一句话指令

你不是在做聊天机器人，也不是在做通用 Agent 平台。你的任务是把一家校服企业商品部的混乱尺码整理需求，识别成一个新岗位 AI 员工“小尺”，生成完整七层岗位骨架，并让它输出可复核、可导出的标准尺码表和异常清单。所有输出必须结构化，所有关键决策必须留给人工复核。

