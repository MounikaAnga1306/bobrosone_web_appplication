import api from "../../../core/http/axiosInstance";

export const fetchAirlines = async () => {
  const payload = {
    table: "airlines",
    columns: ["*"],
  };

  return api.post("/db/select", payload);
};
