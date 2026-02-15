export const formatPrice = (value: string) => {
  let numericValue = value;
 
  // if number has any prefix like Rs. $, €, Rs. etc remove them
  numericValue = numericValue.replace(/[^0-9.-]+/g, "");

  // seperate 3 digits with comma from right
  const parts = numericValue.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};
