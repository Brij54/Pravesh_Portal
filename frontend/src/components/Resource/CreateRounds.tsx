// import React, { useState, useEffect, useRef } from 'react';
//     import apiConfig from '../../config/apiConfig';

// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import { fetchForeignResource } from '../../apis/resources';
// import { fetchEnum } from '../../apis/enum';
// import Cookies from "js-cookie";
// import { jwtDecode } from "jwt-decode";
// import { useParams } from 'react-router-dom';

// import { useRoundsViewModel } from "../../viewModels/useRoundsViewModel";
// import { getUserIdFromJWT } from '../../services/RoundsService';
// import { useRaspStore } from '../../store/raspStore';

// export type resourceMetaData = {
//   resource: string;
//   fieldValues: any[];
// };
// const getCookie = (name: string): string | null => {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
//     return null;
//   };

// const CreateRounds = () => {
// const [resMetaData, setResMetaData] = useState<resourceMetaData[]>([]);
//   const [showToast, setShowToast] = useState<any>(false);
//   const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
//   const regex = /^(g_|archived|extra_data)/;
//    const apiUrl = apiConfig.getResourceUrl("Rounds");
//   const metadataUrl = apiConfig.getResourceMetaDataUrl("Rounds")
  
//     const fetchedResources = useRef(new Set<string>());
// const fetchedEnum = useRef(new Set<string>());
// const queryClient = useQueryClient();

// const getUserIdFromJWT = (): any => {
//   try {
//     const token = Cookies.get("access_token"); // adjust cookie name if different
//     if (!token) return null;
    
//     const decoded: any = jwtDecode(token);
//     console.log("all the resource but selected decoded",decoded)
//     // assuming your token payload has "userId" or "sub" field
//     return decoded.userId || decoded.sub || null;
//   } catch {
//     return null;
//   }
// };

//  const { appId }:any = useParams<any>();

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
//   } = useRoundsViewModel(getUserIdFromJWT(), appId);

// useEffect(()=>{
//   loadMetadata();
// },[])

// // ✅ async function, not useQuery
// const fetchForeignData = async (
//   foreignResource: string,
//   fieldName: string,
//   foreignField: string
// ) => {
//   try {
//     const data = await fetchForeignResource(foreignResource);
//     setForeignKeyData((prev:any) => ({
//       ...prev,
//       [foreignResource]: data,
//     }));
//   } catch (err) {
//     console.error(`Error fetching foreign data for ${fieldName}:`, err);
//   }
// };

// // ✅ async function, not useQuery
// const fetchEnumData = async (enumName: string) => {
//   try {
//     const data = await fetchEnum(enumName);
//     setEnums((prev:any) => ({
//       ...prev,
//       [enumName]: data,
//     }));
//   } catch (err) {
//     console.error(`Error fetching enum data for ${enumName}:`, err);
//   }
// };

// // ✅ useQuery only here
// const { data: metaData, isLoading, error } = useQuery({
//   queryKey: ['resMetaData','roundsCreate'],
//   queryFn: async () => {
//     const res = await fetch(metadataUrl, {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' },
//     });

//     if (!res.ok) {
//       throw new Error(`Failed to fetch metadata: ${res.statusText}`);
//     }

//     const data = await res.json();

//     setResMetaData(data);
//     setFields(data[0].fieldValues);

//     const foreignFields = data[0].fieldValues.filter((field: any) => field.foreign);
//     for (const field of foreignFields) {
//       if (!fetchedResources.current.has(field.foreign)) {
//         fetchedResources.current.add(field.foreign);

//         queryClient.prefetchQuery({
//           queryKey: ['foreignData', field.foreign],
//           queryFn: () => fetchForeignResource(field.foreign),
//         });

//         await fetchForeignData(field.foreign, field.name, field.foreign_field);
//       }
//     }

//     const enumFields = data[0].fieldValues.filter((field: any) => field.isEnum === true);
//     for (const field of enumFields) {
//       if (!fetchedEnum.current.has(field.possible_value)) {
//         fetchedEnum.current.add(field.possible_value);

//         queryClient.prefetchQuery({
//           queryKey: ['enum', field.possible_value],
//           queryFn: () => fetchEnum(field.possible_value),
//         });

//         await fetchEnumData(field.possible_value);
//       }
//     }

//     return data;
//   },
// });


