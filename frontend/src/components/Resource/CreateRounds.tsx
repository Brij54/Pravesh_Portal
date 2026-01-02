// import React, { useEffect, useMemo, useRef, useState } from "react";
// import apiConfig from "../../config/apiConfig";

// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import Cookies from "js-cookie";
// import { jwtDecode } from "jwt-decode";
// import { useParams } from "react-router-dom";

// import { fetchForeignResource } from "../../apis/resources";
// import { fetchEnum } from "../../apis/enum";

// import { useRoundsViewModel } from "../../viewModels/useRoundsViewModel";
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

// // ✅ prevents "Unexpected end of JSON input"
// async function safeReadJson(res: Response) {
//   const text = await res.text();
//   if (!text) return null;
//   try {
//     return JSON.parse(text);
//   } catch {
//     return null;
//   }
// }

// function getAccessToken(): string | null {
//   // Prefer document.cookie helper (works with your existing code)
//   const t1 = getCookie("access_token");
//   if (t1) return t1;

//   // fallback (only works if cookie is NOT HttpOnly)
//   const t2 = Cookies.get("access_token");
//   return t2 || null;
// }

// const CreateRounds = () => {
//   const [resMetaData, setResMetaData] = useState<resourceMetaData[]>([]);
//   const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

//   const fetchedResources = useRef(new Set<string>());
//   const fetchedEnum = useRef(new Set<string>());
//   const queryClient = useQueryClient();

//   const getUserIdFromJWT = (): any => {
//     try {
//       const token = Cookies.get("access_token") || getCookie("access_token");
//       if (!token) return null;
//       const decoded: any = jwtDecode(token);
//       return decoded.userId || decoded.sub || null;
//     } catch {
//       return null;
//     }
//   };

//   const { appId }: any = useParams<any>();

//   const {
//     setFields,
//     setEnums,
//     foreignKeyData,
//     setForeignKeyData,
//     dataToSave,
//     setDataToSave,
//     loadMetadata,
//     save,
//   } = useRoundsViewModel(getUserIdFromJWT(), appId);

//   useEffect(() => {
//     loadMetadata();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // --------- (optional) keep your existing metadata + foreign fetch ---------
//   const metadataUrl = apiConfig.getResourceMetaDataUrl("Rounds");

//   const fetchForeignData = async (foreignResource: string) => {
//     try {
//       const data = await fetchForeignResource(foreignResource);
//       setForeignKeyData((prev: any) => ({ ...prev, [foreignResource]: data }));
//     } catch (err) {
//       console.error(`Error fetching foreign data for ${foreignResource}:`, err);
//     }
//   };

//   const fetchEnumData = async (enumName: string) => {
//     try {
//       const data = await fetchEnum(enumName);
//       setEnums((prev: any) => ({ ...prev, [enumName]: data }));
//     } catch (err) {
//       console.error(`Error fetching enum data for ${enumName}:`, err);
//     }
//   };

//   useQuery({
//     queryKey: ["resMetaData", "roundsCreate"],
//     queryFn: async () => {
//       const res = await fetch(metadataUrl, {
//         method: "GET",
//         headers: { "Content-Type": "application/json" },
//       });

//       if (!res.ok) throw new Error(`Failed to fetch metadata: ${res.statusText}`);

//       const data = await res.json();
//       setResMetaData(data);
//       setFields(data?.[0]?.fieldValues || []);

//       const foreignFields = (data?.[0]?.fieldValues || []).filter((f: any) => f.foreign);
//       for (const field of foreignFields) {
//         const foreignResName = field.foreign;
//         if (!fetchedResources.current.has(foreignResName)) {
//           fetchedResources.current.add(foreignResName);

//           queryClient.prefetchQuery({
//             queryKey: ["foreignData", foreignResName],
//             queryFn: () => fetchForeignResource(foreignResName),
//           });

//           await fetchForeignData(foreignResName);
//         }
//       }

//       const enumFields = (data?.[0]?.fieldValues || []).filter((f: any) => f.isEnum === true);
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

