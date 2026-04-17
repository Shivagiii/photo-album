

import { getOtp, verifyOtp } from "@/lib/service";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface RequestLoginType {
  message: string;
  user: any;
}


export default function LoginFormContainer() {
  const [email, setEmail] = useState("shivangiadeshara@gmail.com");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOptSent] = useState(false);
  const router = useRouter()



  const handleClick = async (email:string, otp:string) => {
    if(isOtpSent) {
     const response =await verifyOtp(email, otp);
     if (response?.message == "Vertified successfully") {
      console.log("Login");
      router.push("/dashboard")
    }
    } else {
        const response =await getOtp(email);
     if (response?.message == "Vertified successfully") {
    
     setIsOptSent(true);
    }
      ;
    }
  }

  return (
    <div className="glass p-6  flex rounded-md md:p-10 flex-col gap-2">
      <label>Email*</label>
      <input
        className="border rounded-md p-2 w-[300px]"
        value={email}
        placeholder="shiavngi@gmail.com"
        type="email"
        onChange={(e) => setEmail(e.target.value)}
      />

      {isOtpSent && (
        <input
          className="border   rounded-md p-2"
          value={otp}
          placeholder="OTP "
          type="string"
          onChange={(e) => setOtp(e.target.value)}
        />
      )}
      <button
        className="border cursor-pointer btn-soft"
        disabled={email === ""}
        onClick={() => handleClick(email, otp)}
      >
        {isOtpSent ? "Login" : "Get OTP"}
      </button>
    </div>
  );
}
