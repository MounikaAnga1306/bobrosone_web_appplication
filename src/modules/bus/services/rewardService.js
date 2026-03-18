import axios from "axios";

export const getRewardPoints = async (uid, fare) => {

  try {

    const response = await axios.get("/rewardPoints", {
      params: {
        uid,
        fare
      }
    });

    return response.data;

  } catch (error) {

    console.error("Reward Service Error:", error);

    return null;

  }

};