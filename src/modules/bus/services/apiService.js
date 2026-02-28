const API_BASE = import.meta.env.VITE_API_BASE_URL;

//console.log("API BASE URL:", API_BASE);
export const fetchCities = async (name) => {
  const res = await fetch(`${API_BASE}/cities?name=${name}`);
  if (!res.ok) {
    throw new Error("API failed");
  }
  return res.json();
};
