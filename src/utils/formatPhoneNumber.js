export const formatPhoneNumber = (phoneNumber) => {
    let cleanedNumber = phoneNumber.replace(/\D/g, "");
    if (cleanedNumber.startsWith("0")) {
      return "+84" + cleanedNumber.slice(1);
    }
    if (cleanedNumber.startsWith("+")) {
      return cleanedNumber;
    }
    return phoneNumber;
  };