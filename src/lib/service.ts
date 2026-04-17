import { RequestLoginType } from "@/components/loginForm/LoginFormContainer";
import axios from "axios";
import { API_BASE } from "./api";

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const results = await axios.post<RequestLoginType>(
      `${API_BASE}/auth/verify-otp`,
      {
        email: email,
        otp: otp,
      },
    );
    
    return results.data;
  } catch (e) {
    console.log(e);
  }
};

  export const getOtp= async (email:string) => {
    try {
      const results = await axios.post<RequestLoginType>(
        `${API_BASE}/auth/request-login`,
        {
          email: email,
        },
      );
      
      return results.data;
    } catch (e) {
      console.log(e);
    }
  }