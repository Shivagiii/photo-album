import { EventType } from "@/app/types";
import { API_BASE } from "@/lib/api";
import Link from "next/link";

export default function EventCards({ event }: { event: EventType }) {
  return (
    <Link href={`/events/${event._id}`}>
      <div className="w-[20%] glass rounded-md w-[300px] overflow-hidden group cursor-pointer transition-shadow duration-300 hover:shadow-xl">
        <img
          src={`http://localhost:3001/${event.slug}.png`}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
        />
        {/* <div>
    {event.name}
  </div> */}
      </div>
    </Link>
  );
}
