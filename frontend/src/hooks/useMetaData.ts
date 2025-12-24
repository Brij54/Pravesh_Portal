import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchEnumData, fetchForeignData, fetchMetaData } from "../apis/meta";
// import { fetchMetaData, fetchForeignData, fetchEnumData } from "../api/meta";

export const useMetaData = (metadataUrl: string) => {
  const queryClient = useQueryClient();
  const [fields, setFields] = useState([]);
  const [resMetaData, setResMetaData] = useState([]);
  const fetchedResources = new Set<string>();
  const fetchedEnum = new Set<string>();

  const metaQuery = useQuery({
    queryKey: ["metadata", metadataUrl],
    queryFn: () => fetchMetaData(metadataUrl),
  });

  useEffect(() => {
    const handleSuccess = async (metaData: any) => {
      setResMetaData(metaData);
      setFields(metaData[0]?.fieldValues || []);

      const foreignFields = metaData[0]?.fieldValues?.filter((f: any) => f.foreign) || [];
      const enumFields = metaData[0]?.fieldValues?.filter((f: any) => f.isEnum) || [];

      for (const field of foreignFields) {
        if (!fetchedResources.has(field.foreign)) {
          fetchedResources.add(field.foreign);
          await queryClient.prefetchQuery({
            queryKey: ["foreignData", field.foreign],
            queryFn: () => fetchForeignData(field.foreign, field.name, field.foreign_field),
          });
        }
      }

      for (const field of enumFields) {
        if (!fetchedEnum.has(field.possible_value)) {
          fetchedEnum.add(field.possible_value);
          await queryClient.prefetchQuery({
            queryKey: ["enumData", field.possible_value],
            queryFn: () => fetchEnumData(field.possible_value),
          });
        }
      }
    };

    if (metaQuery.data) {
      handleSuccess(metaQuery.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaQuery.data]);

  return {
    resMetaData,
    fields,
    isLoading: metaQuery.isLoading,
    error: metaQuery.error,
  };
};
