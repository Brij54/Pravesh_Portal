import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import appContentStyles from '../../components/AppContent.module.css';
import rolesBulkUploadPageStyles from './RolesBulkUploadPage.module.css';

const RolesBulkUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validate file type (CSV, Excel, etc.)
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.type)) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid CSV or Excel file.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    setUploading(true);
    try {
      // Here you would call the actual API to upload the file
      console.log('Uploading roles file:', selectedFile.name);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate back to roles page after successful upload
      navigate('/admin/roles');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/roles');
  };

return (
    <div className={appContentStyles.rolesBulkUploadPage || rolesBulkUploadPageStyles.rolesBulkUploadPage}>
      <div className={appContentStyles.rolesBulkUploadHeader || rolesBulkUploadPageStyles.rolesBulkUploadHeader}>
        <h1 className={appContentStyles.pageTitle || rolesBulkUploadPageStyles.pageTitle}>Roles</h1>
        <div className={appContentStyles.breadcrumb || rolesBulkUploadPageStyles.breadcrumb}>
          <span className={appContentStyles.breadcrumbItem || rolesBulkUploadPageStyles.breadcrumbItem}>
            <button className={appContentStyles.breadcrumbLink || rolesBulkUploadPageStyles.breadcrumbLink} onClick={() => navigate('/admin')}>IAM</button>
          </span>
          <span className={appContentStyles.breadcrumbItem || rolesBulkUploadPageStyles.breadcrumbItem}>
            <button className={appContentStyles.breadcrumbLink || rolesBulkUploadPageStyles.breadcrumbLink} onClick={() => navigate('/admin/roles')}>Roles</button>
          </span>
          <span className={`${appContentStyles.breadcrumbItem || rolesBulkUploadPageStyles.breadcrumbItem} ${appContentStyles.active || rolesBulkUploadPageStyles.active}`}>Bulk Upload</span>
        </div>
      </div>

      <div className={appContentStyles.rolesBulkUploadContent || rolesBulkUploadPageStyles.rolesBulkUploadContent}>
        <div className={appContentStyles.uploadContainer || rolesBulkUploadPageStyles.uploadContainer}>
          <h2 className={appContentStyles.uploadTitle || rolesBulkUploadPageStyles.uploadTitle}>File Upload</h2>
          <p className={appContentStyles.uploadSubtitle || rolesBulkUploadPageStyles.uploadSubtitle}>Only CSV</p>
          
          <div
            className={`${appContentStyles.uploadArea || rolesBulkUploadPageStyles.uploadArea} ${isDragOver ? (appContentStyles.dragOver || rolesBulkUploadPageStyles.dragOver) : ''} ${selectedFile ? (appContentStyles.hasFile || rolesBulkUploadPageStyles.hasFile) : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className={appContentStyles.uploadIcon || rolesBulkUploadPageStyles.uploadIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                  stroke="#6c757d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="14,2 14,8 20,8"
                  stroke="#6c757d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="16"
                  y1="13"
                  x2="8"
                  y2="13"
                  stroke="#6c757d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="16"
                  y1="17"
                  x2="8"
                  y2="17"
                  stroke="#6c757d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="10,9 9,9 8,9"
                  stroke="#6c757d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            {selectedFile ? (
              <div className={appContentStyles.fileInfo || rolesBulkUploadPageStyles.fileInfo}>
                <p className={appContentStyles.fileName || rolesBulkUploadPageStyles.fileName}>{selectedFile.name}</p>
                <p className={appContentStyles.fileSize || rolesBulkUploadPageStyles.fileSize}>{(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            ) : (
              <>
                <p className={appContentStyles.uploadText || rolesBulkUploadPageStyles.uploadText}>Select a file or Drag here</p>
                <button
                  type="button"
                  className={`${appContentStyles.btn || rolesBulkUploadPageStyles.btn} ${appContentStyles.btnPrimary || rolesBulkUploadPageStyles.btnPrimary} ${appContentStyles.selectFileBtn || rolesBulkUploadPageStyles.selectFileBtn}`}
                  onClick={handleSelectFileClick}
                >
                  Select a file
                </button>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInputChange}
            className={appContentStyles.fileInput || rolesBulkUploadPageStyles.fileInput}
          />

          <div className={appContentStyles.uploadActions || rolesBulkUploadPageStyles.uploadActions}>
            <button
              type="button"
              className={`${appContentStyles.btn || rolesBulkUploadPageStyles.btn} ${appContentStyles.btnPrimary || rolesBulkUploadPageStyles.btnPrimary} ${appContentStyles.uploadBtn || rolesBulkUploadPageStyles.uploadBtn}`}
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              type="button"
              className={`${appContentStyles.btn || rolesBulkUploadPageStyles.btn} ${appContentStyles.btnSecondary || rolesBulkUploadPageStyles.btnSecondary}`}
              onClick={handleCancel}
              disabled={uploading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesBulkUploadPage;