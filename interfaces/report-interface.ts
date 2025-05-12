export type ReportType = "user" | "post" | "trip";
export type ReportStatus = "pending" | "in_progress" | "resolved";

export interface IReport {
  _id: string;
  reporter: { username: string; profile_picture?: string };
  targetId: string;
  targetType: "user" | "post" | "trip";
  targetName?: string; // ➕
  targetOwner?: string | null;
  reason: string;
  status: "pending" | "in_progress" | "resolved";
  createdAt: string;
}