//   useEffect(()=>{
//     console.log("data to save",dataToSave)
//   },[dataToSave])
 
   
//   const {data:dataRes,isLoading:isLoadingDataRes,error:errorDataRes}= useQuery({
//     queryKey: ['resourceData', 'roundsCreate'],
//      queryFn: async () => {
//       const params = new URLSearchParams();
    
//       const queryId: any = "GET_ALL";
//       params.append("queryId", queryId);

// const accessToken = getCookie("access_token");

//   if (!accessToken) {
//     throw new Error("Access token not found");
//   }

//       const response = await fetch(
//         `${apiConfig.getResourceUrl('rounds')}?` + params.toString(),
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${accessToken}`, // Add token here
//           },
//           credentials: "include", // include cookies if needed
//         }
//       );

      
//       if (!response.ok) {
//         throw new Error("Error: " + response.status);
//       }

//       const data = await response.json();
//         return data.resource;
//     },
//   })
// useEffect(()=>{
// if(dataRes){
// let dataToStore ={resource: 'rounds', records: dataRes}
//         useRaspStore.getState().initializeStore(getUserIdFromJWT(), dataToStore);
   
// }
//   },[dataRes])
//   const handleCreate = async () => {
//     const accessToken:any = getCookie("access_token");
    
//     if (!accessToken) {
//       throw new Error("Access token not found");
//     }
   

//     await save(accessToken);
//       setShowToast(true);
//     setDataToSave({});
//   };

//   const handleSearchChange = (fieldName: string, value: string) => {
//     setSearchQueries((prev) => ({ ...prev, [fieldName]: value }));
//   };

//   return (
//   <div>
//   <div>
//     <div id="id-1V" className="d-flex flex-column border border-2 p-2 gap-2 mb-2"><div className="fw-bold fs-3" id="id-1X">Rounds</div><div id="id-1Z" className="border-0 w-100 bg-light"><div className="fw-bold" id="id-21">name *</div><input type="text" className="form-control" name="name" required={true} value={dataToSave["name"] || ""} id="id-25" placeholder="name" onChange={(e) => setDataToSave({ ...dataToSave, ["name"]: e.target.value }) } /></div><div id="id-25" className="border-0 w-100 bg-light"><div className="fw-bold" id="id-27">startdate *</div><input type="date" className="form-control" name="startdate" required={true} value={dataToSave["startdate"] || ""} id="id-29" placeholder="startdate" onChange={(e) => setDataToSave({ ...dataToSave, ["startdate"]: e.target.value }) } /></div><div id="id-2B" className="border-0 w-100 bg-light"><div className="fw-bold" id="id-2D">enddate *</div><input type="date" className="form-control" name="enddate" required={true} value={dataToSave["enddate"] || ""} id="id-2F" placeholder="enddate" onChange={(e) => setDataToSave({ ...dataToSave, ["enddate"]: e.target.value }) } /></div><div id="id-2H" className="border-0 w-100 bg-light"><div className="fw-bold" id="id-2J">details *</div><input type="text" className="form-control" name="details" required={true} value={dataToSave["details"] || ""} id="id-2N" placeholder="details" onChange={(e) => setDataToSave({ ...dataToSave, ["details"]: e.target.value }) } /></div><div id="id-2N" className="border-0 w-100 bg-light"><div className="fw-bold" id="id-2P">drive_id *</div><input type="text" className="form-control" name="drive_id" required={true} value={dataToSave["drive_id"] || ""} id="id-2T" placeholder="drive_id" onChange={(e) => setDataToSave({ ...dataToSave, ["drive_id"]: e.target.value }) } /></div><button className="btn btn-success" id="id-2T" onClick={handleCreate}>Submit</button></div>
   
//   </div>
//   {showToast && (
//     <div
//       className="toast-container position-fixed top-20 start-50 translate-middle p-3"
//       style={{ zIndex: 1550 }}
//     >
//       <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
//         <div className="toast-header">
//           <strong className="me-auto">Success</strong>
//           <button
//             type="button"
//             className="btn-close"
//             data-bs-dismiss="toast"
//             aria-label="Close"
//             onClick={() => setShowToast(false)}
//           ></button>
//         </div>
//         <div className="toast-body text-success text-center">Created successfully!</div>
//       </div>
//     </div>
// ) }

// </div>
// )


// };

// export default CreateRounds


import React, { useState, useEffect, useRef } from "react";
import apiConfig from "../../config/apiConfig";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchForeignResource } from "../../apis/resources";
import { fetchEnum } from "../../apis/enum";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";

import { useRoundsViewModel } from "../../viewModels/useRoundsViewModel";
import { useRaspStore } from "../../store/raspStore";

import styles from "../Styles/CreateCertificate.module.css";

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

const CreateRounds = () => {
  const [resMetaData, setResMetaData] = useState<resourceMetaData[]>([]);
  const [showToast, setShowToast] = useState(false);

  const fetchedResources = useRef(new Set<string>());
  const fetchedEnum = useRef(new Set<string>());
  const queryClient = useQueryClient();

  const { appId }: any = useParams<any>();

  const getUserIdFromJWT = (): any => {
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
  } = useRoundsViewModel(getUserIdFromJWT(), appId);

  useEffect(() => {
    loadMetadata();
  }, []);

  const fetchForeignData = async (
    foreignResource: string,
    fieldName: string,
    foreignField: string
  ) => {
    const data = await fetchForeignResource(foreignResource);
    setForeignKeyData((prev: any) => ({
      ...prev,
      [foreignResource]: data,
    }));
  };

  const fetchEnumData = async (enumName: string) => {
    const data = await fetchEnum(enumName);
    setEnums((prev: any) => ({
      ...prev,
      [enumName]: data,
    }));
  };

  useQuery({
    queryKey: ["resMetaData", "roundsCreate"],
    queryFn: async () => {
      const res = await fetch(
        apiConfig.getResourceMetaDataUrl("Rounds"),
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch metadata");
      }

      const data = await res.json();
      setResMetaData(data);
      setFields(data[0].fieldValues);

      for (const field of data[0].fieldValues.filter((f: any) => f.foreign)) {
        if (!fetchedResources.current.has(field.foreign)) {
          fetchedResources.current.add(field.foreign);
          await fetchForeignData(
            field.foreign,
            field.name,
            field.foreign_field
          );
        }
      }

      for (const field of data[0].fieldValues.filter((f: any) => f.isEnum)) {
        if (!fetchedEnum.current.has(field.possible_value)) {
          fetchedEnum.current.add(field.possible_value);
          await fetchEnumData(field.possible_value);
        }
      }

      return data;
    },
  });

  const { data: dataRes } = useQuery({
    queryKey: ["resourceData", "roundsCreate"],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("queryId", "GET_ALL");

      const accessToken = getCookie("access_token");
      if (!accessToken) throw new Error("Access token not found");

      const response = await fetch(
        `${apiConfig.getResourceUrl("rounds")}?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();
      return data.resource;
    },
  });

  useEffect(() => {
    if (dataRes) {
      useRaspStore
        .getState()
        .initializeStore(getUserIdFromJWT(), {
          resource: "rounds",
          records: dataRes,
        });
    }
  }, [dataRes]);

  const handleCreate = async () => {
    const accessToken = getCookie("access_token");
    if (!accessToken) throw new Error("Access token not found");

    await save(accessToken);
    setShowToast(true);
    setDataToSave({});
  };

  return (
    <div className={styles.batchformCard}>
      <div className={styles.certificateFormWrapper}>
        <h2 className={styles.sectionTitle}>Create Rounds</h2>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span className={styles.required}>*</span> Name
            </label>
            <input
              type="text"
              className={styles.formControl}
              value={dataToSave.name || ""}
              onChange={(e) =>
                setDataToSave({ ...dataToSave, name: e.target.value })
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span className={styles.required}>*</span> Drive ID
            </label>
            <input
              type="text"
              className={styles.formControl}
              value={dataToSave.drive_id || ""}
              onChange={(e) =>
                setDataToSave({ ...dataToSave, drive_id: e.target.value })
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
              value={dataToSave.startdate || ""}
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
              value={dataToSave.enddate || ""}
              onChange={(e) =>
                setDataToSave({ ...dataToSave, enddate: e.target.value })
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Details</label>
            <input
              type="text"
              className={styles.formControl}
              value={dataToSave.details || ""}
              onChange={(e) =>
                setDataToSave({ ...dataToSave, details: e.target.value })
              }
            />
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button className={styles.primaryBtn} onClick={handleCreate}>
            Submit
          </button>
        </div>

        {showToast && (
          <div
            className="toast-container position-fixed top-20 start-50 translate-middle p-3"
            style={{ zIndex: 1550 }}
          >
            <div className="toast show">
              <div className="toast-header">
                <strong className="me-auto">Success</strong>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowToast(false)}
                ></button>
              </div>
              <div className="toast-body text-success text-center">
                Created successfully!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRounds;
