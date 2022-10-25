import { API_UPDATE_SPACE } from "../configs/constants";
import { getCookie, getUrlParameter } from "../lib/utils";

export const updateSpace = entities => {
  const spaceSlug = getUrlParameter("space");
  const url = `${API_UPDATE_SPACE}/${spaceSlug}`;
  const token = getCookie("accessToken");
  const data = JSON.stringify({
    entities
  });
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
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
