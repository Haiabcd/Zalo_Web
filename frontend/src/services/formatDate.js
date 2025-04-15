import { format } from "date-fns";

export const formatUpdatedAt = (updatedAt) => {
  const now = new Date();
  const updatedDate = new Date(updatedAt);
  const diffMs = now - updatedDate;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  const isYesterday =
    now.getDate() - updatedDate.getDate() === 1 &&
    now.getMonth() === updatedDate.getMonth() &&
    now.getFullYear() === updatedDate.getFullYear();

  if (diffSec < 60) {
    return "Vài giây";
  } else if (diffMin < 60) {
    return `${diffMin} phút`;
  } else if (diffHr < 24 && now.getDate() === updatedDate.getDate()) {
    return `${diffHr} giờ`;
  } else if (isYesterday) {
    return "Hôm qua";
  } else {
    return format(updatedDate, "dd/MM");
  }
};
