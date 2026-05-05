import {
  BackendResponse,
  EventDetailsResponse,
  EventListType,
} from "@/app/types";
import axios from "axios";

export const API_BASE = "https://api.buildyourown.co.in";

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
      );
      console.log(response);

      return response.data;
    } catch (e) {
      console.log(e);
    }
  };

    export const deletePhoto = async(photoId:string) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/photos/${photoId}`,
        {
          params:{
             "user_id":"scdc"
          }
        
        }
      );
      console.log(response);  
      return response.data
    }catch(e) {
      console.log(e);
    }
    }