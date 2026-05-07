# 后端 API 接入口径确认

本分支以后端 P0 合约为准，后端请严格实现：

```text
POST /api/v1/materials
POST /api/v1/demand-recognitions
POST /api/v1/agent-runs
GET  /api/v1/agent-runs/{run_id}/exports/excel?type=standard_size_table
POST /api/v1/feedback-sessions 或 POST /api/v1/memory-rules（可选）
```

前端最小接入策略：

- 页面按钮和展示保持现有结构。
- `NKS_LLM.diagnose()` 内部优先请求 `POST /api/v1/demand-recognitions`。
- `NKS_LLM.executeTask()` 内部优先请求 `POST /api/v1/agent-runs`。
- 工作台 Excel 导出优先使用后端返回的 `excel_exports[].url`。
- 浏览器不再携带模型 API Key，不把主链路直连 `/responses`。
- `assets/llm-config.js` 中：

```js
backendBaseURL: "http://127.0.0.1:8000/api/v1",
useBackend: true,
allowBrowserModelDirect: false
```

后端未启动或接口未返回合格 JSON 时，前端会自动使用本地 mock 兜底，保证现场 Demo 不断。

合并时请以后端同学直接读：

- `BACKEND_LLM_HANDOFF_FOR_AI.md`
- `FINAL-DEMO-INTEGRATION-CONTRACT.md`
- 本文件
