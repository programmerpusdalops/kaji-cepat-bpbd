/*
  API Service — connects React frontend to Express.js backend
  Base URL: /api/v1 (proxied to http://localhost:5000 by Vite in dev)
*/

const BASE_URL = "/api/v1";

// ──────────────── Helper ────────────────

const getToken = (): string | null => localStorage.getItem("bpbd_token");

const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json = await res.json();

  if (!json.success) {
    const error = new Error(json.message || "Request failed");
    (error as any).status = res.status;
    (error as any).errors = json.errors;
    throw error;
  }
  return json;
};

// ──────────────── Auth ────────────────

export const login = async (email: string, password: string) => {
  const json = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return json.data; // { token, user }
};

export const getProfile = async () => {
  const json = await apiFetch("/auth/me");
  return json.data;
};

export const updateProfile = async (payload: { name: string; phone?: string; instansi?: string }) => {
  const json = await apiFetch("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return json.data;
};

export const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
  const json = await apiFetch("/auth/change-password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return json;
};

// ──────────────── Users ────────────────

export const getUsers = async () => {
  const json = await apiFetch("/users");
  return json.data;
};

export const getUserById = async (id: number) => {
  const json = await apiFetch(`/users/${id}`);
  return json.data;
};

export const createUser = async (payload: any) => {
  const json = await apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return json.data;
};

export const updateUser = async (id: number, payload: any) => {
  const json = await apiFetch(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return json.data;
};

export const deleteUser = async (id: number) => {
  const json = await apiFetch(`/users/${id}`, { method: "DELETE" });
  return json;
};

// ──────────────── Disaster Reports ────────────────

export interface DisasterReport {
  id: number;
  report_code: string;
  disaster_type_id: number;
  disaster_type: string;
  reporter_name: string;
  report_source: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  report_time: string;
  created_at: string;
  verification_logs?: any[];
}

export const getDisasterReports = async (filters?: { status?: string; disaster_type_id?: number }): Promise<DisasterReport[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.disaster_type_id) params.set("disaster_type_id", String(filters.disaster_type_id));
  const qs = params.toString();
  const json = await apiFetch(`/disaster-reports${qs ? `?${qs}` : ""}`);
  return json.data;
};

export const getDisasterReportById = async (id: number): Promise<DisasterReport> => {
  const json = await apiFetch(`/disaster-reports/${id}`);
  return json.data;
};

export const createDisasterReport = async (payload: any) => {
  const json = await apiFetch("/disaster-reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return json.data;
};

// ──────────────── Verification ────────────────

export const verifyReport = async (id: number, payload: { status: string; verification_note: string }) => {
  const json = await apiFetch(`/disaster-reports/${id}/verify`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return json.data;
};

// ──────────────── Master Data ────────────────

export const getMasterData = async () => {
  const json = await apiFetch("/master-data");
  return json.data;
};

export const getDisasterTypes = async () => {
  const json = await apiFetch("/master-data/disaster-types");
  return json.data;
};

export const createDisasterType = async (name: string) => {
  const json = await apiFetch("/master-data/disaster-types", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return json.data;
};

export const updateDisasterType = async (id: number, name: string) => {
  const json = await apiFetch(`/master-data/disaster-types/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
  return json.data;
};

export const deleteDisasterType = async (id: number) => {
  const json = await apiFetch(`/master-data/disaster-types/${id}`, { method: "DELETE" });
  return json;
};

export const getAgencies = async () => {
  const json = await apiFetch("/master-data/agencies");
  return json.data;
};

export const createAgency = async (name: string, type?: string) => {
  const json = await apiFetch("/master-data/agencies", {
    method: "POST",
    body: JSON.stringify({ name, type: type || undefined }),
  });
  return json.data;
};

export const updateAgency = async (id: number, name: string, type?: string) => {
  const json = await apiFetch(`/master-data/agencies/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name, type: type || undefined }),
  });
  return json.data;
};

export const deleteAgency = async (id: number) => {
  const json = await apiFetch(`/master-data/agencies/${id}`, { method: "DELETE" });
  return json;
};

export const getRegions = async () => {
  const json = await apiFetch("/master-data/regions");
  return json.data;
};

export const createRegion = async (data: { province: string; regency?: string; district?: string; village?: string }) => {
  const json = await apiFetch("/master-data/regions", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return json.data;
};

export const updateRegion = async (id: number, data: { province: string; regency?: string; district?: string; village?: string }) => {
  const json = await apiFetch(`/master-data/regions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return json.data;
};

export const deleteRegion = async (id: number) => {
  const json = await apiFetch(`/master-data/regions/${id}`, { method: "DELETE" });
  return json;
};

export const getNeedItems = async () => {
  const json = await apiFetch("/master-data/need-items");
  return json.data;
};

export const createNeedItem = async (name: string, unit?: string) => {
  const json = await apiFetch("/master-data/need-items", {
    method: "POST",
    body: JSON.stringify({ name, unit: unit || undefined }),
  });
  return json.data;
};

export const updateNeedItem = async (id: number, name: string, unit?: string) => {
  const json = await apiFetch(`/master-data/need-items/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name, unit: unit || undefined }),
  });
  return json.data;
};

