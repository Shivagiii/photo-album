export interface BackendResponse  {
  message: string;
};

export interface EventListType  {
  message: string;
  event_list:EventType[]

};
export interface EventType  {
  _id: string;
  name: string;
  slug: string;
  sort_order: number;
  "created at": string;
};
export interface EventDetailsResponse{
  "message":string,
  "photo_list":PhotoDetails[]

}
export interface PhotoDetails{
      "_id": string,
      "event_id": string,
      "uploaded_by_user_id": string,
      "uploaded_by_name":string,
      "image_url":string,
      "filename": string,
      "original_filename": string,
      "uploaded_at": string,
    
}