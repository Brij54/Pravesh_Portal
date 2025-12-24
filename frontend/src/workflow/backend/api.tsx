import { WORKFLOW_BASE_URL } from "../config/config";
import { WorkflowDefinition, WorkflowState } from "../types/types";

export const api = {
  async fetchWorkflowInbox(userId: string): Promise<{ workflows: WorkflowDefinition[] }> {
    try {
      const response = await fetch(`${WORKFLOW_BASE_URL}/workflow_inbox`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send cookies with request
        body: JSON.stringify({ user_id: userId })
      });
      if (!response.ok) throw new Error("Failed to fetch workflows");
      return await response.json();
    } catch (error) {
      console.error("Error fetching workflows:", error);
      return { workflows: [] };
    }
  },

  async getWorkflowState(workflowId: string): Promise<WorkflowState | null> {
    try {
      const response = await fetch(`${WORKFLOW_BASE_URL}/workflow/${workflowId}/state`, {
        credentials: "include", // Send cookies with request
      });
      if (!response.ok) throw new Error("Failed to fetch workflow state");
      return await response.json();
    } catch (error) {
      console.error("Error fetching workflow state:", error);
      return null;
    }
  },

async getWorkflowHistory(workflowId: string, executionId: string): Promise<any[]> {
  try {
    const url = `${WORKFLOW_BASE_URL}/state?workflow_id=${workflowId}&thread_id=${executionId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Send cookies with request
    });
    if (!response.ok) throw new Error("Failed to fetch workflow history");
    return await response.json();
  } catch (error) {
    console.error("Error fetching workflow history:", error);
    return [];
  }
}
  ,

  async startWorkflow(workflowDefId: string, userId: string,role: string, initialData: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(`http://localhost:8000/invoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send cookies with request
        body: JSON.stringify({
          workflow_id: workflowDefId,
          user_id: userId,
          role: role,
          input: initialData
        })
      });
      if (!response.ok) throw new Error("Failed to create workflow");
      return await response.json();
    } catch (error) {
      console.error("Error creating workflow:", error);
      return null;
    }
  },

  async resumeWorkflow(workflowId: string, userId: string, input:any, role: string,thread_id: string): Promise<any> {
    try {
      const response = await fetch(`http://localhost:8000/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send cookies with request
        body: JSON.stringify({
          workflow_id: workflowId,
          thread_id: thread_id,
          input: input,
          user_id: userId,
          role: role
        })
      });
      if (!response.ok) throw new Error("Failed to progress workflow");
      return await response.json();
    } catch (error) {
      console.error("Error progressing workflow:", error);
      return null;
    }
  }
};
