import apiConfig from "../config/apiConfig";
// import { CustomComponent } from "../components/Accordian";

export const fetchCustomComponents = async (
  userId: string
): Promise<any[]> => {
  const res = await fetch(
    `${apiConfig.API_BASE_URL}/customComponents/${userId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  if (!res.ok) throw new Error("Failed to fetch custom components");

  const data = await res.json();
  return data.data || [];
};