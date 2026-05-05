"use client";
import { PhotoDetails } from "@/app/types";
import ImageGrid from "@/components/domeGallery/ImageGrid";
import { fetchEventPhotos, uploadEventPhotos } from "@/lib/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [photoDetails, setPhotoDetails] = useState<PhotoDetails[] | []>([]);
  const [selectedFile, setSelectedFile] = useState<File[] | []>([]);
  const [refresh,setRefresh] = useState<boolean>(false)


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

  
  useEffect(() => {
    
    if(refresh){
       getEventPhotos(eventId);
       setRefresh(false)
    }
  }, [refresh]);

  const handlePhotoUpload = async(files:File[]) => {

    for (const file of files){
          const formdata = new FormData();
      formdata.append("event_id", eventId);
      formdata.append("uploaded_by_user_id", "scdc");
      formdata.append("uploaded_by_name", "Shivangi");
      formdata.append("file", file);

      await uploadEventPhotos(formdata);

    }



     
        setSelectedFile([]);
      getEventPhotos(eventId);
    

  }

  useEffect( () => {
    if (selectedFile?.length > 0) {
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
            accept="image/*,video/*"
            onChange={(e) => {
              const files= Array.from(e.target.files || [])
              setSelectedFile(files)
              e.target.value=""
            } }
            className="hidden"
            multiple
          />
        </label>
      </div>

      <ImageGrid
        items={photoDetails}
        ease="power3.out"
        duration={0.9}
        stagger={0.05}
        animateFrom="bottom"
        scaleOnHover
        hoverScale={0.95}
        setRefresh={setRefresh}
       
        
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
