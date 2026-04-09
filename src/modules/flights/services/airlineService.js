// src/services/airlineService.js

const API_BASE_URL ='https://api.bobros.co.in/db/select';

export const fetchAirlines = async () => {
  const response = await fetch(`${API_BASE_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      table: "airlines",
      columns: ["*"],
      conditions: {}
    })
  });

  const data = await response.json();
  return data.rows || [];
};