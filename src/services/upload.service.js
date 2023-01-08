export const uploadFile = file => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file, file.name);
    // formData.append("folderName", "temp");
    xhr.open("POST", "/spaces/upload", true);
    xhr.send(formData);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          reject(xhr.responseText);
        }
      }
    };
  });
};

export const uploadFileV2 = file => {
  const formData = new FormData();
  formData.append("file", file, file.name);
  return fetch("/spaces/upload", {
    method: "POST",
    body: formData,
    headers: {
      // "Content-Type": "multipart/form-data"
    }
  })
    .then(response => response.json())
    .catch(error => {
      console.error("Error:", error);
    });
};
