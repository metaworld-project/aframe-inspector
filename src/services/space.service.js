import { uploadFileV2 } from "./upload.service";

function resizeImageKeepAspectRatio(image, maxWidth, maxHeight) {
  const ratio = Math.min(maxWidth / image.width, maxHeight / image.height);
  const width = image.width * ratio;
  const height = image.height * ratio;
  return { width, height };
}

function screenshotAndUpload() {
  const canvas = document
    .querySelector("a-scene")
    .components.screenshot.getCanvas("perspective");

  console.log(canvas);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
  const image = new Image();
  image.src = dataUrl;
  return new Promise((resolve, reject) => {
    image.onload = () => {
      const { width, height } = resizeImageKeepAspectRatio(image, 1024, 1024);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob(blob => {
        const file = new File([blob], "screenshot.jpg", { type: "image/jpeg" });
        return uploadFileV2(file)
          .then(resolve)
          .catch(reject);
      }, "image/jpeg");
    };
  });
}

export const updateSpace = async entities => {
  // const spaceSlug = getUrlParameter("space");
  // space is last part of url
  const spaceSlug = window.location.pathname.split("/").pop();
  const url = `/spaces/${spaceSlug}`;
  // const token = getCookie("accessToken");
  const { url: previewImage } = await screenshotAndUpload();
  const data = JSON.stringify({
    entities,
    previewImage
  });
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
        // Authorization: `Bearer ${token}`
      },
      body: data
    })
      .then(async response => {
        if (response.status === 200) {
          return response.json();
        } else {
          return reject(await response.json());
        }
      })
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
  });
};
