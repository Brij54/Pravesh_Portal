import apiConfig from "../config/apiConfig";
import { fetchForeignResource } from '../apis/resources';
import { fetchEnum } from '../apis/enum';
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
const apiUrl = apiConfig.getResourceUrl("Rounds");
const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };
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
  const token = getCookie("access_token");
export const roundsService = {
  async create(data: any) {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${data.accessToken}` },
      body: data.params,
    });

    

    const resJson =  await res.json()
    console.log("resssss",resJson);
    if (resJson.errCode ===-1) alert("Error: "+resJson.message);
    return resJson

    
  },

  async getData () {
    const response = await fetch(
        `${apiConfig.getResourceUrl('rounds')}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Add token here
          },
          credentials: "include", // include cookies if needed
        }
      );

      if (!response.ok) {
        throw new Error("Error: " + response.status);
      }

      const data = await response.json();
       return data.resource||[];
  },

  async getMetadata(): Promise<any> {
    const metadataUrl = apiConfig.getResourceMetaDataUrl("Rounds");
    const res = await fetch(metadataUrl);
    if (!res.ok) throw new Error("Metadata fetch failed");
    return res.json();
  },

  async getForeignResource(name: string): Promise<any[]> {
   
    const data = await fetchForeignResource(name);
    return data;
},

async getEnum(name: string): Promise<any[]> {
 
    const data = await fetchEnum(name);
    return data;
  },
};
