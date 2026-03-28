const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const fetchCities = async (name) => {
  const res = await fetch(`/cities?name=${name}`);
  if (!res.ok) {
    throw new Error("API failed");
  }

  return res.json();
};