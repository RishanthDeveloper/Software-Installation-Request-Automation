// ServiceNow data dictionary types
export type RequestState = 
  | "Requested" 
  | "Manager Approval" 
  | "IT Approval" 
  | "In Progress" 
  | "Installed" 
  | "Closed" 
  | "Rejected";

export interface SoftwareRequest {
  id: string;
  sys_id: string;
  employee_name: string;
  department: string;
  software_name: string;
  software_version: string;
  installation_type: string;
  business_justification: string;
  urgency: string;
  required_by_date: string;
  state: RequestState;
  created_at: string;
}
