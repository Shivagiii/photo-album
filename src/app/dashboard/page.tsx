"use client";
import { fetchEvents } from "@/lib/api";
import { useEffect, useState } from "react";
import { EventListType, EventType } from "../types";
import EventCards from "@/components/event/EventCards";

export default function DashboardPage() {
  const [events, setEvents] = useState<EventType[]>([]);


  const fetchEventList = async () => {
    const response = await fetchEvents();
    setEvents(response?.event_list);
  };
  useEffect(() => {
    fetchEventList();
  }, []);

  return (
    <div className="flex p-10 align-center h-full justify-center flex-col ">

    <div className="flex flex-wrap gap-10 p-10 align-center h-full justify-center">
      {events.map((event) => (
        <EventCards event={event} />
      ))}
    </div>
    </div>

  );
}
