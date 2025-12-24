import apiConfig from "../config/apiConfig";
import { getCookie } from "./enum";

export const fetchResources = async (appName: string) => {
  const response = await fetch(
    `${apiConfig.API_BASE_URL}/getResources/${appName}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  if (!response.ok) throw new Error("Failed to fetch resources");

  return response.json();
};

// export const fetchResourceData = async ({ queryKey }: { queryKey: [string, string] }) => {
//   const [_key, resName] = queryKey;
//   const params = new URLSearchParams();
//   const ssid: any = sessionStorage.getItem('key');
//   const queryId: any = 'GET_ALL';
//   params.append('queryId', queryId);
//   params.append('session_id', ssid);

//   const response = await fetch(`${apiConfig.getResourceUrl(resName.toLowerCase())}?` + params.toString(), {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });

//   if (!response.ok) {
//     throw new Error('Error: ' + response.status);
//   }

//   const data = await response.json();
//   return data;
// };


// export const fetchResMetaData = async ({ queryKey }: { queryKey: [string, string] }) => {
//   const [_key, resName] = queryKey;

//   const response = await fetch(`${apiConfig.getResourceMetaDataUrl(resName)}?`, {
//     method: 'GET',
//     headers: { 'Content-Type': 'application/json' },
//   });

//   if (!response.ok) {
//     throw new Error('Error: ' + response.status);
//   }

//   const data = await response.json();
//   return data;
// };

export const deleteResource = async (
  appName: string,
  resourceName: string
): Promise<string> => {
  const response = await fetch(
    `${apiConfig.API_BASE_URL}/deleteResource/${appName}/${resourceName}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete resource");
  }

  return resourceName; // return deleted name
};

export const saveResource = async (data: {
  applicationName: string;
  resourceName: string;
  resourceContent: {
    resource: string;
    fieldValues: any;
  };
}): Promise<any> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/saveResource`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to save resource");
  }

  return response.json();
};

export const fetchForeignResource = async (foreignResource: string) => {
  const params = new URLSearchParams();
  // const ssid: any = sessionStorage.getItem("key");
  const accessToken = getCookie("access_token");

  if (!accessToken) {
    throw new Error("Access token not found");
  }

  params.append("queryId", "GET_ALL");
  // params.append("session_id", ssid);

  const response = await fetch(
    `${
      apiConfig.API_BASE_URL
    }/${foreignResource.toLowerCase()}?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      }, // Add token here },
      credentials: "include", // include cookies if needed
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch foreign data for ${foreignResource}`);
  }

  const data = await response.json();
  return data.resource;
};

