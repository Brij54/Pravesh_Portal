import apiConfig from "../config/apiConfig";
// import { User } from "../context/LoginContext";

export type User = {
  username: string;
  password: string;
};

export type UserRegistration = {
  newUsername: string;
  newPassword: string;
  newFirstName: string;
  newLastName: string;
  newEmail: string;
  adminUsername: string;
  adminPassword: string;
  resource: string;

  user_name: string;
  user_email: string;
};
const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };
export const login = async (user: User) => {
  try {
    const { username, password } = user;
    const params = new URLSearchParams({
      username: username,
      password: password,
    });

     const loginData = {
      username: username,
      password: password,
    }
    const response = await fetch(
      `${apiConfig.API_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
        credentials: "include", // to receive cookies
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log("Cookies received:", document.cookie);

    let data = null;
    const text = await response.text();

    if (text) {
      data = JSON.parse(text); // only parse if body is not empty
      console.log("Login response body:", data);
    } else {
      console.log("No response body received");
    }

    return true;
  } catch (error) {
    console.error("Login failed:", error);
    return false;
  }
};


export const logout = async () => {
  try {
   

     
    const response = await fetch(
      `${apiConfig.API_BASE_URL}/auth/logout`,
      {
        method: "POST",
       credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Logout failed:", error);
    return false;
  }
};
export const registration = async (user:UserRegistration) => {
  try {
    // const {} = user;
    const params = new URLSearchParams({
      newUsername: user.newUsername,
      newPassword: user.newPassword,
      newFirstName: user.newFirstName,
      newLastName: user.newLastName,
      newEmail: user.newEmail,
      adminUsername: user.adminUsername,
      adminPassword: user.adminPassword,
      resource: user.resource,
    });
    const userToSave = {
      "user_name": user.user_name,
      "user_email": user.newEmail,
    };

    const response = await fetch(
      `${apiConfig.API_BASE_URL}/auth/add_user?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userToSave),
        credentials: "include", // important to receive cookies from backend
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Optional: handle body if server also returns JSON
    // const data = await response.json();
    // console.log("Registration response body:", data);
    console.log("Registration successful");
    return true; // or return any meaningful info
  } catch (error) {
    console.error("Registration failed:", error);
    return false;
  }
};

export const assignClientRole = async (role: string) => {
  try {
    const accessToken = getCookie("access_token");

    if (!accessToken) {
      throw new Error("Access token not found");
    }

    const params = new URLSearchParams({
      roleName: role,
    });

    const response = await fetch(
      `${apiConfig.API_BASE_URL}/auth/add-client-role?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`, // include the token here
        },
        credentials: "include", // include cookies if needed
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log("Role Assigned successfully");

    return true;
  } catch (error) {
    console.error("Assign Role failed:", error);
    return false;
  }
};
export const userResourceRoleMapping = async (data: any) => {
  try {
    const accessToken = getCookie("access_token");

    if (!accessToken) {
      throw new Error("Access token not found");
    }

    const params = new URLSearchParams({
      role: data.role,
      userName: data.userName,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
    });

    const response = await fetch(
      `${apiConfig.API_BASE_URL}/auth/user_resource_role?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`, // include token here
        },
        credentials: "include", // important to receive cookies from backend
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Optional: handle body if server also returns JSON
    // const data = await response.json();
    console.log("User Resource Role Mapping successful");

    return true; // or return any meaningful info
  } catch (error) {
    console.error("User Resource Role Mapping failed:", error);
    return false;
  }
};
