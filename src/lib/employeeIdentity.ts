export const normalizeEmployeeId = (value?: string | number | null) =>
  String(value ?? "").trim().toUpperCase();

export const getStoredEmployeeId = (user: any) =>
  normalizeEmployeeId(user?.employee_id || user?.username);

export const isSameEmployee = (employee: any, user: any) => {
  const storedEmployeeId = getStoredEmployeeId(user);
  const employeeId = normalizeEmployeeId(employee?.employee_id);
  const fullName = String(user?.full_name || user?.name || "").trim().toUpperCase();
  const employeeName = String(employee?.full_name || employee?.name || "").trim().toUpperCase();

  return Boolean(
    (storedEmployeeId && employeeId === storedEmployeeId) ||
    (fullName && employeeName === fullName)
  );
};

export const mergeEmployeeProfile = (user: any, employee: any) => ({
  ...user,
  employee_id: employee.employee_id || user?.employee_id || user?.username,
  full_name: employee.full_name || employee.name || user?.full_name,
  name: employee.name || employee.full_name || user?.name,
  role: employee.role || user?.role,
  position: employee.position || user?.position,
  status: employee.status || user?.status,
});
