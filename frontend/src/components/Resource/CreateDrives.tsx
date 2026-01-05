// import React, { useState, useEffect, useRef } from "react";
// import apiConfig from "../../config/apiConfig";

// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { fetchForeignResource } from "../../apis/resources";
// import { fetchEnum } from "../../apis/enum";
// import Cookies from "js-cookie";
// import { jwtDecode } from "jwt-decode";
// import { useParams } from "react-router-dom";

// import { useDriveViewModel } from "../../viewModels/useDriveViewModel";
// import { getUserIdFromJWT } from "../../services/DriveService";
// import { useRaspStore } from "../../store/raspStore";

// export type resourceMetaData = {
//   resource: string;
//   fieldValues: any[];
// };
// const getCookie = (name: string): string | null => {
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
//   return null;
// };

// const CreateDrive = () => {
//   const [resMetaData, setResMetaData] = useState<resourceMetaData[]>([]);
//   const [showToast, setShowToast] = useState<any>(false);
//   const [searchQueries, setSearchQueries] = useState<Record<string, string>>(
//     {}
//   );
//   const regex = /^(g_|archived|extra_data)/;
//   const apiUrl = apiConfig.getResourceUrl("Drive");
//   const metadataUrl = apiConfig.getResourceMetaDataUrl("Drive");

//   const fetchedResources = useRef(new Set<string>());
//   const fetchedEnum = useRef(new Set<string>());
//   const queryClient = useQueryClient();

//   const getUserIdFromJWT = (): any => {
//     try {
//       const token = Cookies.get("access_token"); // adjust cookie name if different
//       if (!token) return null;

//       const decoded: any = jwtDecode(token);
//       console.log("all the resource but selected decoded", decoded);
//       // assuming your token payload has "userId" or "sub" field
//       return decoded.userId || decoded.sub || null;
//     } catch {
//       return null;
//     }
//   };

//   const { appId }: any = useParams<any>();

//   const {
//     fields,
//     setFields,
//     enums,
//     setEnums,
//     foreignKeyData,
//     setForeignKeyData,
//     dataToSave,
//     setDataToSave,
//     loadMetadata,
//     save,
//   } = useDriveViewModel(getUserIdFromJWT(), appId);

//   useEffect(() => {
//     loadMetadata();
//   }, []);

//   // ✅ async function, not useQuery
//   const fetchForeignData = async (
//     foreignResource: string,
//     fieldName: string,
//     foreignField: string
//   ) => {
//     try {
//       const data = await fetchForeignResource(foreignResource);
//       setForeignKeyData((prev: any) => ({
//         ...prev,
//         [foreignResource]: data,
//       }));
//     } catch (err) {
//       console.error(`Error fetching foreign data for ${fieldName}:`, err);
//     }
//   };

//   // ✅ async function, not useQuery
//   const fetchEnumData = async (enumName: string) => {
//     try {
//       const data = await fetchEnum(enumName);
//       setEnums((prev: any) => ({
//         ...prev,
//         [enumName]: data,
//       }));
//     } catch (err) {
//       console.error(`Error fetching enum data for ${enumName}:`, err);
//     }
//   };

//   // ✅ useQuery only here
//   const {
//     data: metaData,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["resMetaData", "driveCreate"],
//     queryFn: async () => {
//       const res = await fetch(metadataUrl, {
//         method: "GET",
//         headers: { "Content-Type": "application/json" },
//       });

//       if (!res.ok) {
//         throw new Error(`Failed to fetch metadata: ${res.statusText}`);
//       }

//       const data = await res.json();

//       setResMetaData(data);
//       setFields(data[0].fieldValues);

//       const foreignFields = data[0].fieldValues.filter(
//         (field: any) => field.foreign
//       );
//       for (const field of foreignFields) {
//         if (!fetchedResources.current.has(field.foreign)) {
//           fetchedResources.current.add(field.foreign);

