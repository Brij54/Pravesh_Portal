// // import Login1 from "./Login1";

// import "../../App.css";
// import { useContext, useEffect, useState } from "react";
// import React from "react";
// import { useNavigate } from "react-router-dom";

// import { LoginContext } from "../../context/LoginContext";
// import { login } from "../../apis/backend";
// import Login1 from "./Login1";
// export type User = {
//   username: string;
//   password: string;
// };
// const Login = () => {
//   const navigate = useNavigate();
//   const { user, setUser, isLoggedIn, setIsLoggedIn } = useContext(LoginContext);
//   const [formData, setFormData] = useState<User>({
//     username: "",
//     password: "",
//   });
//   const [error, setError] = useState(""); // Updated: Added state for error handling

//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//   useEffect(() => {
//     console.log("User", user);
//     // setUser(formData);
//     const lowerCaseName: string = formData.username.toLowerCase();
//     if (
//       lowerCaseName === "admin@rasp.com" &&
//       formData.password === "admin@123"
//     ) {
//       console.log("User inside useEffect", user);

//       setIsLoggedIn(true);
//       console.log("Is user Logged In:", isLoggedIn);
//     } else {
//       setIsLoggedIn(false);
//     }
//   }, [formData]);

//   // Function to check if email is valid
//   const isEmailValid = () => {
//     // console.log("Email validity: ",emailRegex.test(formData.email_id));
//     return emailRegex.test(formData.username);
//   };

//   // Function to check if password satisfies requirements
//   const isPasswordValid = () => {
//     // Implement your password validation logic here
//     // For example, check if password length is greater than or equal to 8 characters
//     // console.log("Password validity: ",formData.password.length >= 6 );
//     return formData.password.length >= 6;
//   };
//   const getCookie = (name: string): string | null => {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
//     return null;
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     // setUser(formData);
//     const lowerCaseName: string = formData.username.toLowerCase();
//     setFormData({
//       ...formData,
//       ["username"]: lowerCaseName,
//       ["password"]: formData.password,
//     });

//     const loginObj: any = formData;
// try{
//   const res = await login(loginObj);
//     // const session_id = await res.json();
//     // const ssid = res;
//     const jwt = getCookie("jwt");
//     const accessToken = getCookie("access_token");
//     const refreshToken = getCookie("refresh_token");
//     // console.log("User session Id after submit", ssid);

//     // setIsLoggedIn(true);
//     // console.log("Is user Logged In after submit:", isLoggedIn);

//     // Set data in session storage
//     // sessionStorage.setItem("key", ssid);
//     // Get data from session storage
//     // const value = sessionStorage.getItem("key");
//     console.log("jwt token details", jwt); // Output: value
//     // if(res.statusCode === 200){}""
//     if(!res){
//       setError("Invalid username or password. Please try again.");
//       return;
//     }
//     if (res) {

//       navigate("/Dashboard");
//     }
// }

// catch(e){
//   console.error("Error in login:", e);
// }
    
//   };
//   // const handleLogin = () => {};

  
//     return (
//       <Login1 
//         formData={formData} 
//         setFormData={setFormData} 
//         error={error} 
//         setError={setError} 
//         handleSubmit={handleSubmit} 
//         isEmailValid={isEmailValid} 
//         isPasswordValid={isPasswordValid} 
//       />
//     );
  
// };

// export default Login;



import "../../App.css";
import { jwtDecode } from "jwt-decode";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext, User } from "../../context/LoginContext";
import { login } from "../../apis/backend";
import Login1 from "./Login1";

interface DecodedToken {
  preferred_name?: string;
  email?: string;
  resource_access?: any;
  [key: string]: any;
}

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setIsLoggedIn, setLoading } = useContext(LoginContext);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  // Helper function to get cookie value by name
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  // Handle login submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      console.log("Payload sending to backend:", formData);

      const success = await login(formData);
      console.log("Login response:", success);

      if (!success) {
        setError("Invalid username or password.");
        return;
      }

      // Check cookies for JWT
      const token =
        getCookie("jwt") || getCookie("access_token") || getCookie("token");

      if (!token) {
        setError("Token not found after login.");
        console.error("No JWT found in cookies.");
        return;
      }

      // Decode JWT
      const decoded = jwtDecode<DecodedToken>(token);
      console.log("Decoded JWT:", decoded);

      // Extract role safely
      const role: "admin" | "student" =
        decoded.resource_access?.["backend-api"]?.roles?.[0] === "admin"
          ? "admin"
          : "student";

      console.log("Role:", role);

      // Create new user object matching context type
      const newUser: User = {
        email_id: decoded.preferred_name || decoded.email || formData.username,
        password: formData.password,
        role: role,
      };

      // Update context
      setUser(newUser);
      setIsLoggedIn(true);
      setLoading(false);

      // Persist user info in localStorage
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("isLoggedIn", "true");

      // Navigate by role
      navigate(role === "admin" ? "/dashboard" : "/registration");
    } catch (err) {
      console.error("Error during login:", err);
      setError("An error occurred during login.");
    }
  };

  // ✅ Render Login1 and pass all props to it
  return (
    <Login1
      formData={formData}
      setFormData={setFormData}
      error={error}
      setError={setError}
      handleSubmit={handleSubmit}
    />
  );
};

export default Login;