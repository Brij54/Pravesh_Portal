import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WorkflowDefinition } from "../types/types";
import { useStartWorkflow, useWorkflowInbox } from "../backend/backend";
import { useWorkflowStore } from "../useStore/workflowStore";
import { useUserStore } from "../useStore/userStore";

const WorkflowList: React.FC = () => {
  const [defaultUser] = useState({
    id: "1234",
    name: "Kannan",
    role: "program_manager",
  });

  const navigate = useNavigate();
  const { setSelectedWorkflow, setAvailableRoles, availableRoles } = useWorkflowStore();
  const { setCurrentUser, currentUser } = useUserStore();

  const [workflowDefinitions, setWorkflowDefinitions] = useState<WorkflowDefinition[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<WorkflowDefinition[]>([]);
  const startWorkflow = useStartWorkflow();
  const { data, isLoading } = useWorkflowInbox(currentUser?.id ?? "");

  useEffect(() => {
    if (!currentUser) {
      setCurrentUser(defaultUser);
    }
  }, []);

  useEffect(() => {
    if ((data?.workflows?.length ?? 0) > 0) {
      setWorkflowDefinitions(data?.workflows ?? []);
    }
  }, [data]);

  useEffect(() => {
     if (!workflowDefinitions.length || !currentUser) {
    setFilteredWorkflows([]);
    return;
  }

  if (currentUser.role === "admin") {
    setFilteredWorkflows(workflowDefinitions);
    return;
  }
  const filtered = workflowDefinitions.filter((def) => {
    const canInvoke = def.workflow_spec.invoker === currentUser.role;

    const hasNodeAccess = def.workflow_spec.nodes.some((node:any) => {
      if (!node.inputs) return false;

      return node.inputs.some((input: any) =>
        Array.isArray(input.roles) && input.roles.includes(currentUser.role)
      );
      });

    return canInvoke || hasNodeAccess;
  });

  setFilteredWorkflows(filtered);
}, [workflowDefinitions, currentUser]);


  useEffect(() => {
     const rolesSet = new Set<string>();

  workflowDefinitions.forEach((def) => {
    def.workflow_spec.nodes.forEach((node: any) => {
      node.inputs?.forEach((input: any) => {
        if (Array.isArray(input.roles)) {
          input.roles.forEach((role: string) => {
            if (role && role.trim() !== "") rolesSet.add(role);
          });
        }
      });
 if (Array.isArray(node.outputs)) {
        node.outputs.forEach((output: any) => {
          if (Array.isArray(output.roles)) {
            output.roles.forEach((role: string) => {
              if (role && role.trim() !== "") rolesSet.add(role);
            });
          }
        });
      }
    });
 if (def.workflow_spec.invoker) {
      rolesSet.add(def.workflow_spec.invoker);
    }
  });

  rolesSet.add("admin");
  setAvailableRoles(Array.from(rolesSet));
}, [workflowDefinitions]);

if (isLoading) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-white mb-4" style={{ width: '4rem', height: '4rem', borderWidth: '0.3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h3 className="text-white fw-bold mb-2">Loading Workflows</h3>
          <p className="text-white opacity-75">Preparing your workspace...</p>
        </div>
      </div>
    );
  }
   const handleWorkflowSelect = (def: WorkflowDefinition) => {
    setSelectedWorkflow(def);
    navigate("/workflow_list_executions");
  };

  const handleInvokeWorkflow = (def: WorkflowDefinition) => {
    const spec = def.workflow_spec;
    const firstNode = spec.nodes[0];

    if (!firstNode) return;
    if (!currentUser) {
      alert("User information is missing. Please log in again.");
      return;
    }

    startWorkflow.mutate(
      {
         workflowDefId: def.id,
        userId: currentUser.id,
        role: currentUser.role,
        initialData: {},
      },
      {
        onSuccess: () => alert("Workflow started successfully!"),
        onError: () => alert("Failed to create workflow. Please try again."),
      }
    );
  };

  const getGradientForIndex = (index: number) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      {/* Modern Header with Glass Effect */}
      <div className="position-relative" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div className="container py-5">
          <div className="row align-items-center g-4">
            {/* Title Section */}
            <div className="col-lg-6">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-4 d-flex align-items-center justify-content-center" 
                     style={{ 
                       width: '60px', 
                       height: '60px',
                       background: 'rgba(255,255,255,0.2)',
                       backdropFilter: 'blur(10px)',
                       border: '2px solid rgba(255,255,255,0.3)'
                     }}>
                  <svg width="28" height="28" fill="white" viewBox="0 0 16 16">
                    <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-white fw-bold mb-1 display-6">Workflow Hub</h1>
                  <p className="text-white mb-0 opacity-75">Manage and execute your workflows seamlessly</p>
                </div>
              </div>
            </div>

            {/* User Profile Card */}
            <div className="col-lg-6">
              <div className="card border-0 rounded-4 overflow-hidden" 
                   style={{ 
                     background: 'rgba(255,255,255,0.95)',
                     backdropFilter: 'blur(10px)',
                     boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                   }}>
                <div className="card-body p-4">
                  <div className="row g-3 align-items-center">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center gap-3">
                        <div className="position-relative">
                          <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" 
                               style={{ 
                                 width: '52px', 
                                 height: '52px',
                                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                 fontSize: '1.25rem'
                               }}>
                            {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div className="position-absolute bottom-0 end-0 rounded-circle border border-2 border-white" 
                               style={{ 
                                 width: '14px', 
                                 height: '14px', 
                                 background: '#10b981'
                               }}></div>
                        </div>
                        <div>
                          <div className="fw-bold text-dark mb-1">{currentUser?.name || "User"}</div>
                          <div className="text-muted small">Active Now</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted mb-2">Current Role</label>
                      <select
                        className="form-select rounded-3 border-2"
                        style={{ 
                          borderColor: '#e5e7eb',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                        value={currentUser?.role || ""}
                        onChange={(e) => {
                          if (currentUser) {
                            setCurrentUser({ ...currentUser, role: e.target.value });
                          }
                        }}
                      >
                        {availableRoles.map((role) => (
                          <option key={role} value={role}>
                            {role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container py-5">
        {filteredWorkflows.length === 0 ? (
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div className="card border-0 rounded-4 text-center py-5 shadow-sm" style={{ background: 'white' }}>
                <div className="card-body p-5">
                  <div className="mb-4">
                    <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center" 
                         style={{ 
                           width: '100px', 
                           height: '100px',
                           background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)'
                         }}>
                      <svg width="50" height="50" fill="#f59e0b" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="fw-bold text-dark mb-3">No Workflows Available</h3>
                  <p className="text-muted mb-4 lead">
                    You don't have access to any workflows with your current role.
                  </p>
                  <div className="alert alert-light border-0 rounded-3 text-start" 
                       style={{ background: '#f3f4f6' }}>
                    <div className="d-flex gap-3">
                      <div className="flex-shrink-0">
                        <svg width="20" height="20" fill="#3b82f6" viewBox="0 0 16 16">
                          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                        </svg>
                      </div>
                      <div>
                        <strong className="text-dark">Tip:</strong> 
                        <span className="text-muted"> Switch to a different role using the dropdown above to see available workflows.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Enhanced Stats Cards */}
            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div className="card border-0 rounded-4 h-100 overflow-hidden shadow-sm" 
                     style={{ 
                       background: 'white',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'translateY(-4px)';
                       e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'translateY(0)';
                       e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                     }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-3 d-flex align-items-center justify-content-center" 
                           style={{ 
                             width: '60px', 
                             height: '60px',
                             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                           }}>
                        <svg width="28" height="28" fill="white" viewBox="0 0 16 16">
                          <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3z"/>
                          <path d="M9 2.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3z"/>
                        </svg>
                      </div>
                      <div>
                        <h2 className="fw-bold mb-0 display-6">{filteredWorkflows.length}</h2>
                        <p className="text-muted mb-0 fw-medium">Available Workflows</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-0 rounded-4 h-100 overflow-hidden shadow-sm" 
                     style={{ 
                       background: 'white',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'translateY(-4px)';
                       e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'translateY(0)';
                       e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                     }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-3 d-flex align-items-center justify-content-center" 
                           style={{ 
                             width: '60px', 
                             height: '60px',
                             background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                           }}>
                        <svg width="28" height="28" fill="white" viewBox="0 0 16 16">
                          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                          <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                        </svg>
                      </div>
                      <div>
                        <h2 className="fw-bold mb-0 text-capitalize" style={{ fontSize: '1.75rem' }}>
                          {currentUser?.role?.replace(/_/g, ' ') || "N/A"}
                        </h2>
                        <p className="text-muted mb-0 fw-medium">Your Role</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="col-md-4">
                <div className="card border-0 rounded-4 h-100 overflow-hidden shadow-sm" 
                     style={{ 
                       background: 'white',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'translateY(-4px)';
                       e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'translateY(0)';
                       e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                     }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-3 d-flex align-items-center justify-content-center" 
                           style={{ 
                             width: '60px', 
                             height: '60px',
                             background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                           }}>
                        <svg width="28" height="28" fill="white" viewBox="0 0 16 16">
                          <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                        </svg>
                      </div>
                      <div>
                        <h2 className="fw-bold mb-0 display-6">{availableRoles.length}</h2>
                        <p className="text-muted mb-0 fw-medium">Available Roles</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>

            {/* Premium Workflow Cards Grid */}
            <div className="row g-4">
              {filteredWorkflows.map((def, index) => (
                <div key={def.id} className="col-lg-4 col-md-6">
                  <div className="card border-0 rounded-4 h-100 overflow-hidden shadow-sm position-relative" 
                       style={{ 
                         background: 'white',
                         transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                         e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.transform = 'translateY(0) scale(1)';
                         e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                       }}>

                    {/* Gradient Top Bar */}
                    <div className="position-absolute top-0 start-0 w-100" 
                         style={{ 
                           height: '5px', 
                           background: getGradientForIndex(index)
                         }}></div>

                    <div className="card-body p-4 d-flex flex-column">
                      {/* Icon with Gradient Background */}
                      <div className="mb-4">
                        <div className="rounded-4 d-inline-flex align-items-center justify-content-center p-3 position-relative" 
                             style={{ 
                               background: getGradientForIndex(index),
                               boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                             }}>
                          <svg width="32" height="32" fill="white" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M8 3a.5.5 0 0 1 .5.5V5a.5.5 0 0 1-1 0V3.5A.5.5 0 0 1 8 3zM3.854 5.146a.5.5 0 1 0-.708.708l1.06 1.06a.5.5 0 0 0 .708-.708l-1.06-1.06zm-.708 5.708a.5.5 0 0 0 .708-.708l-1.06-1.06a.5.5 0 0 0-.708.708l1.06 1.06zM8 13a.5.5 0 0 1-.5-.5V11a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5zm4.146-2.146a.5.5 0 0 0-.708.708l1.06 1.06a.5.5 0 0 0 .708-.708l-1.06-1.06zm.708-5.708a.5.5 0 0 0-.708-.708l-1.06 1.06a.5.5 0 1 0 .708.708l1.06-1.06zM8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                          </svg>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h5 className="fw-bold text-dark mb-3" style={{ fontSize: '1.25rem', lineHeight: '1.4' }}>
                        {def.name}
                      </h5>
                      <p className="text-muted flex-grow-1 mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                        {def.description || "No description available for this workflow"}
                      </p>

                      {/* Metadata Pills */}
                      <div className="d-flex flex-wrap gap-2 mb-4">
                        <span className="badge rounded-pill px-3 py-2" 
                              style={{ 
                                background: 'rgba(102, 126, 234, 0.1)',
                                color: '#667eea',
                                fontSize: '0.85rem',
                                fontWeight: '600'
                              }}>
                          <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                            <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                          </svg>
                          {def.workflow_spec.invoker || "N/A"}
                        </span>
                        <span className="badge rounded-pill px-3 py-2" 
                              style={{ 
                                background: 'rgba(16, 185, 129, 0.1)',
                                color: '#10b981',
                                fontSize: '0.85rem',
                                fontWeight: '600'
                              }}>
                          <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                            <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                          </svg>
                          {def.workflow_spec.nodes?.length || 0} Nodes
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex gap-2">
                        <button
                          className="btn flex-grow-1 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1rem',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                          }}
                          onClick={() => handleWorkflowSelect(def)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                          }}
                        >
                          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                          </svg>
                          View Details
                        </button>
                        {currentUser?.role === def.workflow_spec.invoker && (
                          <button
                            type="button"
                            className="btn rounded-3 d-flex align-items-center justify-content-center"
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              border: 'none',
                              width: '48px',
                              height: '48px',
                              padding: '0',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                            }}
                            onClick={() => handleInvokeWorkflow(def)}
                            title="Start New Workflow"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px) rotate(90deg)';
                              e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0) rotate(0deg)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                            }}
                          >
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                              <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="container py-4">
        <div className="text-center">
          <p className="text-muted small mb-0">
            <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
            Showing {filteredWorkflows.length} workflow{filteredWorkflows.length !== 1 ? 's' : ''} available to your role
          </p>
        </div>
      </div>
    </div>
  );
};


export default WorkflowList;