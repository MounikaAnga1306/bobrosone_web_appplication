const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// Block Ticket API
export const blockTicket = async (body) => {

  const url = `${API_BASE}/blockTicket`;

  try {

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    return data;

  } catch (error) {

    console.error("Block Ticket API Error:", error);
    throw error;

  }

};