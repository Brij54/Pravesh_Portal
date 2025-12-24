
export interface FormField {
  name: string;
  label: string;
  type: string;
  access: "read" | "write";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  default?: any;
}

export interface WorkflowNode {
  id: string;
  label: string;
  type: string;
  roles: string[];
  access: {
    fields: Array<{
      name: string;
      access: string;
      type: string;
      options?: string[];
      required?: boolean;
      default?: any;
      placeholder?: string;
    }>;
  };
}

export interface WorkflowSpec {
  version: string;
  user_id: string;
  name: string;
  description: string;
  invoker: string;
  nodes: WorkflowNode[];
  edges: Array<{
    from: string;
    to: { nodes: string[] };
  }>;
}

export interface WorkflowDefinition {
  id: string;
  user_id: string;
  name: string;
  description: string;
  workflow_spec: WorkflowSpec;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface WorkflowState {
  workflowId: string;
  currentNodeId: string;
  formData: Record<string, any>;
  history: Array<{
    nodeId: string;
    nodeName: string;
    completedAt: string;
    completedBy: string;
    data: Record<string, any>;
  }>;
}
export interface workflowExecution {
  id: string;
  workflow_id: string;
  thread_id: string;
  created_at: string;
}
