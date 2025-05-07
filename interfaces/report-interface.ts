export type ReportType = "user" | "post" | "trip";
export type ReportStatus = "pending" | "in_progress" | "resolved";

export interface ReporterInfo {
  _id: string;
  username: string;
  profile_picture: {
    url: string;
  };
}

export interface IReport {
  _id: string;
  reporter: ReporterInfo;
  targetId: string;
  targetType: ReportType;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}
