import {
  BackendResponse,
  EventDetailsResponse,
  EventListType,
} from "@/app/types";
import axios from "axios";

export const API_BASE = "http://127.0.0.1:8000";

export const fetchbACKEND = async () => {
  try {
    const response = await axios.get(`${API_BASE}`);
    return response.data;
  } catch (e) {
    console.error("Error fetching event photos:", e);
  }
}

export const fetchEvents = async () => {
  try {
    const response = await axios.get(`${API_BASE}/events`);
    return response.data;
  } catch (e) {
    console.error("Error fetching event photos:", e);
  }
}

export const fetchEventPhotos = async (eventId: string) => {
  try {
    const results = await axios.get<EventDetailsResponse>(
      `${API_BASE}/photos/event/${eventId}`,
    );
    console.log(results);
    return results.data;
  } catch (e) {
    console.error("Error fetching event photos:", e);
  }
};

  export const uploadEventPhotos = async (formdata:FormData) => {
   
    try {
      const response = await axios.post(
        `${API_BASE}/photos/uploads`,
        formdata,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      console.log(response);

      return response.data;
    } catch (e) {
      console.log(e);
    }
  };