//   // ✅ Fetch drives DIRECTLY from Drive resource (avoids 403 on rounds decorator query)
//   const {
//     data: driveOptions,
//     isLoading: drivesLoading,
//     error: drivesError,
//   } = useQuery({
//     queryKey: ["driveOptions", "roundsCreate"],
//     queryFn: async () => {
//       const token = getAccessToken();
//       if (!token) throw new Error("Access token not found");

//       const params = new URLSearchParams();
//       params.append("queryId", "GET_ALL");

//       // try common naming variants: "drive" then "Drive"
//       const urls = [
//         `${apiConfig.getResourceUrl("drive")}?${params.toString()}`,
//         `${apiConfig.getResourceUrl("Drive")}?${params.toString()}`,
//       ];

//       let lastErr: any = null;

//       for (const url of urls) {
//         try {
//           const res = await fetch(url, {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//             credentials: "include",
//           });

//           const body = await safeReadJson(res);

//           if (!res.ok) {
//             throw new Error(body?.message || body?.error || `Drive fetch failed: ${res.status}`);
//           }

//           // backend pattern: { resource: [...] }
//           const list = body?.resource || [];
//           return Array.isArray(list) ? list : [];
//         } catch (e) {
//           lastErr = e;
//         }
//       }

//       throw lastErr || new Error("Failed to load drives");
//     },
//   });

//   // Load rounds list into store (your existing pattern)
//   const { data: roundsData } = useQuery({
//     queryKey: ["resourceData", "roundsCreate"],
//     queryFn: async () => {
//       const token = getAccessToken();
//       if (!token) throw new Error("Access token not found");

//       const params = new URLSearchParams();
//       params.append("queryId", "GET_ALL");

//       const res = await fetch(`${apiConfig.getResourceUrl("rounds")}?${params.toString()}`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         credentials: "include",
//       });

//       const body = await safeReadJson(res);
//       if (!res.ok) throw new Error(body?.message || body?.error || `Rounds fetch failed: ${res.status}`);

//       return body?.resource || [];
//     },
//   });

//   useEffect(() => {
//     if (roundsData) {
//       useRaspStore.getState().initializeStore(getUserIdFromJWT(), {
//         resource: "rounds",
//         records: roundsData,
//       });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [roundsData]);

//   const drives = useMemo(() => {
//     const arr = Array.isArray(driveOptions) ? driveOptions : [];
//     // filter archived if present
//     return arr.filter((d: any) => d?.archived !== "Y");
//   }, [driveOptions]);

//   const handleCreate = async () => {
//     try {
//       const token = getAccessToken();
//       if (!token) throw new Error("Access token not found");

//       await save(token); // your view model should send Authorization in POST
//       setToast({ type: "success", msg: "Created successfully!" });
//       setDataToSave({});

//       queryClient.invalidateQueries({ queryKey: ["resourceData", "roundsCreate"] });
//     } catch (e: any) {
//       setToast({ type: "error", msg: e?.message || "Create failed" });
//     }
//   };

//   return (
//     <div>
//       <div className="d-flex flex-column border border-2 p-2 gap-2 mb-2">
//         <div className="fw-bold fs-3">Rounds</div>

//         <div className="border-0 w-100 bg-light">
//           <div className="fw-bold">name *</div>
//           <input
//             type="text"
//             className="form-control"
//             name="name"
//             required
//             value={dataToSave["name"] || ""}
//             placeholder="name"
//             onChange={(e) => setDataToSave({ ...dataToSave, name: e.target.value })}
//           />
//         </div>

//         <div className="border-0 w-100 bg-light">
//           <div className="fw-bold">startdate *</div>
//           <input
//             type="date"
//             className="form-control"
//             name="startdate"
//             required
//             value={dataToSave["startdate"] || ""}
//             onChange={(e) => setDataToSave({ ...dataToSave, startdate: e.target.value })}
//           />
//         </div>

//         <div className="border-0 w-100 bg-light">
//           <div className="fw-bold">enddate *</div>
//           <input
//             type="date"
//             className="form-control"
//             name="enddate"
//             required
//             value={dataToSave["enddate"] || ""}
//             onChange={(e) => setDataToSave({ ...dataToSave, enddate: e.target.value })}
//           />
//         </div>

