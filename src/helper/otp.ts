export const generateOtp = (digits = 6) =>
  Math.floor(
    Math.pow(10, digits - 1) + Math.random() * 9 * Math.pow(10, digits - 1),
  );
