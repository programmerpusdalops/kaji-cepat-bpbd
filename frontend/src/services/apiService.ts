/*
BACKEND REQUIREMENT - API Service
All endpoints are placeholders for Express.js backend integration.
Replace dummy data imports with actual fetch calls when backend is ready.
*/

import { dashboardStats, disasterByType, disasterTrend, mapPoints } from "@/dummy-data/dashboard";
import { dummyReports, type DisasterReport } from "@/dummy-data/reports";
import { dummyAssessments, dummyImpactData, dummyTeamAssignments, dummyUsers, dummyMasterData } from "@/dummy-data/assessments";

// TODO: Replace base URL with actual backend
const BASE_URL = "/api";

/*
Endpoint: GET /api/disasters/dashboard
Response: { total_disaster, total_victims, total_refugees, total_damage, disaster_by_type, disaster_trend, map_points }
*/
export const getDashboardData = async () => {
  return { stats: dashboardStats, byType: disasterByType, trend: disasterTrend, mapPoints };
};

/*
Endpoint: GET /api/disaster-reports
Response: { data: DisasterReport[] }
*/
export const getDisasterReports = async (): Promise<DisasterReport[]> => {
  return dummyReports;
};

/*
Endpoint: GET /api/disaster-reports/{id}
Response: DisasterReport
*/
export const getDisasterReportById = async (id: number): Promise<DisasterReport | undefined> => {
  return dummyReports.find(r => r.id === id);
};

/*
Endpoint: POST /api/disaster-reports/{id}/verify
Payload: { status, verification_note, verified_by }
*/
export const verifyReport = async (id: number, payload: { status: string; verification_note: string; verified_by: string }) => {
  console.log(`TODO: POST ${BASE_URL}/disaster-reports/${id}/verify`, payload);
  return { success: true };
};

/*
Endpoint: POST /api/team-assignments
Payload: { report_id, team_name, leader, total_members, vehicle, departure_time, arrival_estimate }
*/
export const createTeamAssignment = async (payload: any) => {
  console.log(`TODO: POST ${BASE_URL}/team-assignments`, payload);
  return { success: true, id: Date.now() };
};

export const getTeamAssignments = async () => dummyTeamAssignments;

/*
Endpoint: POST /api/field-assessment
Payload: { report_id, location, victims, house_damage, facility_damage, infrastructure_damage, photos }
*/
export const submitFieldAssessment = async (payload: any) => {
  console.log(`TODO: POST ${BASE_URL}/field-assessment`, payload);
  return { success: true };
};

export const getAssessments = async () => dummyAssessments;

/*
Endpoint: GET /api/disaster-impact
*/
export const getDisasterImpact = async () => dummyImpactData;

/*
Endpoint: POST /api/emergency-needs
Payload: { assessment_id, food, water, tents, blankets, medicine, heavy_equipment }
*/
export const submitEmergencyNeeds = async (payload: any) => {
  console.log(`TODO: POST ${BASE_URL}/emergency-needs`, payload);
  return { success: true };
};

/*
Endpoint: GET /api/disaster-map
*/
export const getDisasterMapData = async () => mapPoints;

/*
Endpoint: POST /api/reports/generate
*/
export const generateReport = async (type: string) => {
  console.log(`TODO: POST ${BASE_URL}/reports/generate`, { type });
  return { success: true, url: "#" };
};

/*
Endpoint: GET /api/users
*/
export const getUsers = async () => dummyUsers;

/*
Endpoint: GET /api/master-data
*/
export const getMasterData = async () => dummyMasterData;

/*
Endpoint: POST /api/auth/login
Payload: { email, password }
*/
export const login = async (email: string, password: string) => {
  console.log(`TODO: POST ${BASE_URL}/auth/login`, { email });
  if (email === "admin@bpbd.go.id" && password === "admin123") {
    return { success: true, token: "dummy-jwt-token", user: { name: "Admin BPBD", email, role: "ADMIN" } };
  }
  throw new Error("Email atau password salah");
};
