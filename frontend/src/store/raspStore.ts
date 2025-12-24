import { create } from "zustand";

type DataObject = Record<string, any>;

// Dynamic structure: userId -> resource -> array of form objects
type DynamicStore = {
  [userId: string]: {
    [resource: string]: DataObject[];
  };
};

// Methods stored separately
interface StoreMethods {
  initializeStore: (
    userId: string,
    data: { resource: string; records: any[] }
  ) => void;
  addSubmission: (userId: string, resourceName: string, data: DataObject) => void;
  getSubmissions: (userId: string, resourceName: string) => DataObject[];
  getUserAllData: (userId: string) => { [resource: string]: DataObject[] };
  clearUserData: (userId: string) => void;
  clearResourceData: (userId: string, resourceName: string) => void;
}

// Final store = dynamic data + methods
type RaspStore = DynamicStore & StoreMethods;

export const useRaspStore = create<RaspStore>()(
  (set, get): any => ({
    storeName: "RASP_STORE",
    // ---------------------------
    // NEW: INITIALIZE STORE
    // ---------------------------
    initializeStore: (userId: string, data: { resource: string; records: any[] }) => {
      const formatted: Record<string, DataObject[]> = {};
      formatted[data.resource.toLowerCase()] = data.records

      set((state: any) => {
        const userData = state[userId] || {};
        return {
          ...state,
          [userId]: {
            ...userData,
            [data.resource.toLowerCase()]: data.records,
          },
        }
      });
    },
    addSubmission: (userId: string, resourceName: string, formData: DataObject) => {
      const key = resourceName.toLowerCase();

      set((state: any) => {
        const userData = state[userId] || {};
        const existing = userData[key] || [];

        return {
          ...state,
          [userId]: {
            ...userData,
            [key]: [...existing, formData],
          },
        };
      });
    },

    // =====================
    //      GET
    // =====================
    getSubmissions: (userId: string, resourceName: string) => {
      const key = resourceName.toLowerCase();
      return get()[userId]?.[key] || [];
    },

    // =====================
    //  GET ALL FOR USER
    // =====================
    getUserAllData: (userId: string) => {
      const state = get();
      return state[userId] || {}; // returns object of resources
    },
    // =====================
    //   CLEAR USER
    // =====================
    clearUserData: (userId: string) => {
      set((state: any) => {
        const newState = { ...state };
        delete newState[userId];
        return newState;
      });
    },

    // =====================
    //   CLEAR RESOURCE
    // =====================
    clearResourceData: (userId: string, resourceName: string) => {
      const key = resourceName.toLowerCase();

      set((state: any) => {
        const userData = state[userId] || {};

        if (userData[key]) {
          delete userData[key];
        }

        return {
          ...state,
          [userId]: userData,
        };
      });
    },
  }),



);
