import api from "./api";

export const getLeaves = async (params = {}) => {
  const response = await api.get("/leaves/", {
    params,
  });

  return response.data;
};

export const createLeave = async (leaveData) => {
  const response = await api.post("/leaves/", leaveData);

  return response.data;
};

export const cancelLeave = async (leaveId) => {
  const response = await api.post(
    `/leaves/${leaveId}/cancel/`
  );

  return response.data;
};

export const getEmployeeDashboard = async () => {
  const response = await api.get(
    "/dashboard/employee/"
  );

  return response.data;
};