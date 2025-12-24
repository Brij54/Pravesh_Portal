import { useQuery } from "@tanstack/react-query";
import apiConfig from "../config/apiConfig";
import { getCookie } from "./enum";

export const fetchMetaData = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Error fetching metadata: ${response.statusText}`);
  }

  return response.json();
};

export const fetchForeignData = async (
  resource: string,
  fieldName: string,
  foreignField: string
) => {
  // You can customize the URL based on your backend
  const response = await fetch(`${apiConfig.API_BASE_URL}/foreign/${resource}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch foreign data for ${resource}`);
  }

  return response.json();
};

export const fetchEnumData = async (enumName: string) => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/enum/${enumName}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch enum data for ${enumName}`);
  }

  return response.json();
};


const fetchDataById = async (id: string, resourceName: string) => {
//   const baseUrl = 'http://localhost:8082/api/airline';

const baseUrl = apiConfig.getResourceUrl(resourceName.toLowerCase());

  const params = new URLSearchParams({
    args: `id:${id}`,
    queryId: 'GET_BY_ID',
  });

  const url = `${baseUrl}?${params.toString()}`;
const accessToken = getCookie("access_token");
  const response = await fetch(url,{
    headers: {
          // "Content-Type": "application/x-www-form-urlencoded",
          'Authorization': `Bearer ${accessToken}`, // Add token here
        },
        credentials: 'include', // include cookies if needed
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  return data;
};


//hook for fetching data by ID
export const useGetById = (id: string, resourceName: string) => {
  return useQuery({
    queryKey: ['getById', resourceName, id],
    queryFn: () => fetchDataById(id, resourceName),
    enabled: !!id && !!resourceName,
  });
};