//         <div className="border-0 w-100 bg-light">
//           <div className="fw-bold">details *</div>
//           <input
//             type="text"
//             className="form-control"
//             name="details"
//             required
//             value={dataToSave["details"] || ""}
//             placeholder="details"
//             onChange={(e) => setDataToSave({ ...dataToSave, details: e.target.value })}
//           />
//         </div>

//         {/* ✅ drive_id dropdown */}
//         <div className="border-0 w-100 bg-light">
//           <div className="fw-bold">drive_id *</div>

//           <select
//             className="form-control"
//             name="drive_id"
//             required
//             value={dataToSave["drive_id"] || ""}
//             onChange={(e) => setDataToSave({ ...dataToSave, drive_id: e.target.value })}
//           >
//             <option value="" disabled>
//               {drivesLoading ? "Loading drives..." : "Select a drive"}
//             </option>

//             {drives.map((d: any) => (
//               <option key={d.id} value={d.id}>
//                 {d.name ?? d.id}
//               </option>
//             ))}
//           </select>

//           {drivesError ? (
//             <div className="text-danger mt-1" style={{ fontSize: 13 }}>
//               {(drivesError as any)?.message || "Access Denied"}
//             </div>
//           ) : null}
//         </div>

//         <button className="btn btn-success" onClick={handleCreate}>
//           Submit
//         </button>
//       </div>

//       {/* Toast */}
//       {toast && (
//         <div
//           className="toast-container position-fixed top-20 start-50 translate-middle p-3"
//           style={{ zIndex: 1550 }}
//         >
//           <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
//             <div className="toast-header">
//               <strong className="me-auto">{toast.type === "success" ? "Success" : "Error"}</strong>
//               <button
//                 type="button"
//                 className="btn-close"
//                 aria-label="Close"
//                 onClick={() => setToast(null)}
//               ></button>
//             </div>
//             <div className={`toast-body text-center ${toast.type === "success" ? "text-success" : "text-danger"}`}>
//               {toast.msg}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CreateRounds;
import React, { useEffect, useMemo, useRef, useState } from "react";
import apiConfig from "../../config/apiConfig";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";

import { fetchForeignResource } from "../../apis/resources";
import { fetchEnum } from "../../apis/enum";

import { useRoundsViewModel } from "../../viewModels/useRoundsViewModel";
import { useRaspStore } from "../../store/raspStore";

