import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkflowStore } from "../useStore/workflowStore";
import { WorkflowDefinition } from "../types/types";
import { useUserStore } from "../useStore/userStore";
import { WORKFLOW_BASE_URL } from "../config/config";

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  thread_id: string;
  created_at: string;
}


const WorkflowListExecutions: React.FC = () => {
  const navigate = useNavigate();
  const { selectedWorkflow, setSelectedExecution, setSelectedWorkflow, availableRoles } = useWorkflowStore();
  const { currentUser, setCurrentUser } = useUserStore();

  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [filteredExecutions, setFilteredExecutions] = useState<WorkflowExecution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedWorkflow?.id) {
      navigate("/");
      return;
    }

    const fetchExecutions = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${WORKFLOW_BASE_URL}/workflow_executions?workflow_id=${selectedWorkflow.id}`
        );
        if (!res.ok) throw new Error("Failed to load workflow executions");

        const data = await res.json();
        setExecutions(data.executions || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExecutions();
  }, [selectedWorkflow, navigate]);

  useEffect(() => {
    const filterExecutions = async () => {
      if (executions.length === 0 || !selectedWorkflow) return;

      if (currentUser?.role === "admin") {
        setFilteredExecutions(executions);
        return;
      }

      const filtered: WorkflowExecution[] = [];

      for (const exe of executions) {
        try {
          const res = await fetch(
            `${WORKFLOW_BASE_URL}/state?workflow_id=${selectedWorkflow.id}&thread_id=${exe.thread_id}`
          );
          if (!res.ok) continue;

          const data = await res.json();
          const history = data || [];
          const last_event = history[0];
          const current_node_id = last_event?.next?.[0];

          if (currentUserPermitted(current_node_id)) {
            filtered.push(exe);
          }
        } catch (e) {
          console.warn("Failed to fetch history for", exe.thread_id);
        }
      }

      setFilteredExecutions(filtered);
    };

    filterExecutions();
  }, [executions, selectedWorkflow, currentUser]);

  const currentUserPermitted = (current_node: string): boolean => {
    if (!selectedWorkflow || !currentUser) return false;
    const node:any = selectedWorkflow.workflow_spec.nodes.find(
      (n: any) => n.id === current_node
    );
    console.log("Node", node);
    console.log("Current User", currentUser);
    for(const input of node.inputs) {
      if (input.roles.includes(currentUser.role)) return true;
    }
    return false;
  };

  const handleSelectExecution = (execution: WorkflowExecution) => {
    setSelectedExecution(execution);
    navigate(`/workflow_form/${execution.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center" 
           style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="position-relative mb-4">
            <div className="spinner-border text-white" 
                 style={{ width: '4rem', height: '4rem', borderWidth: '0.3rem' }}
                 role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="position-absolute top-50 start-50 translate-middle">
              <svg width="24" height="24" fill="white" viewBox="0 0 16 16">
                <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0z"/>
              </svg>
            </div>
          </div>
          <h3 className="text-white fw-bold mb-2">Loading Executions</h3>
          <p className="text-white opacity-75">Fetching workflow runs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{ background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7">
              <div className="card border-0 rounded-4 shadow-lg overflow-hidden">
                <div className="position-absolute top-0 start-0 w-100" 
                     style={{ height: '5px', background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' }}></div>
                <div className="card-body text-center p-5">
                  <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4" 
                       style={{ 
                         width: '100px', 
                         height: '100px',
                         background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
                       }}>
                    <svg width="50" height="50" fill="#dc2626" viewBox="0 0 16 16">
                      <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                    </svg>
                  </div>
                  <h3 className="fw-bold text-dark mb-3">Unable to Load Data</h3>
                  <p className="text-muted mb-4 lead">{error}</p>
                  <button 
                    className="btn rounded-3 px-4 py-2 fw-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}
                    onClick={() => window.location.reload()}>
                    <svg width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                    </svg>
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      {/* Modern Header with Gradient */}
      <div className="position-relative" 
           style={{ 
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
             borderBottom: '1px solid rgba(255,255,255,0.1)'
           }}>
        <div className="container py-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              {/* Breadcrumb */}
              <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <a href="#" 
                       onClick={(e) => { e.preventDefault(); navigate("/"); }} 
                       className="text-white text-decoration-none opacity-75"
                       style={{ transition: 'opacity 0.2s' }}
                       onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                       onMouseLeave={(e) => e.currentTarget.style.opacity = '0.75'}>
                      <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                        <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146z"/>
                      </svg>
                      Workflows
                    </a>
                  </li>
                  <li className="breadcrumb-item text-white active" aria-current="page">
                    {selectedWorkflow?.name || "Executions"}
                  </li>
                </ol>
              </nav>
              
              {/* Title */}
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-4 d-flex align-items-center justify-content-center" 
                     style={{ 
                       width: '60px', 
                       height: '60px',
                       background: 'rgba(255,255,255,0.2)',
                       backdropFilter: 'blur(10px)',
                       border: '2px solid rgba(255,255,255,0.3)'
                     }}>
                  <svg width="28" height="28" fill="white" viewBox="0 0 16 16">
                    <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm2 5.755V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-.245S4 12 8 12s5 1.755 5 1.755z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-white fw-bold mb-1 display-6">Execution Runs</h1>
                  <p className="text-white mb-0 opacity-75">{selectedWorkflow?.name || "Workflow"}</p>
                </div>
              </div>
            </div>
            
            {/* User Profile Card */}
            <div className="col-lg-4">
              <div className="card border-0 rounded-4 overflow-hidden" 
                   style={{ 
                     background: 'rgba(255,255,255,0.95)',
                     backdropFilter: 'blur(10px)',
                     boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                   }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="position-relative">
                      <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" 
                           style={{ 
                             width: '48px', 
                             height: '48px',
                             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                             fontSize: '1.125rem'
                           }}>
                        {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="position-absolute bottom-0 end-0 rounded-circle border border-2 border-white" 
                           style={{ 
                             width: '12px', 
                             height: '12px', 
                             background: '#10b981'
                           }}></div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark">{currentUser?.name || "User"}</div>
                      <div className="text-muted small">Active Now</div>
                    </div>
                  </div>
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

      {/* Main Content */}
      <div className="container py-5">
        {/* Workflow Info Banner */}
        <div className="card border-0 rounded-4 shadow-sm mb-4 overflow-hidden">
          <div className="position-absolute top-0 start-0 w-100" 
               style={{ height: '4px', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}></div>
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <div className="d-flex align-items-start gap-3">
                  <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" 
                       style={{ 
                         width: '50px', 
                         height: '50px',
                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                       }}>
                    <svg width="24" height="24" fill="white" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M8 3a.5.5 0 0 1 .5.5V5a.5.5 0 0 1-1 0V3.5A.5.5 0 0 1 8 3zM3.854 5.146a.5.5 0 1 0-.708.708l1.06 1.06a.5.5 0 0 0 .708-.708l-1.06-1.06zm-.708 5.708a.5.5 0 0 0 .708-.708l-1.06-1.06a.5.5 0 0 0-.708.708l1.06 1.06zM8 13a.5.5 0 0 1-.5-.5V11a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5z"/>
                    </svg>
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="fw-bold text-dark mb-2">{selectedWorkflow?.name || "Workflow"}</h4>
                    <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
                      {selectedWorkflow?.description || "View and manage all execution runs for this workflow"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                <button
                  className="btn rounded-3 d-inline-flex align-items-center gap-2 px-4 py-2"
                  style={{
                    background: 'white',
                    border: '2px solid #e5e7eb',
                    color: '#6b7280',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => {
                    setSelectedWorkflow({} as WorkflowDefinition);
                    navigate("/");
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.color = '#667eea';
                    e.currentTarget.style.transform = 'translateX(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.color = '#6b7280';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                  </svg>
                  Back to Workflows
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-lg-4 col-md-6">
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
                      <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="fw-bold mb-0 display-6">{executions.length}</h2>
                    <p className="text-muted mb-0 fw-medium">Total Executions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4 col-md-6">
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
                         background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                       }}>
                    <svg width="28" height="28" fill="white" viewBox="0 0 16 16">
                      <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="fw-bold mb-0 display-6">{filteredExecutions.length}</h2>
                    <p className="text-muted mb-0 fw-medium">Accessible Runs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-12">
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
        </div>

        {/* Executions List */}
        {filteredExecutions.length === 0 ? (
          <div className="card border-0 rounded-4 shadow-sm overflow-hidden">
            <div className="position-absolute top-0 start-0 w-100" 
                 style={{ height: '4px', background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)' }}></div>
            <div className="card-body text-center p-5">
              <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4" 
                   style={{ 
                     width: '100px', 
                     height: '100px',
                     background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)'
                   }}>
                <svg width="50" height="50" fill="#f59e0b" viewBox="0 0 16 16">
                  <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z"/>
                </svg>
              </div>
              <h3 className="fw-bold text-dark mb-3">
                {currentUser?.role === "admin"
                  ? "No Executions Found"
                  : "No Accessible Runs"}
              </h3>
              <p className="text-muted mb-4 lead">
                {currentUser?.role === "admin"
                  ? "There are no workflow executions created yet."
                  : "You don't have permission to view any execution runs in your current role."}
              </p>
              {currentUser?.role !== "admin" && (
                <div className="alert alert-light border-0 rounded-3 d-inline-block text-start" 
                     style={{ background: '#f3f4f6' }}>
                  <div className="d-flex gap-3">
                    <div className="flex-shrink-0">
                      <svg width="20" height="20" fill="#3b82f6" viewBox="0 0 16 16">
                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                      </svg>
                    </div>
                    <div>
                      <strong className="text-dark">Tip:</strong> 
                      <span className="text-muted"> Switch roles or contact an administrator for access.</span>
                    </div>
                  </div>
                </div>
            
              )}
            </div>
          </div>

       
        ) : (
          <div className="card border-0 rounded-4 shadow-sm overflow-hidden">
            <div className="position-absolute top-0 start-0 w-100" 
                 style={{ height: '4px', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}></div>
            
            {/* Card Header */}
            <div className="card-header border-0 p-4" style={{ background: '#f8f9fa' }}>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-3 d-flex align-items-center justify-content-center" 
                       style={{ 
                         width: '44px', 
                         height: '44px',
                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                       }}>
                    <svg width="22" height="22" fill="white" viewBox="0 0 16 16">
                      <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                      <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z"/>
                    </svg>
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold text-dark">Execution Runs</h5>
                    <p className="mb-0 text-muted small">
                      Showing {filteredExecutions.length} of {executions.length} total runs
                    </p>
                  </div>
                </div>
                <span className="badge rounded-pill px-4 py-2" 
                      style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}>
                  {filteredExecutions.length} Available
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                      <th className="px-4 py-3 border-0">
                        <div className="d-flex align-items-center gap-2 text-muted fw-semibold small text-uppercase">
                          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                          </svg>
                          Run ID
                        </div>
                      </th>
                      <th className="px-4 py-3 border-0">
                        <div className="d-flex align-items-center gap-2 text-muted fw-semibold small text-uppercase">
                          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 2h-4v3h4V4zm0 4h-4v3h4V8zm0 4h-4v3h3a1 1 0 0 0 1-1v-2zm-5 3v-3H6v3h4zm-5 0v-3H1v2a1 1 0 0 0 1 1h3zm-4-4h4V8H1v3zm0-4h4V4H1v3zm5-3v3h4V4H6zm4 4H6v3h4V8z"/>
                          </svg>
                          Thread ID
                        </div>
                      </th>
                      <th className="px-4 py-3 border-0">
                        <div className="d-flex align-items-center gap-2 text-muted fw-semibold small text-uppercase">
                          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                          </svg>
                          Created At
                        </div>
                      </th>
                      <th className="px-4 py-3 border-0 text-end">
                        <span className="text-muted fw-semibold small text-uppercase">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExecutions.map((exe, index) => (
                      <tr key={exe.id} 
                          style={{ 
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8f9fa';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                          }}>
                        <td className="px-4 py-4 border-0">
                          <div className="d-flex align-items-center gap-3">
                            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white" 
                                 style={{ 
                                   width: '36px', 
                                   height: '36px',
                                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                   fontSize: '0.85rem'
                                 }}>
                              #{index + 1}
                            </div>
                            <code className="text-muted small" style={{ fontSize: '0.85rem' }}>
                              {exe.id.substring(0, 8)}...
                            </code>
                          </div>
                        </td>
                        <td className="px-4 py-4 border-0">
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded-2 px-3 py-2" 
                                 style={{ 
                                   background: 'rgba(102, 126, 234, 0.1)',
                                   border: '1px solid rgba(102, 126, 234, 0.2)'
                                 }}>
                              <code className="text-primary small fw-semibold" style={{ fontSize: '0.85rem' }}>
                                {exe.thread_id.substring(0, 12)}...
                              </code>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 border-0">
                          <div className="d-flex align-items-center gap-2 text-muted">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                            </svg>
                            <span style={{ fontSize: '0.9rem' }}>
                              {new Date(exe.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 border-0 text-end">
                          <button
                            className="btn rounded-3 d-inline-flex align-items-center gap-2 px-4 py-2"
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              border: 'none',
                              fontWeight: '600',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                            }}
                            onClick={() => handleSelectExecution(exe)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                            }}
                          >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                              <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                            </svg>
                            View Run
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table Footer */}
            <div className="card-footer border-0 py-3" style={{ background: '#f8f9fa' }}>
              <div className="d-flex align-items-center justify-content-between text-muted small">
                <div className="d-flex align-items-center gap-2">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                  </svg>
                  <span>
                    Displaying <strong>{filteredExecutions.length}</strong> execution{filteredExecutions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge rounded-pill px-3 py-1" 
                        style={{ 
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#059669',
                          fontWeight: '600'
                        }}>
                    {currentUser?.role?.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="container py-4">
        <div className="text-center">
          <p className="text-muted small mb-0">
            <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
            Access filtered by your current role • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkflowListExecutions;