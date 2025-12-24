// useWorkflowQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
 // import your api file if it's in a different module

// 🧠 FETCH WORKFLOW INBOX
export const useWorkflowInbox = (userId: string) => {
  return useQuery({
    queryKey: ["workflowInbox", userId],
    queryFn: () => api.fetchWorkflowInbox(userId),
    enabled: !!userId, // prevent running when userId is null/undefined
  });
};

// 📄 FETCH WORKFLOW STATE
export const useWorkflowState = (workflowId: string) => {
  return useQuery({
    queryKey: ["workflowState", workflowId],
    queryFn: () => api.getWorkflowState(workflowId),
    enabled: !!workflowId,
  });
};

// 📜 FETCH WORKFLOW HISTORY
export const useWorkflowHistory = (workflowId: string, executionId: string) => {
  return useQuery({
    queryKey: ["workflowHistory", workflowId, executionId],
    queryFn: () => api.getWorkflowHistory(workflowId, executionId),
    enabled: !!workflowId && !!executionId,
    refetchInterval: 5000,
  });
};

// 🚀 START WORKFLOW (MUTATION)
export const useStartWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowDefId,
      userId,
      role,
      initialData,
    }: {
      workflowDefId: string;
      userId: string;
      role: string;
      initialData: Record<string, any>;
    }) => api.startWorkflow(workflowDefId, userId, role, initialData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflowInbox"] });
    },
  });
};

// ▶️ RESUME WORKFLOW (MUTATION)
export const useResumeWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      userId,
      input,
      role,
      thread_id,
    }: {
      workflowId: string;
      userId: string;
      input: any;
      role: string;
      thread_id: string;
    }) => api.resumeWorkflow(workflowId, userId, input, role, thread_id),

    onSuccess: (data) => {
      if (data?.workflow_id) {
        queryClient.invalidateQueries({
          queryKey: ["workflowState", data.workflow_id],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["workflowInbox"] });
    },
  });
};
