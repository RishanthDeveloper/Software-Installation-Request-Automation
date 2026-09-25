import { RequestState, SoftwareRequest } from "../types"

// --- Mock Data ---
export const MOCK_CATALOG = [
  { id: "soft_1", name: "Visual Studio Code", isRestricted: false, licenses: 999 },
  { id: "soft_2", name: "IntelliJ IDEA Ultimate", isRestricted: true, licenses: 5 },
  { id: "soft_3", name: "Adobe Photoshop", isRestricted: true, licenses: 2 },
  { id: "soft_4", name: "Docker Desktop", isRestricted: false, licenses: 999 },
]

export const MOCK_REQUESTS: SoftwareRequest[] = [
  {
    id: "REQ1042",
    sys_id: "sys_req_1",
    employee_name: "Jane Doe",
    department: "Engineering",
    software_name: "IntelliJ IDEA Ultimate",
    software_version: "2024.1",
    installation_type: "new",
    business_justification: "Need for Java microservices development.",
    urgency: "Medium",
    required_by_date: "2024-03-20",
    state: "In Progress",
    created_at: "2024-03-12T09:00:00Z",
  },
  {
    id: "REQ1038",
    sys_id: "sys_req_2",
    employee_name: "Alex Johnson",
    department: "Marketing",
    software_name: "Adobe Photoshop",
    software_version: "CC",
    installation_type: "new",
    business_justification: "Campaign assets generation.",
    urgency: "High",
    required_by_date: "2024-03-15",
    state: "Rejected",
    created_at: "2024-03-10T14:20:00Z",
  }
]

// Simulate Network Delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// --- API Client ---
export const ServiceNowAPI = {
  // Catalog
  getCatalog: async () => {
    await delay(500)
    return MOCK_CATALOG
  },
  
  // Requests
  getMyRequests: async () => {
    await delay(600)
    return MOCK_REQUESTS
  },
  
  createRequest: async (data: any) => {
    await delay(1000)
    return { id: `REQ${Math.floor(Math.random() * 10000)}`, ...data }
  },

  // Approvals
  getPendingApprovals: async () => {
    await delay(700)
    return [
      {
        sys_id: "appr_101",
        request_id: "REQ1045",
        requester: "Alex Johnson",
        department: "Marketing",
        software: "Adobe Photoshop CC",
        urgency: "High",
        justification: "Need Photoshop for the upcoming Q3 campaign.",
        requiredBy: "2024-03-20",
        created: "2024-03-14T09:00:00Z",
      }
    ]
  },

  approveRequest: async (sysId: string) => {
    await delay(500)
    return { success: true }
  },

  rejectRequest: async (sysId: string, reason: string) => {
    await delay(500)
    return { success: true }
  },

  // IT Tasks
  getITTasks: async () => {
    await delay(800)
    return [
      {
        sys_id: "task_1",
        request_id: "REQ1050",
        task_number: "SCTASK00101",
        employee: "Jane Doe",
        software: "Visual Studio Code",
        priority: "Medium",
        status: "Assigned" as const,
        sla_due: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      }
    ]
  },

  updateTaskStatus: async (sysId: string, status: string) => {
    await delay(500)
    return { success: true }
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    await delay(700)
    return {
      totals: { total: 142, pending: 12, inProgress: 8, completed: 110, rejected: 12 },
      softwareSplit: [
        { name: "VS Code", count: 45 },
        { name: "IntelliJ", count: 28 },
        { name: "Docker", count: 32 },
        { name: "Photoshop", count: 12 },
      ],
      departmentSplit: [
        { name: "Engineering", count: 85 },
        { name: "Marketing", count: 22 },
        { name: "Sales", count: 18 },
      ],
      slaStatus: [
        { name: "Met", value: 92, fill: "hsl(var(--success))" },
        { name: "Breached", value: 8, fill: "hsl(var(--destructive))" },
      ]
    }
  }
}
