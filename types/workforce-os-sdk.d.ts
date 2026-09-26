declare module '@olympion/workforce-os-sdk' {
  export interface Employee {
    id: string;
    name: string;
    email: string;
    [key: string]: unknown;
  }

  export interface EmployeeListParams {
    page?: number;
    pageSize?: number;
    [key: string]: unknown;
  }

  export interface EmployeeListResponse {
    data: Employee[];
    total: number;
  }

  export interface EmployeesResource {
    list(params?: EmployeeListParams): Promise<EmployeeListResponse>;
  }

  export interface WorkforceOSClient {
    employees: EmployeesResource;
  }

  export function createClient(
    config?: Record<string, unknown>
  ): WorkforceOSClient;

  export const employees: EmployeesResource;

  const workforceOS: {
    createClient: typeof createClient;
    employees: EmployeesResource;
  };

  export default workforceOS;
}
