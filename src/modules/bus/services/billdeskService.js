const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const createBillDeskOrder = async (payload) => {
  try {
    const response = await fetch(`${API_BASE}/billdesk/order`, {  
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("BillDesk Service Error:", error);
    return null;
  }
};