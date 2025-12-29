// import "../../App.css";
// // import React from "react";

// export default function Login1(props: any) {
//   return (
//     <div className="d-flex flex-column" style={{ height: 800 }}>
//       <form
//         className="border w-15 d-flex flex-column m-auto shadow-sm"
//         style={{ borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}
//         onSubmit={props.handleSubmit}
//       >
//         <div
//           className=" d-flex justify-content-center "
//           style={{
//             background: "#DCDCDC",
//             borderTopLeftRadius: "10px",
//             borderTopRightRadius: "10px",
//           }}
//         >
//           <h3 className="fs-5 fw-light  p-2">Sign in</h3>
//         </div>
//         <div className=" d-flex flex-column gap-4 p-4 align-items-center ">
//           <div className="d-flex gap-4 justify-content-end">
//             <input
//               type="string"
//               className="form-control  bg-light  border-1"
//               name="username"
//               placeholder="Enter Username"
//               onChange={(e) =>
//                 props.setFormData({ ...(props.formData), [e.target.name]: e.target.value })
//               }
//             />
//           </div>
//           <div className="d-flex gap-4  justify-content-start">
//             <input
//               type="password"
//               className="form-control bg-light border-1 "
//               name="password"
//               placeholder="Enter Password"
//               onChange={(e) =>
//                 props.setFormData({ ...(props.formData), [e.target.name]: e.target.value })
//               }
//             />
//           </div>
//           <div className=" text-center col-sm-10">
//             <button
//               type="submit"
//               className="btn text-white w-100  "
//               style={{
//                 background: "#2D88D4",
//                 fontSize: "18px",
//                 borderRadius: "10px",
//               }}
//               // onClick={handleLogin}
//               // disabled={!props.isEmailValid() || !props.isPasswordValid()}
//             >
//               Login
//             </button>
//           </div>

//           {props.error && ( // Updated: Conditionally render error message
//             <div className="fs-6 text-danger">{props.error}</div>
//           )}

//           <div className="fs-6 d-flex flex-column align-items-center">
//             {/* <p className="mb-0 m-4">Forgot Password</p> */}
//             <p>
//               Don't have an account?{" "}
//               <a href="#" className="text-decoration-none">
//                 Click Me
//               </a>
//             </p>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

import "../../App.css";
// import React from "react";

export default function Login1(props: any) {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{
        height: "100vh",
        width: "min(30vw,400px)",
        background: "#ffffff",
      }}
    >
      <form className="w-100 mw-400 p-4" onSubmit={props.handleSubmit}>
        {/* <div
          className=" d-flex justify-content-center "
          style={{
            background: "#DCDCDC",
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
          }}
        > */}
        <h3 className="text-center text-primary fw-bold mb-4">Login</h3>
        {/* </div> */}
        <div className=" mb-3 ">
          {/* <div className="d-flex gap-4 justify-content-end"> */}
          <input
            type="string"
            className="form-control  bg-light  border-1"
            name="username"
            placeholder="Enter Username"
            style={{
              padding: "14px",
              borderRadius: "10px", // 🔥 smooth curve
            }}
            onChange={(e) =>
              props.setFormData({
                ...props.formData,
                [e.target.name]: e.target.value,
              })
            }
          />
          {/* </div> */}
          <div style={{ height: "18px" }}></div>
          <div className="mb-4">
            <input
              type="password"
              className="form-control bg-light border-1 "
              name="password"
              placeholder="Enter Password"
              style={{
                padding: "14px",
                borderRadius: "10px", // 🔥 smooth curve
              }}
              onChange={(e) =>
                props.setFormData({
                  ...props.formData,
                  [e.target.name]: e.target.value,
                })
              }
            />
          </div>
          {/* <div className=" text-center col-sm-10"> */}
          <button
            type="submit"
            className="btn btn-primary w-100 rounded-3 py-2 fs-6"
            style={{
              background: "#2D88D4",
              borderRadius: "none",
            }}
            // onClick={handleLogin}
            // disabled={!props.isEmailValid() || !props.isPasswordValid()}
          >
            Login
          </button>
          {/* </div> */}

          {props.error && ( // Updated: Conditionally render error message
            <div className="text-danger text-center mt-3 fs-6">
              {props.error}
            </div>
          )}

          <div className="text-center mt-3">
            {/* <p className="mb-0 m-4">Forgot Password</p> */}
            {/* <p> */}
            <a
              href="/forgot-password"
              className="text-decoration-none small text-primary"
            >
              Forgot Password?
            </a>
            {/* </p> */}
          </div>
        </div>
      </form>
    </div>
  );
}
