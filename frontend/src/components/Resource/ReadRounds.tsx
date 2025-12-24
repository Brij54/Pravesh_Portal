import React, { useState } from 'react';
                  import { useEffect } from 'react';
                  import apiConfig from '../../config/apiConfig';
                   import {
              AllCommunityModule,
              ModuleRegistry,
              themeAlpine,
              themeBalham,
            } from "ag-grid-community";
import { useRaspStore } from '../../store/raspStore';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
            import { AgGridReact } from "ag-grid-react";
            import { useQuery } from '@tanstack/react-query';
         // ADDED: Import your generated model file dynamically
import RoundsModel from '../../models/RoundsModel';
            ModuleRegistry.registerModules([AllCommunityModule]);
                  export type ResourceMetaData = {
                    "resource": string,
                    "fieldValues":any[]
                  }

                  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };
  
                  const ReadRounds= () => {
    const [rowData, setRowData] = useState<any[]>([]);
    const [colDef1, setColDef1] = useState<any[]>([]);
    const [resMetaData, setResMetaData] = useState<ResourceMetaData[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [dataToSave, setDataToSave] = useState<any>({});
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [fetchData, setFetchedData] = useState<any[]>([]);
   const [showToast,setShowToast] = useState<any>(false);

  const regex = /^(g_|archived|extra_data)/;
  const apiUrl = `${apiConfig.getResourceUrl('rounds')}?`
  const metadataUrl = `${apiConfig.getResourceMetaDataUrl('Rounds')}?`
  const BaseUrl = '${apiConfig.API_BASE_URL}';
   const getUserAllData = useRaspStore((s) => s.getUserAllData);
  const getUserIdFromJWT = (): any => {
  try {
    const token = Cookies.get("access_token"); // adjust cookie name if different
    if (!token) return null;
    
    const decoded: any = jwtDecode(token);
    console.log("all the resource but selected decoded",decoded)
    // assuming your token payload has "userId" or "sub" field
    return decoded.userId || decoded.sub || null;
  } catch {
    return null;
  }
};
  // Fetch resource data
  
  const {data:dataRes,isLoading:isLoadingDataRes,error:errorDataRes}= useQuery({
    queryKey: ['resourceData', 'roundsRead'],
     queryFn: async () => {
      const params = new URLSearchParams();
    
      const queryId: any = "GET_ALL";
      params.append("queryId", queryId);

const accessToken = getCookie("access_token");

  if (!accessToken) {
    throw new Error("Access token not found");
  }

      const response = await fetch(
        `${apiConfig.getResourceUrl('rounds')}?` + params.toString(),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`, // Add token here
          },
          credentials: "include", // include cookies if needed
        }
      );

      if (!response.ok) {
        throw new Error("Error: " + response.status);
      }

      const data = await response.json();
      
       return data.resource;
    },
  })

  
    // --- Transform API data into model objects and then JSON ---
  useEffect(() => {
    if (dataRes) {

       let dataToStore ={resource: 'rounds', records:dataRes}
        useRaspStore.getState().initializeStore(getUserIdFromJWT(), dataToStore);
      //ADDED: Convert array of plain objects → array of model instances
      const modelObjects = dataRes.map((obj: any) => RoundsModel.fromJson(obj));

      // ADDED: Convert array of model instances → array of JSON objects (for ag-grid)
      const jsonObjects = modelObjects.map((model: any) => model.toJson());

      // ADDED: Set final array for AgGrid
      setRowData(jsonObjects);
    }
    console.log("data initialized in store",getUserAllData(getUserIdFromJWT()))
  }, [dataRes]);

  const {data: dataResMeta,isLoading:isLoadingDataResMeta,error:errorDataResMeta} = useQuery({
    queryKey: ['resourceMetaData', 'roundsRead'],
   queryFn: async () => {
      const response = await fetch(
        `${apiConfig.getResourceMetaDataUrl('rounds')}?`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Error: " + response.status);
      }

      const data = await response.json();
      setResMetaData(data);
      setFields(data[0]?.fieldValues || []);
      const required = data[0]?.fieldValues
        .filter((field: any) => !regex.test(field.name))
        .map((field: any) => field.name);
      setRequiredFields(required || []);
      return data;
    },
  });


  

  useEffect(() => {
    
    
    const fields = requiredFields.filter((field:any) => field !== 'id') || [];
    
    const columns = fields.map((field:any) => ({
      field: field,
      headerName: field,
      editable: false,
      resizable: true,
      sortable: true,
      filter: true
    }));
    
    setColDef1(columns);

  }, [ requiredFields]);

  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    editable: false,
  }; 

  return (
    <div>
       


<div >
    {rowData.length === 0 && colDef1.length === 0 ? (
      <div>No data available. Please add a resource attribute.</div>
    ) : (
      <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDef1}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={10}
        animateRows={true}
        rowSelection="multiple"
      />
    </div>
    )}
    </div>
    {showToast && (
        <div
          className="toast-container position-fixed top-20 start-50 translate-middle p-3"
          style={{ zIndex: 1550 }}
        >
          <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
              <strong className="me-auto">Success</strong>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="toast"
                aria-label="Close"
                onClick={() => setShowToast(false)}
              ></button>
            </div>
            <div className="toast-body text-success text-center">Created successfully!</div>
          </div>
        </div>
    ) }
    
    </div>
    )
    
    
    };
    
    export default ReadRounds