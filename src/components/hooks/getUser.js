import userService from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

const getUser = async () => {
  const { currentUser } = useAuth();

  if (!currentUser?.login) {
    return null;
  }

  try {
    const res = await userService.getUserByLogin(currentUser.login);
    return res.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export default getUser;