//           queryClient.prefetchQuery({
//             queryKey: ["foreignData", field.foreign],
//             queryFn: () => fetchForeignResource(field.foreign),
//           });

//           await fetchForeignData(
//             field.foreign,
//             field.name,
//             field.foreign_field
//           );
//         }
//       }

//       const enumFields = data[0].fieldValues.filter(
//         (field: any) => field.isEnum === true
//       );
//       for (const field of enumFields) {
//         if (!fetchedEnum.current.has(field.possible_value)) {
//           fetchedEnum.current.add(field.possible_value);

//           queryClient.prefetchQuery({
//             queryKey: ["enum", field.possible_value],
//             queryFn: () => fetchEnum(field.possible_value),
//           });

//           await fetchEnumData(field.possible_value);
//         }
//       }

//       return data;
//     },
//   });

//   useEffect(() => {
//     console.log("data to save", dataToSave);
//   }, [dataToSave]);

//   const {
//     data: dataRes,
//     isLoading: isLoadingDataRes,
//     error: errorDataRes,
//   } = useQuery({
//     queryKey: ["resourceData", "driveCreate"],
//     queryFn: async () => {
//       const params = new URLSearchParams();

//       const queryId: any = "GET_ALL";
//       params.append("queryId", queryId);

//       const accessToken = getCookie("access_token");

//       if (!accessToken) {
//         throw new Error("Access token not found");
//       }

