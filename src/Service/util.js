const util={


 extractNameFromEmail:(email)=> {
  if (!email || typeof email !== "string") return "";

  // Extract the part before '@'
  const localPart = email.split("@")[0];

  // Remove digits
  const noDigits = localPart.replace(/[0-9]/g, "");

  // Replace dots or special characters with space
  const spaced = noDigits.replace(/[._-]/g, " ");

  // Capitalize each word
  const capitalized = spaced
    .split(" ")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return capitalized;
},
extractRole:(roleString) =>{
  if (!roleString || typeof roleString !== "string") return "";
  return roleString.replace(/^ROLE_/, "");
}



};
export default util;