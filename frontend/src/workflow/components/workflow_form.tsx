import { useWorkflowStore } from "../useStore/workflowStore";
import React, { useEffect, useState } from "react";
import { useResumeWorkflow, useWorkflowHistory } from "../backend/backend";
import { useUserStore } from "../useStore/userStore";
import { useNavigate } from "react-router-dom";
import { DMS_PORT, DMS_UPLOAD_URL } from "../config/config";

const ShowForm = () => {
  const navigate = useNavigate();
  const { selectedWorkflow, selectedExecution, availableRoles } =
    useWorkflowStore();
  const { data, isLoading, error }: any = useWorkflowHistory(
    selectedExecution!.workflow_id,
    selectedExecution!.thread_id
  );
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [currentNode, setCurrentNode] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const resumeWorkflowMutation = useResumeWorkflow();
  const { currentUser, setCurrentUser } = useUserStore();


  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleUploadFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);
      formDataObj.append("appId", "workflow");
      formDataObj.append("userid", currentUser ? currentUser.id : "");
      formDataObj.append("dmsRole", "admin");

      const response = await fetch(`${DMS_UPLOAD_URL}`, {
        method: "POST",
        body: formDataObj,
      });

      if (!response.ok)
        throw new Error(`Upload failed: ${response.statusText}`);
      const data = await response.json();

      setFormData((prev) => ({
        ...prev,
        [fieldName]: "file" + data.id,
      }));
    } catch (err) {
      console.error("❌ File upload error:", err);
      alert("File upload failed. Please try again.");
    }
  };

  const handleBackToInbox = () => navigate("/");

  const canReadField = (field: { access: string }): boolean => {
    return true;
  };
  const canWriteField = (field: any): boolean => {
    return true;
  };

  useEffect(() => {
    if (!selectedWorkflow) return;
    if (data && data[0]?.next?.[0]) {
      console.log("Next node ID:", data[0].next[0]);
      for (const node of selectedWorkflow.workflow_spec.nodes) {
        if (node.id === data[0].next[0]) {
          console.log("Node ID:", node);
          setCurrentNode(node);
          const formInput = (node as any).inputs?.find(
            (input: any) =>
              input.type === "dynamic_object" &&
              input.fields &&
              input.fields.length > 0
          );
          const initialData = formInput?.fields.reduce(
            (acc: any, f: any): any => {
              acc[f.name] = f.default ?? "";
              return acc;
            },
            {}
          );
          console.log("Initial Data:", initialData);
          setFormData(initialData);
        }
      }
    }
  }, [data]);

  const renderFormField = (field: any) => {
    if (!field) return null;

    const isWritable = canWriteField(field);
    const isReadable = canReadField(field);

    if (!isReadable) return null;

    const fieldType = (field.type || "string").toLowerCase();
    const value = formData[field.name] ?? "";

    const baseInputClass = `form-control border-2 ${
      !isWritable
        ? "bg-light border-secondary"
        : "border-primary focus:border-primary focus:ring-2 focus:ring-primary"
    }`;

    switch (fieldType) {
      case "dropdown":
      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={!isWritable}
            className={`form-select ${baseInputClass} py-2`}
            style={{ transition: "all 0.2s ease" }}
          >
            <option value="">Select an option...</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={!isWritable}
            className={`${baseInputClass} py-2`}
            style={{
              minHeight: "120px",
              resize: "vertical",
              transition: "all 0.2s ease",
            }}
            placeholder={field.placeholder || "Enter text..."}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={!isWritable}
            className={`${baseInputClass} py-2`}
            placeholder={field.placeholder || "0"}
            style={{ transition: "all 0.2s ease" }}
          />
        );

      case "file":
        return (
          <div>
            <input
              type="file"
              onChange={(e) => handleUploadFile(e, field.name)}
              disabled={!isWritable}
              className={`${baseInputClass} py-2`}
              style={{ transition: "all 0.2s ease" }}
            />

            {formData[field.name] && (
              <div className="mt-3 p-3 bg-success bg-opacity-10 border border-success rounded-3">
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                <span className="text-success fw-semibold">
                  File uploaded successfully
                </span>
                <small className="d-block text-muted mt-1">
                  ID: {formData[field.name]}
                </small>
              </div>
            )}
          </div>
        );

      case "boolean":
        return (
          <div className="form-check">
            <input
              type="checkbox"
              checked={value === "true"}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              disabled={!isWritable}
              className={`form-check-input ${baseInputClass}`}
              style={{ transition: "all 0.2s ease" }}
            />
            <label className="form-check-label">True</label>
          </div>
        );

      default:
        // string / default input
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={!isWritable}
            className={`${baseInputClass} py-2`}
            placeholder={field.placeholder || "Enter text..."}
            style={{ transition: "all 0.2s ease" }}
          />
        );
    }
  };

  const validateForm = (fields: any[]): boolean => {
    for (const field of fields) {
      if (field.required && canWriteField(field)) {
        const value = formData[field.name];
        if (value === undefined || value === "" || value === null) {
          return false;
        }
      }
    }
    return true;
  };

  const handleProgressWorkflow = () => {
    if (!selectedWorkflow || !currentNode) return;
    if (!currentUser) {
      alert("User information is missing. Please log in again.");
      return;
    }

    // const fields = currentNode.access.fields;
    // if (!validateForm(fields)) {
    //   alert("Please fill all required fields");
    //   return;
    // }

    resumeWorkflowMutation.mutate(
      {
        workflowId: selectedExecution!.workflow_id,
        userId: currentUser.id,
        input: JSON.stringify(formData),
        role: currentUser.role,
        thread_id: selectedExecution!.thread_id,
      },
      {
        onSuccess: () => {
          alert("Workflow progressed to next step!");
          handleBackToInbox();
        },
        onError: () => alert("Failed to progress workflow. Please try again."),
      }
    );
  };

  const getOrderedNodes = (edges: any[]) => {
    const visited = new Set<string>();
    const order: string[] = [];
    edges.forEach((edge) => {
      if (edge.to?.nodes) {
        edge.to.nodes.forEach((n: string) => {
          if (n !== "__start__" && n !== "__end__" && !visited.has(n)) {
            visited.add(n);
            order.push(n);
          }
        });
      }
      if (edge.to?.conditional_nodes) {
        edge.to.conditional_nodes.forEach((cond: any) => {
          const n = cond.node;
          if (n !== "__start__" && n !== "__end__" && !visited.has(n)) {
            visited.add(n);
            order.push(n);
          }
        });
      }
    });
    return order;
  };

  const orderedNodes = getOrderedNodes(selectedWorkflow?selectedWorkflow.workflow_spec.edges:[]);
  const latestHistory = data
    ? [...data]
        .reverse()
        .filter((d: any) => d.values && Object.keys(d.values).length > 0)
    : [];

  const handle_sort_and_remove_duplicates = (
    latestHistory: any,
    orderedNodes: string[]
  ) => {
    const sortedHistory = [...latestHistory].sort(
      (a: any, b: any) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const nodeMap: Record<string, any> = {};
    const isEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

    sortedHistory.forEach((item: any) => {
      if (item.values) {
        Object.entries(item.values).forEach(([nodeKey, nodeValue]) => {
          if (!nodeMap[nodeKey]) {
            nodeMap[nodeKey] = {
              created_at: item.created_at,
              values: nodeValue,
              metadata: item.metadata,
            };
          } else {
            if (!isEqual(nodeMap[nodeKey].values, nodeValue)) {
              nodeMap[nodeKey].values = nodeValue;
              nodeMap[nodeKey].created_at = item.created_at;
              nodeMap[nodeKey].metadata = item.metadata;
            }
            if (item.next.includes(currentNode)) {
              nodeMap[currentNode].created_at = item[1].created_at;
              nodeMap[currentNode].metadata = item[1].metadata;
            }
          }
        });
      }
    });

    const mergedHistory = orderedNodes
      .filter((node) => nodeMap[node])
      .map((node) => ({
        node_id: node,
        created_at: nodeMap[node].created_at,
        values: nodeMap[node].values,
        metadata: { user_id: nodeMap[node].metadata },
      }));

    return mergedHistory;
  };

  const finalHistory = handle_sort_and_remove_duplicates(
    latestHistory,
    orderedNodes
  );
  const sortedFinalHistory = [...finalHistory].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div
      className="container-fluid py-4 p-5"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)",
        minHeight: "100vh",
      }}
    >
      <div className="row mb-4">
        <div className="col-12">
          <button
            className="btn btn-light border-0 shadow-sm px-4 py-2"
            onClick={handleBackToInbox}
            style={{
              transition: "all 0.3s ease",
              fontWeight: "500",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateX(-5px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateX(0)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Inbox
          </button>
        </div>
      </div>

      <div className="row">
        {/* Left/Middle Column - Header & Form */}
        <div className="col-lg-7 col-xl-8 mb-4">
          {/* Enhanced Header */}
          <div
            className="card border-0 shadow-lg mb-4"
            style={{ borderRadius: "16px", overflow: "hidden" }}
          >
            <div
              className="card-body p-4"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="fw-bold mb-2" style={{ fontSize: "1.75rem" }}>
                    {selectedWorkflow?.workflow_spec.name}
                  </h2>
                  <p
                    className="mb-0 opacity-90"
                    style={{ fontSize: "0.95rem" }}
                  >
                    {selectedWorkflow?.workflow_spec.description}
                  </p>
                </div>
                <span
                  className="badge bg-white text-primary px-3 py-2"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    borderRadius: "20px",
                  }}
                >
                  <i
                    className="bi bi-circle-fill me-1"
                    style={{ fontSize: "0.5rem" }}
                  ></i>
                  Active
                </span>
              </div>

              {/* User Info */}
              <div className="border-top border-white border-opacity-25 pt-3 mt-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <i
                        className="bi bi-person-fill"
                        style={{ fontSize: "1.2rem" }}
                      ></i>
                    </div>
                    <div>
                      <small
                        className="d-block opacity-75"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Logged in as
                      </small>
                      <strong style={{ fontSize: "0.95rem" }}>
                        {currentUser ? currentUser.name : "User"}
                      </strong>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="badge bg-dark bg-opacity-20 px-3 py-2"
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        borderRadius: "20px",
                      }}
                    >
                      {currentUser?.role}
                    </span>
                    <select
                      className="form-select form-select-sm border-0 bg-dark bg-opacity-20 text-white"
                      value={currentUser?.role || ""}
                      onChange={(e) =>
                        currentUser &&
                        setCurrentUser({ ...currentUser, role: e.target.value })
                      }
                      style={{
                        width: "auto",
                        minWidth: "120px",
                        borderRadius: "20px",
                        fontWeight: "500",
                      }}
                    >
                      {availableRoles.map((r) => (
                        <option key={r} value={r} style={{ color: "#fff" }}>
                          {r.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Current Form */}
          {currentUser?.role !== "admin" && currentNode && (
            <div
              className="card border-0 shadow-lg"
              style={{ borderRadius: "16px", overflow: "hidden" }}
            >
              <div
                className="card-header border-0 py-4 px-4"
                style={{
                  background:
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                }}
              >
                <h4 className="card-title mb-0 fw-bold text-white d-flex align-items-center">
                  <div
                    className="bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </div>
                  {currentNode.label}
                </h4>
              </div>
              <div className="card-body p-4" style={{ background: "#ffffff" }}>
                <form>
                  {currentNode.inputs?.map((input: any, inputIdx: number) =>
                    input.fields?.map((field: any, fieldIdx: number) => (
                      <div
                        key={field.name}
                        className="mb-4 p-3 rounded-3"
                        style={{
                          background:
                            fieldIdx % 2 === 0 ? "#f8f9fa" : "transparent",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <label
                          className="form-label fw-semibold d-flex align-items-center mb-3"
                          style={{ color: "#2d3748", fontSize: "0.95rem" }}
                        >
                          <span
                            className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{
                              width: "24px",
                              height: "24px",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                            }}
                          >
                            {fieldIdx + 1}
                          </span>

                          {field.name
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c: any) => c.toUpperCase())}

                          {field.required && canWriteField(field) && (
                            <span
                              className="text-danger ms-1"
                              style={{ fontSize: "1.1rem" }}
                            >
                              *
                            </span>
                          )}
                        </label>

                        {renderFormField(field)}
                      </div>
                    ))
                  )}

                  {currentNode.id !== "__end__" && (
                    <div className="text-end mt-4 pt-3 border-top">
                      <button
                        type="button"
                        className="btn btn-lg px-5 py-3 border-0 text-white fw-semibold shadow-lg"
                        onClick={handleProgressWorkflow}
                        style={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          borderRadius: "30px",
                          transition: "all 0.3s ease",
                          fontSize: "1rem",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 20px rgba(102, 126, 234, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0,0,0,0.15)";
                        }}
                      >
                        Continue
                        <i className="bi bi-arrow-right ms-2"></i>
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* Admin message */}
          {currentUser?.role === "admin" && (
            <div
              className="alert border-0 shadow-lg"
              role="alert"
              style={{
                background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                borderRadius: "16px",
              }}
            >
              <h5
                className="alert-heading fw-bold d-flex align-items-center"
                style={{ color: "#8b4513" }}
              >
                <i
                  className="bi bi-shield-check me-2"
                  style={{ fontSize: "1.5rem" }}
                ></i>
                Admin View
              </h5>
              <p className="mb-0" style={{ color: "#8b4513" }}>
                You are viewing this workflow as an administrator.
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Right Column - Workflow History */}
        <div className="col-lg-5 col-xl-4">
          <div className="position-sticky" style={{ top: "20px" }}>
            <div className="mb-4 d-flex align-items-center gap-3">
              <div
                className="bg-white rounded-circle shadow-lg d-flex align-items-center justify-content-center"
                style={{ width: "50px", height: "50px" }}
              >
                <i
                  className="bi bi-clock-history text-primary"
                  style={{ fontSize: "1.5rem" }}
                ></i>
              </div>
              <div>
                <h4 className="fw-bold mb-0" style={{ color: "#2d3748" }}>
                  Workflow History
                </h4>
                <small className="text-muted">Track all completed steps</small>
              </div>
            </div>

            <div
              style={{
                maxHeight: "calc(100vh - 200px)",
                overflowY: "auto",
                paddingRight: "10px",
              }}
              className="custom-scrollbar"
            >
              <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #cbd5e0;
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #a0aec0;
                }
              `}</style>

              {sortedFinalHistory.reverse().map((item, index) => {
                const { node_id, created_at, values, metadata } = item;
                const stepFormData =
                  values?.form || values.status || values || {};
                if (!stepFormData) return null;

                return (
                  <div
                    key={node_id}
                    className="card border-0 shadow-sm mb-3 position-relative"
                    style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(-5px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 20px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.08)";
                    }}
                  >
                    {/* Timeline connector */}
                    {index < sortedFinalHistory.length - 1 && (
                      <div
                        style={{
                          position: "absolute",
                          left: "20px",
                          top: "60px",
                          bottom: "-24px",
                          width: "2px",

                          zIndex: 0,
                        }}
                      />
                    )}

                    <div
                      className="card-header border-0 py-3 px-4"
                      style={{
                        background:
                          "linear-gradient(135deg, #e0e7ff 0%, #cffafe 100%)",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                          <span
                            className="badge text-white shadow-sm d-flex align-items-center justify-content-center fw-bold"
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "12px",
                              background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              fontSize: "0.9rem",
                            }}
                          >
                            {sortedFinalHistory.length - index}
                          </span>
                          <div>
                            <strong
                              style={{ color: "#2d3748", fontSize: "0.95rem" }}
                            >
                              {node_id}
                            </strong>
                            <small
                              className="d-block text-muted"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {new Date(created_at).toLocaleString()}
                            </small>
                          </div>
                        </div>
                        {metadata.user_id.user_id && (
                          <span
                            className="badge bg-white text-primary px-2 py-1"
                            style={{ fontSize: "0.75rem", borderRadius: "8px" }}
                          >
                            {metadata.user_id.user_id}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="card-body p-4"
                      style={{ background: "#ffffff" }}
                    >
                      {Object.entries(stepFormData).map(([key, value]) => {
                        const renderValue = (val: any): React.ReactNode => {
                          console.log(
                            "Rendering key:",
                            key,
                            "with value:",
                            value
                          );
                          if (val === null || val === undefined)
                            return (
                              <span className="text-muted fst-italic">
                                Not provided
                              </span>
                            );
                          if (typeof val === "string") {
                            return <span>{val}</span>;
                          }
                          if (Array.isArray(val))
                            return (
                              <ul className="mb-0 ps-3">
                                {val.map((v, i) => (
                                  <li key={i}>{renderValue(v)}</li>
                                ))}
                              </ul>
                            );

                          if (typeof val === "object")
                            return (
                              <div className="ms-3 mt-2">
                                {Object.entries(val).map(([k, v]) => (
                                  <div
                                    key={k}
                                    className="mb-2 p-2 rounded-3"
                                    style={{ background: "#f8f9fa" }}
                                  >
                                    <span className="fw-semibold text-capitalize text-primary">
                                      {k}:
                                    </span>{" "}
                                    {renderValue(v)}
                                  </div>
                                ))}
                              </div>
                            );

                          if (
                            typeof val === "string" &&
                            val.startsWith("file")
                          ) {
                            const fileId = val.replace("file", "");
                            const handleDownload = async () => {
                              try {
                                const response = await fetch(
                                  `http://localhost:8085/api/documents/${fileId}/download?dmsRole=admin&userId=${
                                    currentUser ? currentUser.id : "1234"
                                  }`
                                );
                                if (!response.ok)
                                  throw new Error("Failed to download");
                                const blob = await response.blob();
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = "Document_" + fileId;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                URL.revokeObjectURL(url);
                              } catch {
                                alert("Failed to download the file.");
                              }
                            };
                            return (
                              <div className="d-flex align-items-center gap-2">
                                <button
                                  className="btn btn-sm btn-primary px-3 py-2 border-0 shadow-sm"
                                  onClick={handleDownload}
                                  style={{
                                    borderRadius: "20px",
                                    fontSize: "0.85rem",
                                    fontWeight: "500",
                                  }}
                                >
                                  <i className="bi bi-download me-1"></i>
                                  Download
                                </button>
                              </div>
                            );
                          }

                          return <span>{String(val)}</span>;
                        };

                        return (
                          <div key={key} className="mb-3 pb-3 border-bottom">
                            <div className="row align-items-start">
                              <div className="col-md-4">
                                <span
                                  className="text-secondary fw-semibold text-capitalize d-block"
                                  style={{ fontSize: "0.85rem" }}
                                >
                                  {key.replace(/_/g, " ")}
                                </span>
                              </div>
                              <div
                                className="col-md-8"
                                style={{ fontSize: "0.9rem" }}
                              >
                                {renderValue(value)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowForm;