//       const response = await fetch(
//         `${apiConfig.getResourceUrl("drive")}?` + params.toString(),
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${accessToken}`, // Add token here
//           },
//           credentials: "include", // include cookies if needed
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Error: " + response.status);
//       }

//       const data = await response.json();
//       return data.resource;
//     },
//   });
//   useEffect(() => {
//     if (dataRes) {
//       let dataToStore = { resource: "drive", records: dataRes };
//       useRaspStore.getState().initializeStore(getUserIdFromJWT(), dataToStore);
//     }
//   }, [dataRes]);
//   const handleCreate = async () => {
//     const accessToken: any = getCookie("access_token");

//     if (!accessToken) {
//       throw new Error("Access token not found");
//     }

//     await save(accessToken);
//     setShowToast(true);
//     setDataToSave({});
//   };

//   const handleSearchChange = (fieldName: string, value: string) => {
//     setSearchQueries((prev) => ({ ...prev, [fieldName]: value }));
//   };

//   return (
//     <div>
//       <div>
//         <div
//           id="id-7"
//           className="d-flex flex-column border border-2 p-2 gap-2 mb-2"
//         >
//           <div className="fw-bold fs-3" id="id-9">
//             Drive
//           </div>
//           <div id="id-B" className="border-0 w-100 bg-light">
//             <div className="fw-bold" id="id-D">
//               name *
//             </div>
//             <input
//               type="text"
//               className="form-control"
//               name="name"
//               required={true}
//               value={dataToSave["name"] || ""}
//               id="id-F"
//               placeholder="name"
//               onChange={(e) =>
//                 setDataToSave({ ...dataToSave, ["name"]: e.target.value })
//               }
//             />
//           </div>
//           <div id="id-H" className="border-0 w-100 bg-light">
//             <div className="fw-bold" id="id-J">
//               startdate *
//             </div>
//             <input
//               type="date"
//               className="form-control"
//               name="startdate"
//               required={true}
//               value={dataToSave["startdate"] || ""}
//               id="id-L"
//               placeholder="startdate"
//               onChange={(e) =>
//                 setDataToSave({ ...dataToSave, ["startdate"]: e.target.value })
//               }
//             />
//           </div>
//           <div id="id-N" className="border-0 w-100 bg-light">
//             <div className="fw-bold" id="id-P">
//               enddate *
//             </div>
//             <input
//               type="date"
//               className="form-control"
//               name="enddate"
//               required={true}
//               value={dataToSave["enddate"] || ""}
//               id="id-R"
//               placeholder="enddate"
//               onChange={(e) =>
//                 setDataToSave({ ...dataToSave, ["enddate"]: e.target.value })
//               }
//             />
//           </div>
//           <div id="id-T" className="border-0 w-100 bg-light">
//             <div className="fw-bold" id="id-V">
//               details
//             </div>
//             <input
//               type="text"
//               className="form-control"
//               name="details"
//               required={false}
//               value={dataToSave["details"] || ""}
//               id="id-X"
//               placeholder="details"
//               onChange={(e) =>
//                 setDataToSave({ ...dataToSave, ["details"]: e.target.value })
//               }
//             />
//           </div>
//           <button className="btn btn-success" id="id-Z" onClick={handleCreate}>
//             Submit
//           </button>
//         </div>
//       </div>
//       {showToast && (
//         <div
//           className="toast-container position-fixed top-20 start-50 translate-middle p-3"
//           style={{ zIndex: 1550 }}
//         >
//           <div
//             className="toast show"
//             role="alert"
//             aria-live="assertive"
//             aria-atomic="true"
//           >
//             <div className="toast-header">
//               <strong className="me-auto">Success</strong>
//               <button
//                 type="button"
//                 className="btn-close"
//                 data-bs-dismiss="toast"
//                 aria-label="Close"
//                 onClick={() => setShowToast(false)}
//               ></button>
//             </div>
//             <div className="toast-body text-success text-center">
//               Created successfully!
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CreateDrive;
// import React, { useState, useEffect, useRef, useMemo } from "react";
// import apiConfig from "../../config/apiConfig";

// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { fetchForeignResource } from "../../apis/resources";
// import { fetchEnum } from "../../apis/enum";
// import Cookies from "js-cookie";
// import { jwtDecode } from "jwt-decode";
// import { useParams } from "react-router-dom";

// import { useDriveViewModel } from "../../viewModels/useDriveViewModel";
// import { useRaspStore } from "../../store/raspStore";

// export type resourceMetaData = {
//   resource: string;
//   fieldValues: any[];
// };

// const getCookie = (name: string): string | null => {
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
//   return null;
// };

// // ---------- Date helpers (YYYY-MM-DD) ----------
// const toDate = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T00:00:00`);
// const addDays = (yyyyMmDd: string, days: number) => {
//   const d = toDate(yyyyMmDd);
//   d.setDate(d.getDate() + days);
//   return d.toISOString().slice(0, 10);
// };
// const isStrictBefore = (start?: string, end?: string) => {
//   if (!start || !end) return true; // don't show error until both filled
//   return toDate(start).getTime() < toDate(end).getTime();
// };

// const CreateDrive = () => {
//   const [resMetaData, setResMetaData] = useState<resourceMetaData[]>([]);
//   const [showToast, setShowToast] = useState(false);

//   // NEW: error toast/message
//   const [showErrorToast, setShowErrorToast] = useState(false);
//   const [errorMsg, setErrorMsg] = useState<string>("");

//   const [searchQueries, setSearchQueries] = useState<Record<string, string>>(
//     {}
//   );

//   const regex = /^(g_|archived|extra_data)/;
//   const apiUrl = apiConfig.getResourceUrl("Drive");
//   const metadataUrl = apiConfig.getResourceMetaDataUrl("Drive");

//   const fetchedResources = useRef(new Set<string>());
//   const fetchedEnum = useRef(new Set<string>());
//   const queryClient = useQueryClient();

//   const getUserIdFromJWTLocal = (): any => {
//     try {
//       const token = Cookies.get("access_token");
//       if (!token) return null;
//       const decoded: any = jwtDecode(token);
//       return decoded.userId || decoded.sub || null;
//     } catch {
//       return null;
//     }
//   };

//   const { appId }: any = useParams<any>();

//   const {
//     fields,
//     setFields,
//     enums,
//     setEnums,
//     foreignKeyData,
//     setForeignKeyData,
//     dataToSave,
//     setDataToSave,
//     loadMetadata,
//     save,
//   } = useDriveViewModel(getUserIdFromJWTLocal(), appId);

//   useEffect(() => {
//     loadMetadata();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const fetchForeignData = async (
//     foreignResource: string,
//     fieldName: string,
//     foreignField: string
//   ) => {
//     try {
//       const data = await fetchForeignResource(foreignResource);
//       setForeignKeyData((prev: any) => ({
//         ...prev,
//         [foreignResource]: data,
//       }));
//     } catch (err) {
//       console.error(`Error fetching foreign data for ${fieldName}:`, err);
//     }
//   };

//   const fetchEnumData = async (enumName: string) => {
//     try {
//       const data = await fetchEnum(enumName);
//       setEnums((prev: any) => ({
//         ...prev,
//         [enumName]: data,
//       }));
//     } catch (err) {
//       console.error(`Error fetching enum data for ${enumName}:`, err);
//     }
//   };

//   const { data: metaData, isLoading, error } = useQuery({
//     queryKey: ["resMetaData", "driveCreate"],
//     queryFn: async () => {
//       const res = await fetch(metadataUrl, {
//         method: "GET",
//         headers: { "Content-Type": "application/json" },
//       });

//       if (!res.ok) {
//         throw new Error(`Failed to fetch metadata: ${res.statusText}`);
//       }

//       const data = await res.json();

//       setResMetaData(data);
//       setFields(data[0].fieldValues);

//       const foreignFields = data[0].fieldValues.filter(
//         (field: any) => field.foreign
//       );

//       for (const field of foreignFields) {
//         if (!fetchedResources.current.has(field.foreign)) {
//           fetchedResources.current.add(field.foreign);

//           queryClient.prefetchQuery({
//             queryKey: ["foreignData", field.foreign],
//             queryFn: () => fetchForeignResource(field.foreign),
//           });

//           await fetchForeignData(
//             field.foreign,
//             field.name,
//             field.foreign_field
//           );
//         }
//       }

//       const enumFields = data[0].fieldValues.filter(
//         (field: any) => field.isEnum === true
//       );

//       for (const field of enumFields) {
//         if (!fetchedEnum.current.has(field.possible_value)) {
//           fetchedEnum.current.add(field.possible_value);

//           queryClient.prefetchQuery({
//             queryKey: ["enum", field.possible_value],
//             queryFn: () => fetchEnum(field.possible_value),
//           });

//           await fetchEnumData(field.possible_value);
//         }
//       }

//       return data;
//     },
//   });

//   useEffect(() => {
//     console.log("data to save", dataToSave);
//   }, [dataToSave]);

//   const {
//     data: dataRes,
//     isLoading: isLoadingDataRes,
//     error: errorDataRes,
//   } = useQuery({
//     queryKey: ["resourceData", "driveCreate"],
//     queryFn: async () => {
//       const params = new URLSearchParams();
//       params.append("queryId", "GET_ALL");

//       const accessToken = getCookie("access_token");
//       if (!accessToken) throw new Error("Access token not found");

//       const response = await fetch(
//         `${apiConfig.getResourceUrl("drive")}?` + params.toString(),
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${accessToken}`,
//           },
//           credentials: "include",
//         }
//       );

//       if (!response.ok) throw new Error("Error: " + response.status);

//       const data = await response.json();
//       return data.resource;
//     },
//   });

//   useEffect(() => {
//     if (dataRes) {
//       useRaspStore.getState().initializeStore(getUserIdFromJWTLocal(), {
//         resource: "drive",
//         records: dataRes,
//       });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [dataRes]);

//   // ----------------- NEW: date validation + constraints -----------------
//   const startVal = (dataToSave["startdate"] || "") as string;
//   const endVal = (dataToSave["enddate"] || "") as string;

//   const dateValid = isStrictBefore(startVal, endVal);

//   // Strict constraints:
//   // - end date must be >= start+1
//   // - start date must be <= end-1
//   const endMin = useMemo(() => {
//     if (!startVal) return undefined;
//     return addDays(startVal, 1);
//   }, [startVal]);

//   const startMax = useMemo(() => {
//     if (!endVal) return undefined;
//     return addDays(endVal, -1);
//   }, [endVal]);

//   const showError = (msg: string) => {
//     setErrorMsg(msg);
//     setShowErrorToast(true);
//   };

//   const handleCreate = async () => {
//     const accessToken: any = getCookie("access_token");
//     if (!accessToken) {
//       showError("Access token not found");
//       return;
//     }

//     // ✅ Hard validation before save
//     if (!startVal || !endVal) {
//       showError("Start date and End date are required.");
//       return;
//     }
//     if (!isStrictBefore(startVal, endVal)) {
//       showError("Start date must be before End date.");
//       return;
//     }

//     await save(accessToken);
//     setShowToast(true);
//     setDataToSave({});
//   };

//   const handleSearchChange = (fieldName: string, value: string) => {
//     setSearchQueries((prev) => ({ ...prev, [fieldName]: value }));
//   };

//   const canSubmit =
//     (dataToSave["name"] || "").trim().length > 0 &&
//     !!startVal &&
//     !!endVal &&
//     dateValid;

//   return (
//     <div>
//       <div>
//         <div
//           id="id-7"
//           className="d-flex flex-column border border-2 p-2 gap-2 mb-2"
//         >
//           <div className="fw-bold fs-3" id="id-9">
//             Drive
//           </div>

//           <div id="id-B" className="border-0 w-100 bg-light">
//             <div className="fw-bold" id="id-D">
//               name *
//             </div>
//             <input
//               type="text"
//               className="form-control"
//               name="name"
//               required={true}
//               value={dataToSave["name"] || ""}
//               id="id-F"
//               placeholder="name"
//               onChange={(e) =>
//                 setDataToSave({ ...dataToSave, ["name"]: e.target.value })
//               }
//             />
//           </div>

//           <div id="id-H" className="border-0 w-100 bg-light">
//             <div className="fw-bold" id="id-J">
//               startdate *
//             </div>
//             <input
//               type="date"
//               className="form-control"
//               name="startdate"
//               required={true}
//               value={startVal}
//               id="id-L"
//               placeholder="startdate"
//               max={startMax} // ✅ start <= end-1 (strict)
//               onChange={(e) => {
//                 const newStart = e.target.value;
//                 const currentEnd = (dataToSave["enddate"] || "") as string;

//                 const next = { ...dataToSave, startdate: newStart };

//                 // If end exists and becomes invalid, clear end + notify
//                 if (currentEnd && !isStrictBefore(newStart, currentEnd)) {
//                   next.enddate = "";
//                   showError("Please select an End date after the Start date.");
//                 }

//                 setDataToSave(next);
//               }}
//             />

//             {/* inline error */}
//             {startVal && endVal && !dateValid && (
//               <div className="text-danger small mt-1">
//                 Start date must be before End date.
//               </div>
//             )}
//           </div>

//           <div id="id-N" className="border-0 w-100 bg-light">
//             <div className="fw-bold" id="id-P">
//               enddate *
//             </div>
//             <input
//               type="date"
//               className="form-control"
//               name="enddate"
//               required={true}
//               value={endVal}
//               id="id-R"
//               placeholder="enddate"
//               min={endMin} // ✅ end >= start+1 (strict)
//               onChange={(e) => {
//                 const newEnd = e.target.value;
//                 const currentStart = (dataToSave["startdate"] || "") as string;

//                 if (currentStart && !isStrictBefore(currentStart, newEnd)) {
//                   setDataToSave({ ...dataToSave, enddate: "" });
//                   showError("End date must be after Start date.");
//                   return;
//                 }

//                 setDataToSave({ ...dataToSave, ["enddate"]: newEnd });
//               }}
//             />
//           </div>

//           <div id="id-T" className="border-0 w-100 bg-light">
//             <div className="fw-bold" id="id-V">
//               details
//             </div>
//             <input
//               type="text"
//               className="form-control"
//               name="details"
//               required={false}
//               value={dataToSave["details"] || ""}
//               id="id-X"
//               placeholder="details"
//               onChange={(e) =>
//                 setDataToSave({ ...dataToSave, ["details"]: e.target.value })
//               }
//             />
//           </div>

//           <button
//             className="btn btn-success"
//             id="id-Z"
//             onClick={handleCreate}
//             disabled={!canSubmit} // ✅ cannot submit with invalid dates
//             title={!canSubmit ? "Fill required fields with valid dates." : ""}
//           >
//             Submit
//           </button>
//         </div>
//       </div>

//       {/* Success Toast */}
//       {showToast && (
//         <div
//           className="toast-container position-fixed top-20 start-50 translate-middle p-3"
//           style={{ zIndex: 1550 }}
//         >
//           <div
//             className="toast show"
//             role="alert"
//             aria-live="assertive"
//             aria-atomic="true"
//           >
//             <div className="toast-header">
//               <strong className="me-auto">Success</strong>
//               <button
//                 type="button"
//                 className="btn-close"
//                 data-bs-dismiss="toast"
//                 aria-label="Close"
//                 onClick={() => setShowToast(false)}
//               ></button>
//             </div>
//             <div className="toast-body text-success text-center">
//               Created successfully!
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Error Toast */}
//       {showErrorToast && (
//         <div
//           className="toast-container position-fixed top-20 start-50 translate-middle p-3"
//           style={{ zIndex: 1550 }}
//         >
//           <div
//             className="toast show"
//             role="alert"
//             aria-live="assertive"
//             aria-atomic="true"
//           >
//             <div className="toast-header">
//               <strong className="me-auto text-danger">Error</strong>
//               <button
//                 type="button"
//                 className="btn-close"
//                 aria-label="Close"
//                 onClick={() => setShowErrorToast(false)}
//               ></button>
//             </div>
//             <div className="toast-body text-danger text-center">{errorMsg}</div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CreateDrive;


import React, { useState, useEffect, useRef, useMemo } from "react";
import apiConfig from "../../config/apiConfig";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchForeignResource } from "../../apis/resources";
import { fetchEnum } from "../../apis/enum";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";

import { useDriveViewModel } from "../../viewModels/useDriveViewModel";
import { useRaspStore } from "../../store/raspStore";

import styles from "../Styles/CreateCertificate.module.css"; // ✅ UI FROM YOUR CODE

// ---------- Date helpers ----------
const toDate = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T00:00:00`);
const addDays = (yyyyMmDd: string, days: number) => {
  const d = toDate(yyyyMmDd);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const isStrictBefore = (start?: string, end?: string) => {
  if (!start || !end) return true;
  return toDate(start).getTime() < toDate(end).getTime();
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const CreateDrive = () => {
  const [showToast, setShowToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchedResources = useRef(new Set<string>());
  const fetchedEnum = useRef(new Set<string>());
  const queryClient = useQueryClient();

  const { appId }: any = useParams<any>();

  const getUserIdFromJWT = () => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return null;
      const decoded: any = jwtDecode(token);
      return decoded.userId || decoded.sub || null;
    } catch {
      return null;
    }
  };

  const {
    fields,
    setFields,
    enums,
    setEnums,
    foreignKeyData,
    setForeignKeyData,
    dataToSave,
    setDataToSave,
    loadMetadata,
    save,
  } = useDriveViewModel(getUserIdFromJWT(), appId);

  useEffect(() => {
    loadMetadata();
  }, []);

  // ---------- Metadata ----------
  useQuery({
    queryKey: ["resMetaData", "driveCreate"],
    queryFn: async () => {
      const res = await fetch(apiConfig.getResourceMetaDataUrl("Drive"));
      const data = await res.json();
      setFields(data[0].fieldValues);

      for (const field of data[0].fieldValues.filter((f: any) => f.foreign)) {
        if (!fetchedResources.current.has(field.foreign)) {
          fetchedResources.current.add(field.foreign);
          const foreignData = await fetchForeignResource(field.foreign);
          setForeignKeyData((prev: any) => ({
            ...prev,
            [field.foreign]: foreignData,
          }));
        }
      }

      for (const field of data[0].fieldValues.filter((f: any) => f.isEnum)) {
        if (!fetchedEnum.current.has(field.possible_value)) {
          fetchedEnum.current.add(field.possible_value);
          const enumData = await fetchEnum(field.possible_value);
          setEnums((prev: any) => ({
            ...prev,
            [field.possible_value]: enumData,
          }));
        }
      }

      return data;
    },
  });

  // ---------- Date validation ----------
  const startVal = dataToSave["startdate"] || "";
  const endVal = dataToSave["enddate"] || "";

  const dateValid = isStrictBefore(startVal, endVal);

  const endMin = useMemo(
    () => (startVal ? addDays(startVal, 1) : undefined),
    [startVal]
  );
  const startMax = useMemo(
    () => (endVal ? addDays(endVal, -1) : undefined),
    [endVal]
  );

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setShowErrorToast(true);
  };

  const handleCreate = async () => {
    const accessToken = getCookie("access_token");
    if (!accessToken) return showError("Access token not found");

    if (!startVal || !endVal)
      return showError("Start date and End date are required");

    if (!dateValid)
      return showError("Start date must be before End date");

    await save(accessToken);
    setShowToast(true);
    setDataToSave({});
  };

  const canSubmit =
    (dataToSave["name"] || "").trim() &&
    startVal &&
    endVal &&
    dateValid;

  // ================= UI (FROM YOUR CODE) =================
  return (
    <div className={styles.batchformCard}>
      <div className={styles.certificateFormWrapper}>
        <h2 className={styles.sectionTitle}>Create Drive</h2>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span className={styles.required}>*</span> Name
            </label>
            <input
              className={styles.formControl}
              value={dataToSave["name"] || ""}
              onChange={(e) =>
                setDataToSave({ ...dataToSave, name: e.target.value })
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span className={styles.required}>*</span> Start Date
            </label>
            <input
              type="date"
              className={styles.formControl}
              value={startVal}
              max={startMax}
              onChange={(e) =>
                setDataToSave({ ...dataToSave, startdate: e.target.value })
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span className={styles.required}>*</span> End Date
            </label>
            <input
              type="date"
              className={styles.formControl}
              value={endVal}
              min={endMin}
              onChange={(e) =>
                setDataToSave({ ...dataToSave, enddate: e.target.value })
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Details</label>
            <input
              className={styles.formControl}
              value={dataToSave["details"] || ""}
              onChange={(e) =>
                setDataToSave({ ...dataToSave, details: e.target.value })
              }
            />
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button
            className={styles.primaryBtn}
            disabled={!canSubmit}
            onClick={handleCreate}
          >
            Submit
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="toast-container position-fixed top-20 start-50 translate-middle p-3">
          <div className="toast show">
            <div className="toast-header">
              <strong className="me-auto">Success</strong>
              <button
                className="btn-close"
                onClick={() => setShowToast(false)}
              />
            </div>
            <div className="toast-body text-success text-center">
              Created successfully!
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <div className="toast-container position-fixed top-20 start-50 translate-middle p-3">
          <div className="toast show">
            <div className="toast-header">
              <strong className="me-auto text-danger">Error</strong>
              <button
                className="btn-close"
                onClick={() => setShowErrorToast(false)}
              />
            </div>
            <div className="toast-body text-danger text-center">
              {errorMsg}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateDrive;
