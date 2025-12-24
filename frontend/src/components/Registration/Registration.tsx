// import Registration from "./Registration";
import { registration } from "../../apis/backend";

import React, { useState } from "react";
const Registration = () => {
  const [userData, setUserData] = useState<any>({
    newUsername: "",
    newPassword: "",
    newFirstName: "",
    newLastName: "",
    newEmail: "",
    // adminUsername: "",
    // adminPassword: "",
    resource: "",
    user_name: "",
    user_email: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Registration form submitted with data:", userData);

    await registration(userData);
    // Optionally, you can reset the form after submission
    setUserData({
        newUsername: "",
        newPassword: "",
        newFirstName: "",
        newLastName: "",
        newEmail: "",
        // adminUsername: "",
        // adminPassword: "",
        resource: "",
        user_name: "",
        user_email: "",
        });

  };

  return (
    <div>
      <form
        className="border w-15 d-flex flex-column m-auto shadow-sm"
        style={{ borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}
        onSubmit={handleSubmit}
      >
        <div
          className="d-flex justify-content-center"
          style={{
            background: "#DCDCDC",
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
          }}
        >
          <h3 className="fs-5 fw-light p-2">Sign Up</h3>
        </div>
        <div className="d-flex flex-column gap-4 p-4 align-items-center">
          <input
            type="text"
            className="form-control bg-light border-1"
            name="newUsername"
            placeholder="Enter Username"
            value={userData.newUsername}
            onChange={(e) =>
              setUserData({
                ...userData,
                [e.target.name]: e.target.value,
              })
            }
          />
          <input
            type="Enter Password"
            className="form-control bg-light border-1"
            name="newPassword"
            placeholder="Password"
            value={userData.newPassword}
            onChange={(e) =>
              setUserData({
                ...userData,
                [e.target.name]: e.target.value,
              })
            }
          />
          <input
            type="text"
            className="form-control bg-light border-1"
            name="newFirstName"
            placeholder="Enter First Name"
            value={userData.newFirstName}
            onChange={(e) =>
              setUserData({
                ...userData,
                [e.target.name]: e.target.value,
              })
            }
          />
          <input
            type="text"
            className="form-control bg-light border-1"
            name="newLastName"
            placeholder="Enter Last Name"
            value={userData.newLastName}
            onChange={(e) =>
              setUserData({
                ...userData,
                [e.target.name]: e.target.value,
              })
            }
          />
          <input
            type="email"
            className="form-control bg-light border-1"
            name="newEmail"
            placeholder="Enter Email Address"
             value={userData.newEmail}
            
            onChange={(e) =>
              setUserData({
                ...userData,
                [e.target.name]: e.target.value,
              })
            }
          />
          {/* <input
            type="string"
            className="form-control bg-light border-1"
            name="adminUsername"
            placeholder="Enter adminUsername"
            value={userData.adminUsername}
            
            onChange={(e) =>
              setUserData({
                ...userData,
                [e.target.name]: e.target.value,
              })
            }
          /> */}
          {/* <input
            type="password"
            className="form-control bg-light border-1"
            name="adminPassword"
            placeholder="Enter adminPassword"
            value={userData.adminPassword}
            
            onChange={(e) =>
              setUserData({
                ...userData,
                [e.target.name]: e.target.value,
              })
            }
          /> */}
          <input
            type="string"
            className="form-control bg-light border-1"
            name="resource"
            placeholder="Enter resourceName"
            value={userData.resource}
            
            onChange={(e) =>
              setUserData({
                ...userData,
                [e.target.name]: e.target.value,
              })
            }
          />
          <input
            type="string"
            className="form-control bg-light border-1"
            name="user_name"
            placeholder="Enter user_name"
            value={userData.user_name}
            
            onChange={(e) =>
              setUserData({
                ...userData,
                [e.target.name]: e.target.value,
              })
            }
          />
          <input
            type="string"
            className="form-control bg-light border-1"
            name="user_email"
            placeholder="Enter user_email"
            value={userData.user_email}
            
            onChange={(e) =>
              setUserData({
                ...userData,
                [e.target.name]: e.target.value,
              })
            }
          />
          <button
            type="submit"
            className="btn text-white w-100"
            style={{
              background: "#2D88D4",
              fontSize: "18px",
              borderRadius: "10px",
            }}
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default Registration;
