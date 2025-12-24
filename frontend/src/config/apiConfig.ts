const apiConfig = {
    // This is the base URL for the Designer Backend (for metadata)
    API_BASE_URL: process.env.REACT_APP_GENERATED_BACKEND_URL,
    // This function should point to the generated backend\'s data endpoint for a resource
    getResourceUrl: (resourceName: string) => process.env.REACT_APP_GENERATED_BACKEND_URL + "/" + resourceName.toLowerCase(),
    // This function should point to the Designer Backend\'s metadata endpoint for a resource
    getResourceMetaDataUrl: (resourceName: string) => process.env.REACT_APP_GENERATED_BACKEND_URL + "/getAllResourceMetaData/" + resourceName.toLowerCase(),
};
export default apiConfig;