import React from "react";
import "./FileUploader.css";

export default function FileUploader({ accept, onFileUpload, label }) {
  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };
  return (
    <div className="file-uploader">
      <label className="file-uploader-label">
        {label}
        <input type="file" accept={accept} onChange={handleChange} style={{ display: "none" }} />
      </label>
    </div>
  );
}
