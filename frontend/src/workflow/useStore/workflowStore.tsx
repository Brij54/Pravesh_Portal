import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
// import { WorkflowDefinition } from '../types/types';
import { WorkflowDefinition, workflowExecution } from '../types/types';


interface WorkflowStoreState {
  selectedWorkflow: WorkflowDefinition | null;
  setSelectedWorkflow: (workflow: WorkflowDefinition) => void;
  selectedExecution?: workflowExecution;
  setSelectedExecution: (execution:workflowExecution ) => void;
  availableRoles: string[];
  setAvailableRoles: (roles: string[]) => void;
}

export const useWorkflowStore = create<WorkflowStoreState>()(
  devtools((set) => ({
    selectedWorkflow: null,
    setSelectedWorkflow: (workflow) => set({ selectedWorkflow: workflow }),
    selectedExecution: undefined,
    setSelectedExecution: (execution) => set({ selectedExecution: execution }),
    availableRoles: [],
    setAvailableRoles: (roles) => set({ availableRoles: roles }),
  }))
);