import apiConfig from "../config/apiConfig";
export const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

export const fetchEnums = async (appName: string) => {
  const response = await fetch(
    `${apiConfig.API_BASE_URL}/getEnums/${appName}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  if (!response.ok) throw new Error("Failed to fetch enums");

  return response.json();
};

// src/api/enums.ts



export const fetchEnum = async (enumName: string) => {
  const formData = new URLSearchParams();
  formData.append("queryId", "GET_ALL");
  const response = await fetch(`${apiConfig.API_BASE_URL}/${enumName}?${formData.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getCookie("access_token")}`, // Add token here
    },
    credentials: "include",
    // body: formData, // Assuming you want to fetch all enum values,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch enum data for ${enumName}`);
  }

  const data = await response.json();
  return data;
};


export const deleteEnum = async (appName: string, enumName: string): Promise<string> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/deleteEnum/${appName}/${enumName}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete enum");
  }

  return enumName;
};


// src/api/enums.ts

export const saveEnum = async (data: {
  applicationName: string;
  enumName: string;
  enumContent: {
    enum_name: string;
    fieldValues: any;
  };
}): Promise<any> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/saveEnum`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to save enum");
  }

  return response.json();
};
