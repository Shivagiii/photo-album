import { PhotoDetails } from "@/app/types";
import AvatarInitials from "@/helpers/AvatarInitials"
import { formatFull, timeAgo } from "@/helpers/global"


type Props = {
    closePopup:() => void;
    showPrev :(e: React.MouseEvent) =>void;
    showNext :(e: React.MouseEvent) => void;
    deleting:boolean;
    handleDeletePhoto:(photoId:string) => void;
    deleteConfirm :boolean;
    selectedPhoto:PhotoDetails
}

const ImageViewBox = ({closePopup,showPrev,showNext,deleting,handleDeletePhoto,deleteConfirm,selectedPhoto}:Props) => {

    return(
         <div className="popup-overlay" onClick={closePopup}>

          <button className="popup-nav popup-nav--left" onClick={showPrev}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div className="popup-card" onClick={e => e.stopPropagation()}>

            {/* Image pane */}
            <div className="popup-image-pane">
              <img
                src={selectedPhoto.image_url}
                alt={selectedPhoto.uploaded_by_name ?? 'Photo'}
                className="popup-image"
              />
            </div>

            {/* Info sidebar */}
            <div className="popup-sidebar">

              <button className="popup-close" onClick={closePopup} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>

              <div className="popup-section">
                <p className="popup-label">Uploaded by</p>
                <div className="popup-uploader">
                  <AvatarInitials name={selectedPhoto.uploaded_by_name ?? 'Unknown'} />
                  <span className="popup-uploader-name">
                    {selectedPhoto.uploaded_by_name ?? 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="popup-divider" />

              <div className="popup-section">
                <p className="popup-label">Upload time</p>
                {selectedPhoto.uploaded_at ? (
                  <div className="popup-time">
                    <span className="popup-time-relative">{timeAgo(selectedPhoto.uploaded_at)}</span>
                    <span className="popup-time-full">{formatFull(selectedPhoto.uploaded_at)}</span>
                  </div>
                ) : (
                  <span className="popup-time-relative">Unknown</span>
                )}
              </div>

              <div className="popup-spacer" />

              {deleting ? (
                <p className="popup-deleted">✓ Deleted</p>
              ) : (
                <button
                  className={`popup-delete-btn${deleteConfirm ? ' popup-delete-btn--confirm' : ''}`}
                  onClick={() => handleDeletePhoto(selectedPhoto._id)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                  {deleteConfirm ? 'Confirm delete?' : 'Delete image'}
                </button>
              )}
            </div>
          </div>

          <button className="popup-nav popup-nav--right" onClick={showNext}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

        </div>
    )
}
export default  ImageViewBox