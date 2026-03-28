const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const fetchCities = async (name) => {
  const url = `${API_BASE}/cities?name=${name}`;

  console.log("Calling:", url);

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("API failed");
  }

  return res.json();
};