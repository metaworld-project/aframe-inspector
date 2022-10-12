import { API_UPLOAD_FILE } from "../configs/constants";

export const uploadFile = file => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("fileInput", file);
    formData.append("folderName", "temp");
    xhr.open("POST", API_UPLOAD_FILE, true);
    xhr.send(formData);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          reject(xhr.responseText);
        }
      }
    };
  });
};