export type resourceMetaData = {
  resource: string;
  fieldValues: any[];
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

// ✅ prevents "Unexpected end of JSON input"
async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function getAccessToken(): string | null {
  const t1 = getCookie("access_token");
  if (t1) return t1;

  const t2 = Cookies.get("access_token");
  return t2 || null;
}

/** ================= ONLY CONSTRAINT HELPERS (start < end) ================= */
function parseDateOnly(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

function addDaysIso(value: string, days: number): string {
  const d = new Date(`${value}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function validateStartBeforeEnd(start?: string, end?: string): string | null {
  const sd = parseDateOnly(start);
  const ed = parseDateOnly(end);
  if (!sd || !ed) return null; // let "required" handle empty
  if (sd.getTime() >= ed.getTime()) return "Start date must be before end date";
  return null;
}
/** ======================================================================== */

const CreateRounds = () => {
  const [resMetaData, setResMetaData] = useState<resourceMetaData[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ✅ only added for the constraint
  const [dateError, setDateError] = useState<string | null>(null);

  const fetchedResources = useRef(new Set<string>());
  const fetchedEnum = useRef(new Set<string>());
  const queryClient = useQueryClient();

  const getUserIdFromJWT = (): any => {
    try {
      const token = Cookies.get("access_token") || getCookie("access_token");
      if (!token) return null;
      const decoded: any = jwtDecode(token);
      return decoded.userId || decoded.sub || null;
    } catch {
      return null;
    }
  };

  const { appId }: any = useParams<any>();

  const {
    setFields,
    setEnums,
    foreignKeyData,
    setForeignKeyData,
    dataToSave,
    setDataToSave,
    loadMetadata,
    save,
  } = useRoundsViewModel(getUserIdFromJWT(), appId);

  useEffect(() => {
    loadMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metadataUrl = apiConfig.getResourceMetaDataUrl("Rounds");

  const fetchForeignData = async (foreignResource: string) => {
    try {
      const data = await fetchForeignResource(foreignResource);
      setForeignKeyData((prev: any) => ({ ...prev, [foreignResource]: data }));
    } catch (err) {
      console.error(`Error fetching foreign data for ${foreignResource}:`, err);
    }
  };

  const fetchEnumData = async (enumName: string) => {
    try {
      const data = await fetchEnum(enumName);
      setEnums((prev: any) => ({ ...prev, [enumName]: data }));
    } catch (err) {
      console.error(`Error fetching enum data for ${enumName}:`, err);
    }
  };

  useQuery({
    queryKey: ["resMetaData", "roundsCreate"],
    queryFn: async () => {
      const res = await fetch(metadataUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error(`Failed to fetch metadata: ${res.statusText}`);

      const data = await res.json();
      setResMetaData(data);
      setFields(data?.[0]?.fieldValues || []);

      const foreignFields = (data?.[0]?.fieldValues || []).filter((f: any) => f.foreign);
      for (const field of foreignFields) {
        const foreignResName = field.foreign;
        if (!fetchedResources.current.has(foreignResName)) {
          fetchedResources.current.add(foreignResName);

          queryClient.prefetchQuery({
            queryKey: ["foreignData", foreignResName],
            queryFn: () => fetchForeignResource(foreignResName),
          });

          await fetchForeignData(foreignResName);
        }
      }

      const enumFields = (data?.[0]?.fieldValues || []).filter((f: any) => f.isEnum === true);
      for (const field of enumFields) {
        if (!fetchedEnum.current.has(field.possible_value)) {
          fetchedEnum.current.add(field.possible_value);

          queryClient.prefetchQuery({
            queryKey: ["enum", field.possible_value],
            queryFn: () => fetchEnum(field.possible_value),
          });

          await fetchEnumData(field.possible_value);
        }
      }

      return data;
    },
  });

  const {
    data: driveOptions,
    isLoading: drivesLoading,
    error: drivesError,
  } = useQuery({
    queryKey: ["driveOptions", "roundsCreate"],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) throw new Error("Access token not found");

      const params = new URLSearchParams();
      params.append("queryId", "GET_ALL");

      const urls = [
        `${apiConfig.getResourceUrl("drive")}?${params.toString()}`,
        `${apiConfig.getResourceUrl("Drive")}?${params.toString()}`,
      ];

      let lastErr: any = null;

      for (const url of urls) {
        try {
          const res = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          });

          const body = await safeReadJson(res);

          if (!res.ok) {
            throw new Error(body?.message || body?.error || `Drive fetch failed: ${res.status}`);
          }

          const list = body?.resource || [];
          return Array.isArray(list) ? list : [];
        } catch (e) {
          lastErr = e;
        }
      }

      throw lastErr || new Error("Failed to load drives");
    },
  });

  const { data: roundsData } = useQuery({
    queryKey: ["resourceData", "roundsCreate"],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) throw new Error("Access token not found");

      const params = new URLSearchParams();
      params.append("queryId", "GET_ALL");

      const res = await fetch(`${apiConfig.getResourceUrl("rounds")}?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const body = await safeReadJson(res);
      if (!res.ok) throw new Error(body?.message || body?.error || `Rounds fetch failed: ${res.status}`);

      return body?.resource || [];
    },
  });

  useEffect(() => {
    if (roundsData) {
      useRaspStore.getState().initializeStore(getUserIdFromJWT(), {
        resource: "rounds",
        records: roundsData,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundsData]);

  const drives = useMemo(() => {
    const arr = Array.isArray(driveOptions) ? driveOptions : [];
    return arr.filter((d: any) => d?.archived !== "Y");
  }, [driveOptions]);

  /** ✅ live validation whenever dates change */
  useEffect(() => {
    setDateError(validateStartBeforeEnd(dataToSave?.startdate, dataToSave?.enddate));
  }, [dataToSave?.startdate, dataToSave?.enddate]);

  /** ✅ HTML constraints */
  const endMin = dataToSave?.startdate ? addDaysIso(dataToSave.startdate, 1) : undefined;
  const startMax = dataToSave?.enddate ? addDaysIso(dataToSave.enddate, -1) : undefined;

  const handleCreate = async () => {
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Access token not found");

      // ✅ block submit if invalid
      const err = validateStartBeforeEnd(dataToSave?.startdate, dataToSave?.enddate);
      if (err) {
        setDateError(err);
        setToast({ type: "error", msg: err });
        return;
      }

      await save(token);
      setToast({ type: "success", msg: "Created successfully!" });
      setDataToSave({});

      queryClient.invalidateQueries({ queryKey: ["resourceData", "roundsCreate"] });
    } catch (e: any) {
      setToast({ type: "error", msg: e?.message || "Create failed" });
    }
  };

  return (
    <div>
      <div className="d-flex flex-column border border-2 p-2 gap-2 mb-2">
        <div className="fw-bold fs-3">Rounds</div>

        <div className="border-0 w-100 bg-light">
          <div className="fw-bold">name *</div>
          <input
            type="text"
            className="form-control"
            name="name"
            required
            value={dataToSave["name"] || ""}
            placeholder="name"
            onChange={(e) => setDataToSave({ ...dataToSave, name: e.target.value })}
          />
        </div>

        <div className="border-0 w-100 bg-light">
          <div className="fw-bold">startdate *</div>
          <input
            type="date"
            className="form-control"
            name="startdate"
            required
            max={startMax}   // ✅ start must be before end
            value={dataToSave["startdate"] || ""}
            onChange={(e) => setDataToSave({ ...dataToSave, startdate: e.target.value })}
          />
        </div>

        <div className="border-0 w-100 bg-light">
          <div className="fw-bold">enddate *</div>
          <input
            type="date"
            className="form-control"
            name="enddate"
            required
            min={endMin}     // ✅ end must be after start
            value={dataToSave["enddate"] || ""}
            onChange={(e) => setDataToSave({ ...dataToSave, enddate: e.target.value })}
          />
          {dateError ? (
            <div className="text-danger mt-1" style={{ fontSize: 13 }}>
              {dateError}
            </div>
          ) : null}
        </div>

        <div className="border-0 w-100 bg-light">
          <div className="fw-bold">details *</div>
          <input
            type="text"
            className="form-control"
            name="details"
            required
            value={dataToSave["details"] || ""}
            placeholder="details"
            onChange={(e) => setDataToSave({ ...dataToSave, details: e.target.value })}
          />
        </div>

        <div className="border-0 w-100 bg-light">
          <div className="fw-bold">drive_id *</div>

          <select
            className="form-control"
            name="drive_id"
            required
            value={dataToSave["drive_id"] || ""}
            onChange={(e) => setDataToSave({ ...dataToSave, drive_id: e.target.value })}
          >
            <option value="" disabled>
              {drivesLoading ? "Loading drives..." : "Select a drive"}
            </option>

            {drives.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name ?? d.id}
              </option>
            ))}
          </select>

          {drivesError ? (
            <div className="text-danger mt-1" style={{ fontSize: 13 }}>
              {(drivesError as any)?.message || "Access Denied"}
            </div>
          ) : null}
        </div>

        <button className="btn btn-success" onClick={handleCreate} disabled={!!dateError}>
          Submit
        </button>
      </div>

      {toast && (
        <div
          className="toast-container position-fixed top-20 start-50 translate-middle p-3"
          style={{ zIndex: 1550 }}
        >
          <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
              <strong className="me-auto">{toast.type === "success" ? "Success" : "Error"}</strong>
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setToast(null)} />
            </div>
            <div className={`toast-body text-center ${toast.type === "success" ? "text-success" : "text-danger"}`}>
              {toast.msg}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRounds;
