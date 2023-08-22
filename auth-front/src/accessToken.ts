let accessToken = "";

export const setAccessToken = (t: string) => {
  accessToken = t;
  return;
};

export const getAccessToken = () => {
  return accessToken;
};
