"use client";

import LoginFormContainer from "@/components/loginForm/LoginFormContainer";
import { fetchbACKEND } from "@/lib/api";
import { useEffect, useState } from "react";
import { BackendResponse } from "../types";

export default function LoginPage() {
  const [data, setData] = useState<BackendResponse | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const response = await fetchbACKEND();
    setData(response);
  }
  return (
    <div className="flex rounded-full  flex-col flex-1 items-center justify-center ">

      <LoginFormContainer/>
    </div>
  );
}
