import { jwtDecode } from "jwt-decode";

function decodeToken(token) {
  try {
    const decoded = jwtDecode(token);
    
    return decoded;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}
export default decodeToken;

