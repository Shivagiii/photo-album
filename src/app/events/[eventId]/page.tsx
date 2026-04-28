"use client";
import { PhotoDetails } from "@/app/types";
import DomeGallery from "@/components/domeGallery/DomeGallery";
import ImageGrid from "@/components/domeGallery/ImageGrid";
import { API_BASE, fetchEventPhotos, uploadEventPhotos } from "@/lib/api";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [photoDetails, setPhotoDetails] = useState<PhotoDetails[] | []>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  const getEventPhotos = async (eventId: string) => {
    const result = await fetchEventPhotos(eventId);

    if (result?.photo_list.length) {
      setPhotoDetails(result.photo_list);
    }
  };

  useEffect(() => {
    if (eventId) {
      getEventPhotos(eventId);
    }
  }, [eventId]);

  const handlePhotoUpload = async(selectedFile:File) => {
    const formdata = new FormData();
      formdata.append("event_id", eventId);
      formdata.append("uploaded_by_user_id", "scdc");
      formdata.append("uploaded_by_name", "Shivangi");
      formdata.append("file", selectedFile);

      const response =await uploadEventPhotos(formdata);

      if (response?.message == "Uploaded succesfully"){ 
        setSelectedFile(null);
      getEventPhotos(eventId);
    }

  }

  useEffect( () => {
    if (selectedFile) {
      handlePhotoUpload(selectedFile)
    }
  }, [selectedFile]);

  return (
    <div >
      <div className="w-full p-2 flex items-center justify-center gap-10">
        <label className="glass p-3 cursor-pointer inline-block ">
          Upload Photos
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>
      </div>
      {/* {photoDetails.map((photo, index) => (
        <div
          key={index}
          className="w-[200px] h-auto glass p-2  rounded-md overflow-hidden"
        >
          <img src={photo.image_url} className="rounded-md " />
        </div>
      ))} */}
      <ImageGrid
        items={photoDetails}
        ease="power3.out"
        duration={0.9}
        stagger={0.05}
        animateFrom="bottom"
        scaleOnHover
        hoverScale={0.95}
       
        
      />
        {/* <div style={{ width: "100vw", height: "90vh" }}>
      <DomeGallery
        fit={1}
        minRadius={700}
        maxVerticalRotationDeg={30}
        segments={34}
        dragDampening={0}
        dragSensitivity={10}
        enlargeTransitionMs={50}
        grayscale={false}
        images={photoDetails}
      />
      </div> */}
    </div>
  );
}
