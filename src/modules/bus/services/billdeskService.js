export const createBillDeskOrder = async (payload) => {
  try {

    const response = await fetch(
      "http://localhost:5000/billdesk/order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    console.log("BillDesk Order Response:", data);

    return data;

  } catch (error) {

    console.error("BillDesk Service Error:", error);

    return null;
  }
};