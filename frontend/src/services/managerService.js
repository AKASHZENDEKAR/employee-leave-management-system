import api from "./api";

export const getManagerDashboard = async () => {
  const response = await api.get("/dashboard/manager/");
  return response.data;
};

export const getAllLeaves = async (params = {}) => {
  const response = await api.get("/leaves/", {
    params,
  });

  return response.data;
};

export const approveLeave = async (
  leaveId,
  managerComment = ""
) => {
  const response = await api.post(
    `/leaves/${leaveId}/approve/`,
    {
      manager_comment: managerComment,
    }
  );

  return response.data;
};

export const rejectLeave = async (
  leaveId,
  managerComment = ""
) => {
  const response = await api.post(
    `/leaves/${leaveId}/reject/`,
    {
      manager_comment: managerComment,
    }
  );

  return response.data;
};