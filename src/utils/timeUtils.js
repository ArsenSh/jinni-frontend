export const isNightTime = () => {
  const now = new Date();
  const hours = now.getHours();
  return hours >= 21 || hours < 6;
};

export const getArmeniaTime = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 4)); 
};