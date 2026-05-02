(function () {
  const API_BASE_URL = window.NKS_API_BASE_URL || "http://localhost:8000/api";
  const USE_MOCK = true;
  const ENDPOINTS = {
    authLogin: "/auth/login",
    enterpriseSpaces: "/enterprise-spaces",
    enterpriseSpaceDetail: "/enterprise-spaces/:spaceId",
    enterpriseIdentityGenerate: "/enterprise-identities/generate",
    enterpriseIdentityConfirm: "/enterprise-identities/confirm",
    enterpriseLibraryUpload: "/libraries/enterprise/upload",
    departmentLibraryUpload: "/libraries/department/upload",
    libraries: "/libraries",
    demandUpload: "/demands/upload",
    demandRouting: "/demands/routing",
    skeletonGenerate: "/agent-skeletons/generate",
    skeletonConfirm: "/agent-skeletons/confirm",
    agentEmployeeGenerate: "/agent-employees/generate",
    agentEmployees: "/agent-employees",
    agentRuns: "/agent-runs",
    agentRunDetail: "/agent-runs/:runId",
    feedback: "/feedback",
    versionGenerateV2: "/versions/generate-v2",
    versionSave: "/versions/save",
    memoryWriteBack: "/memory/write-back",
    exports: "/exports"
  };

  function clone(value) {
    if (value === undefined) return {};
    return JSON.parse(JSON.stringify(value));
  }

  function mockResponse(data, delay) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        resolve({ code: 0, message: "success", data: clone(data) });
      }, delay || 420);
    });
  }

  async function request(path, options) {
    try {
      const response = await fetch(API_BASE_URL + path, Object.assign({
        headers: { "Content-Type": "application/json" }
      }, options || {}));
      const payload = await response.json();
      if (payload && typeof payload.code === "number") {
        return payload;
      }
      return { code: response.ok ? 0 : response.status, message: response.ok ? "success" : "request failed", data: payload || null };
    } catch (error) {
      return { code: 500, message: error.message || "网络请求失败", data: null };
    }
  }

  function currentData() {
    return window.NKS.getCompanyData();
  }

  async function authLogin(payload) {
    if (USE_MOCK) {
      window.NKS.setState({ user: payload && payload.user ? payload.user : "张小北" });
      return mockResponse({ token: "demo-token", user: window.NKS.getState().user });
    }
    return request(ENDPOINTS.authLogin, { method: "POST", body: JSON.stringify(payload || {}) });
  }

  async function createEnterpriseSpace(payload) {
    if (USE_MOCK) {
      window.NKS.setState({ enterprise: { spacePayload: payload || {}, created: true } });
      return mockResponse({ space_id: window.NKS.getCompany(), enterprise: currentData().enterprise_identity });
    }
    return request(ENDPOINTS.enterpriseSpaces, { method: "POST", body: JSON.stringify(payload || {}) });
  }

  async function generateEnterpriseIdentity(payload) {
    if (USE_MOCK) {
      const identity = currentData().enterprise_identity;
      window.NKS.setState({ enterprise: { identity } });
      return mockResponse(identity);
    }
    return request(ENDPOINTS.enterpriseIdentityGenerate, { method: "POST", body: JSON.stringify(payload || {}) });
  }

  async function confirmEnterpriseIdentity(payload) {
    if (USE_MOCK) {
      window.NKS.setState({ enterprise: { identityConfirmed: true, identity: currentData().enterprise_identity } });
      return mockResponse({ confirmed: true, identity: currentData().enterprise_identity });
    }
    return request(ENDPOINTS.enterpriseIdentityConfirm, { method: "POST", body: JSON.stringify(payload || {}) });
  }

  async function uploadEnterpriseLibrary(payload) {
    if (USE_MOCK) {
      window.NKS.setState({ uploads: { enterpriseLibrary: { uploaded: true, payload: payload || {} } } });
      return mockResponse(currentData().enterprise_library);
    }
    return request(ENDPOINTS.enterpriseLibraryUpload, { method: "POST", body: JSON.stringify(payload || {}) });
  }

  async function uploadDepartmentLibrary(payload) {
    if (USE_MOCK) {
      window.NKS.setState({ uploads: { departmentLibrary: { uploaded: true, payload: payload || {} } } });
      return mockResponse(currentData().department_library);
    }
    return request(ENDPOINTS.departmentLibraryUpload, { method: "POST", body: JSON.stringify(payload || {}) });
  }

  async function uploadDemandMaterial(payload) {
    if (USE_MOCK) {
      window.NKS.setState({ demand: { material: payload || {}, uploaded: true } });
      return mockResponse({ uploaded: true, demand_input: currentData().demand_input });
    }
    return request(ENDPOINTS.demandUpload, { method: "POST", body: JSON.stringify(payload || {}) });
  }

  async function runDemandRouting(payload) {
    if (USE_MOCK) {
      const data = currentData();
      window.NKS.setState({
        routing: {
          decision: data.routing_decision,
          diagnosis_metrics: data.diagnosis_metrics,
          seven_skeleton: data.seven_skeleton
        }
      });
      return mockResponse({
        routing_decision: data.routing_decision,
        diagnosis_metrics: data.diagnosis_metrics,
        seven_skeleton: data.seven_skeleton
      });
    }
    return request(ENDPOINTS.demandRouting, { method: "POST", body: JSON.stringify(payload || {}) });
  }

  async function generateSevenSkeleton(payload) {
    if (USE_MOCK) {
      window.NKS.setState({ routing: { seven_skeleton: currentData().seven_skeleton } });
      return mockResponse(currentData().seven_skeleton);
    }
    return request(ENDPOINTS.skeletonGenerate, { method: "POST", body: JSON.stringify(payload || {}) });
  }

  async function confirmSevenSkeleton(payload) {
    if (USE_MOCK) {
      const data = currentData();
      window.NKS.setState({
        currentAgent: data.agent_birth_card,
        routing: { sevenSkeletonConfirmed: true, seven_skeleton: data.seven_skeleton }
      });
      return mockResponse({ confirmed: true, seven_skeleton: data.seven_skeleton });
    }
    return request(ENDPOINTS.skeletonConfirm, { method: "POST", body: JSON.stringify(payload || {}) });
  }

  async function generateAgentEmployee(payload) {
    if (USE_MOCK) {
      window.NKS.setState({ currentAgent: currentData().agent_birth_card });
      return mockResponse(currentData().agent_birth_card);
    }
    return request(ENDPOINTS.agentEmployeeGenerate, { method: "POST", body: JSON.stringify(payload || {}) });
  }

  async function runAgentTask(payload) {
    if (USE_MOCK) {
      window.NKS.setState({ task: { v1: currentData().v1_output, v1Ready: true } });
      return mockResponse(currentData().v1_output);
    }
    return request(ENDPOINTS.agentRuns, { method: "POST", body: JSON.stringify(payload || {}) });
  }

  async function submitFeedback(payload) {
    if (USE_MOCK) {
      window.NKS.setState({ task: { feedback: payload && payload.feedback ? payload.feedback : currentData().demand_input.feedback_text } });
      return mockResponse({ received: true, feedback: payload && payload.feedback ? payload.feedback : currentData().demand_input.feedback_text });
    }
    return request(ENDPOINTS.feedback, { method: "POST", body: JSON.stringify(payload || {}) });
  }

  async function generateV2(payload) {
    if (USE_MOCK) {
      window.NKS.setState({ task: { v2: currentData().v2_output, v2Ready: true } });
      return mockResponse(currentData().v2_output);
    }
    return request(ENDPOINTS.versionGenerateV2, { method: "POST", body: JSON.stringify(payload || {}) });
  }

  async function saveMemoryVersion(payload) {
    if (USE_MOCK) {
      window.NKS.setState({ memory: { saved: true, version: currentData().memory_writeback.version_to, writeback: currentData().memory_writeback } });
      return mockResponse(currentData().memory_writeback);
    }
    return request(ENDPOINTS.versionSave, { method: "POST", body: JSON.stringify(payload || {}) });
  }

  async function exportResult(payload) {
    if (USE_MOCK) {
      const type = payload && payload.type;
      const option = currentData().export_options.find((item) => item.type === type) || currentData().export_options[0];
      return mockResponse({ exported: true, type: option.type, label: option.label, url: `./exports/${option.type}-demo` }, 280);
    }
    return request(ENDPOINTS.exports, { method: "POST", body: JSON.stringify(payload || {}) });
  }

  window.NKS_API = {
    authLogin,
    createEnterpriseSpace,
    generateEnterpriseIdentity,
    confirmEnterpriseIdentity,
    uploadEnterpriseLibrary,
    uploadDepartmentLibrary,
    uploadDemandMaterial,
    runDemandRouting,
    generateSevenSkeleton,
    confirmSevenSkeleton,
    generateAgentEmployee,
    runAgentTask,
    submitFeedback,
    generateV2,
    saveMemoryVersion,
    exportResult,
    _config: { API_BASE_URL, USE_MOCK, ENDPOINTS }
  };
})();
