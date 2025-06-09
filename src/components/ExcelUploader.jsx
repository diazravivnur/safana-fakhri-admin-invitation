import React from "react";
import axios from "axios";
import { Button } from "@mui/material";

const ExcelUploader = () => {
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(
        "http://202.10.40.153:5000/api/wedding/v1/guests/upload",
        formData
      );
      alert("Berhasil upload Excel");
    } catch (err) {
      console.error(err);
      alert("Gagal upload Excel");
    }
  };

  return (
    <>
      <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls" />
    </>
  );
};

export default ExcelUploader;
