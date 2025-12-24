import { useState, useRef ,useEffect} from "react";
import { useRaspStore } from "../store/raspStore.ts";
import { roundsService } from "../services/RoundsService.ts";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"

export const getUserIdFromJWT = (): any => {
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

export const useRoundsViewModel = (userId: string, appId: string) => {
  const [fields, setFields] = useState<any[]>([]);
  const [foreignKeyData, setForeignKeyData] = useState<any>({});
  const [enums, setEnums] = useState<any>({});
  const [dataToSave, setDataToSave] = useState<any>({});
const [fetchedForeign, setFetchedForeign] = useState<Set<string>>(new Set());
const [fetchedEnum, setFetchedEnum] = useState<Set<string>>(new Set());
  const addSubmission = useRaspStore((s) => s.addSubmission);
  const getSubmissions = useRaspStore((s) => s.getSubmissions);
    const getUserAllData = useRaspStore((s) => s.getUserAllData);
    useEffect(()=>{
      const dataFromStore = getSubmissions(userId, "Rounds");
     const allData = getUserAllData(userId);
      console.log("all data from store for student resource",dataFromStore,allData);
    },[])
const loadMetadata = async () => {
  const metadata = await roundsService.getMetadata();
  const metaFields = metadata[0].fieldValues||[];

  setFields(metaFields);
  // FOREIGNS
  for (let field of metaFields) {
    if (field.foreign) {
      const foreignName = field.foreign;

      if (!fetchedForeign.has(foreignName)) {
        const updated = new Set(fetchedForeign);
        updated.add(foreignName);
        setFetchedForeign(updated);

        const data = await roundsService.getForeignResource(foreignName);

        setForeignKeyData((prev:any) => ({
          ...prev,
          [foreignName]: data,
        }));
      }
    }
  }

  // ENUMS
  for (let field of metaFields) {
    if (field.isEnum) {
      const enumName = field.possible_value;

      if (!fetchedEnum.has(enumName)) {
        const updatedEnum = new Set(fetchedEnum);
        updatedEnum.add(enumName);
        setFetchedEnum(updatedEnum);

        const values = await roundsService.getEnum(enumName);

        setEnums((prev:any) => ({
          ...prev,
          [enumName]: values,
        }));
      }
    }
  }
};

  const save = async (accessToken: string) => {
    if (!accessToken) {
      throw new Error("Access token not found");
    }
    const params = new FormData();

    let selectedFile = null;
    selectedFile = Object.keys(dataToSave).filter((key) => dataToSave[key] instanceof File);
    if(selectedFile!== undefined && selectedFile.length>0){
      params.append("file", dataToSave[selectedFile[0]]);
      dataToSave[selectedFile[0]] = "";

      params.append("description", "my description");
      params.append("appId","hostel_management_system");
      params.append("dmsRole", "admin");
      params.append("user_id", "admin@rasp.com");
      params.append("tags","t1,t2,attend");
    }
    const jsonString = JSON.stringify(dataToSave);
    const base64Encoded = btoa(jsonString);
    params.append('resource', base64Encoded);

    const response = await roundsService.create({
      accessToken,
      params,
    });

    if (response.errCode !== -1) {
      addSubmission(userId, "Student", dataToSave);
      console.log("data initialized in store in create form model", getUserAllData(getUserIdFromJWT()))
    }
  };

  return {
    fields,
    setFields,
    enums,
    foreignKeyData,
    setForeignKeyData,
    setEnums,
    dataToSave,
    setDataToSave,
    loadMetadata,
    save,
  };
};
