import axios from 'axios';

export const fetchFlightStatus = async ({ carrier, flightNumber, date }) => {
  const response = await axios.get(
    `https://api.bobros.org/flights/flight-status?carrier=${carrier}&flightNumber=${flightNumber}&date=${date}`
  );

  return response.data;
};
