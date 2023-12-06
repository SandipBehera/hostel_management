const formatDate = (inputDate) => {
  const dateObject = new Date(inputDate);

  if (isNaN(dateObject.getTime())) {
    throw new Error("Invalid date");
  }

  const year = dateObject.getFullYear();
  const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Adding 1 because months are zero-indexed
  const day = String(dateObject.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
};
module.exports = formatDate;