export const deleteNeedItem = async (id: number) => {
  const json = await apiFetch(`/master-data/need-items/${id}`, { method: "DELETE" });
  return json;
};

// ──────────────── Team Assignment (stub) ────────────────

export const getTeamAssignments = async () => {
  const json = await apiFetch("/team-assignments").catch(() => ({ data: [] }));
  return json.data || [];
};

export const createTeamAssignment = async (payload: any) => {
  const json = await apiFetch("/team-assignments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return json.data;
};

// ──────────────── Field Assessment (stub) ────────────────

export const getAssessments = async () => {
  const json = await apiFetch("/field-assessments");
  return json.data || [];
};

export const submitFieldAssessment = async (payload: any) => {
  const json = await apiFetch("/field-assessments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return json.data;
};

// ──────────────── Impact & Emergency ────────────────

export const getDisasterImpact = async () => {
  // Get all field assessments which contain victims, house_damage, etc.
  const assessments = await getAssessments();
  return assessments.map((a: any) => ({
    id: a.id,
    report_code: a.report_code,
    disaster_type: a.disaster_type,
    lokasi: [a.village, a.district, a.regency].filter(Boolean).join(', ') || a.province || '-',
    assessment_time: a.assessment_time,
    meninggal: a.victims?.dead || 0,
    hilang: a.victims?.missing || 0,
    luka_berat: a.victims?.severe_injured || 0,
    luka_ringan: a.victims?.minor_injured || 0,
    pengungsi: a.victims?.evacuated || 0,
    rumah_berat: a.house_damage?.heavy || 0,
    rumah_sedang: a.house_damage?.moderate || 0,
    rumah_ringan: a.house_damage?.light || 0,
  }));
};

export const getEmergencyNeeds = async () => {
  const json = await apiFetch("/emergency-needs");
  return json.data || [];
};

export const submitEmergencyNeeds = async (payload: any) => {
  const json = await apiFetch("/emergency-needs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return json.data;
};

// ──────────────── Map ────────────────

export const getDisasterMapData = async () => {
  const assessments = await getRapidAssessments().catch(() => []);
  return assessments.map((a: any) => ({
    id: a.id,
    lat: 0,
    lng: 0,
    jenis_bencana: a.disaster_type_name || 'Unknown',
    status: a.status,
    lokasi: `${a.district || ''}, ${a.regency || ''}`.replace(/^, /, ''),
  }));
};

// ──────────────── Dashboard (aggregated from real data) ────────────────

export const getDashboardData = async () => {
  const assessments = await getRapidAssessments().catch(() => []);
  const types = await getDisasterTypes().catch(() => []);

  const byType = types.map((t: any) => ({
    name: t.name,
    value: assessments.filter((a: any) => a.disaster_type_name === t.name).length,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
  })).filter((t: any) => t.value > 0);

  return {
    stats: {
      total_disaster: assessments.length,
      total_victims: 0,
      total_refugees: 0,
      total_damage: 0,
    },
    byType,
    trend: [],
    mapPoints: [],
  };
};

export const generateReport = async (type: string) => {
  console.log(`TODO: POST /reports/generate`, { type });
  return { success: true, url: "#" };
};

// ──────────────── Map Objects (Collaborative Map) ────────────────

export const getMapObjects = async (disasterId: number) => {
  const json = await apiFetch(`/map-objects/${disasterId}`);
  return json.data;
};

export const getMapObjectsByAssessment = async (assessmentId: number) => {
  const json = await apiFetch(`/map-objects/assessment/${assessmentId}`);
  return json.data;
};

export const getPublicMapObjects = async (disasterId: number) => {
  const json = await apiFetch(`/map-objects/public/${disasterId}`);
  return json.data;
};

export const createMapObject = async (payload: any) => {
  const json = await apiFetch("/map-objects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return json.data;
};

export const updateMapObject = async (id: number, payload: any) => {
  const json = await apiFetch(`/map-objects/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return json.data;
};

export const deleteMapObject = async (id: number) => {
  const json = await apiFetch(`/map-objects/${id}`, { method: "DELETE" });
  return json;
};

export const uploadMapPhotos = async (id: number, files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append("photos", file));
  const json = await apiFetch(`/map-objects/${id}/photos`, {
    method: "POST",
    body: formData,
  });
  return json.data;
};

// ──────────────── Rapid Assessment (Kaji Cepat) ────────────────

export const getRapidAssessments = async (filters?: { status?: string }) => {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  const qs = params.toString();
  const json = await apiFetch(`/rapid-assessments${qs ? `?${qs}` : ""}`);
  return json.data;
};

export const getRapidAssessmentsDropdown = async () => {
  const json = await apiFetch("/rapid-assessments/dropdown");
  return json.data;
};

export const getRapidAssessmentById = async (id: number) => {
  const json = await apiFetch(`/rapid-assessments/${id}`);
  return json.data;
};

export const createRapidAssessment = async (payload: any) => {
  const json = await apiFetch("/rapid-assessments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return json.data;
};

export const updateRapidAssessment = async (id: number, payload: any) => {
  const json = await apiFetch(`/rapid-assessments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return json.data;
};

export const deleteRapidAssessment = async (id: number) => {
  const json = await apiFetch(`/rapid-assessments/${id}`, { method: "DELETE" });
  return json;
};

export const generateWAMessage = async (id: number) => {
  const json = await apiFetch(`/rapid-assessments/${id}/generate-wa`, { method: "POST" });
  return json.data;
};

export const sendWA = async (id: number, phoneNumbers: string[]) => {
  const json = await apiFetch(`/rapid-assessments/${id}/send-wa`, {
    method: "POST",
    body: JSON.stringify({ phone_numbers: phoneNumbers }),
  });
  return json.data;
};

export const resendWA = async (id: number) => {
  const json = await apiFetch(`/rapid-assessments/${id}/resend-wa`, { method: "POST" });
  return json.data;
};

export const getWALogs = async (id: number) => {
  const json = await apiFetch(`/rapid-assessments/${id}/wa-logs`);
  return json.data;
};

// ──────────────── Juklak Field Assessment ────────────────

export const getJuklakAssessments = async () => {
  const json = await apiFetch("/field-assessments/juklak");
  return json.data;
};

export const getJuklakAssessment = async (id: number) => {
  const json = await apiFetch(`/field-assessments/juklak/${id}`);
  return json.data;
};

export const createJuklakAssessment = async (payload: any) => {
  const json = await apiFetch("/field-assessments/juklak", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return json.data;
};

export const updateJuklakAssessment = async (id: number, payload: any) => {
  const json = await apiFetch(`/field-assessments/juklak/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return json.data;
};

export const deleteJuklakAssessment = async (id: number) => {
  const json = await apiFetch(`/field-assessments/juklak/${id}`, { method: "DELETE" });
  return json.data;
};

// ──────────────── Report Generator ────────────────

export const downloadReportDocx = async (assessmentId: number) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/reports/generate/docx/${assessmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({ message: "Download gagal" }));
    throw new Error(json.message || "Download gagal");
  }
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition") || "";
  const filename = cd.match(/filename="?([^"]+)"?/)?.[1] || `laporan_${assessmentId}.docx`;
  return { blob, filename };
};

export const downloadReportPdf = async (assessmentId: number) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/reports/generate/pdf/${assessmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({ message: "Download gagal" }));
    throw new Error(json.message || "Download gagal");
  }
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition") || "";
  const filename = cd.match(/filename="?([^"]+)"?/)?.[1] || `laporan_${assessmentId}.pdf`;
  return { blob, filename };
};

