import React from 'react';
import { TableColumn } from '../types';
import './DataTable.css';

interface DataTableProps {
  title: string;
  columns: TableColumn[];
  data: any[];
  className?: string;
}

const DataTable: React.FC<DataTableProps> = ({ title, columns, data, className = '' }) => {
  const count = data ? data.length : 0;
  
  return (
    <div className={`data-table-container ${className}`}>
      <h3 className="table-title">
        <span className="table-title-text">{title}</span>
        <span className="table-count">{count}</span>
      </h3>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="table-header">
                  <div className="header-content">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="sort-icons">
                        <span className="sort-icon">▲</span>
                        <span className="sort-icon">▼</span>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                {columns.map((column) => (
                  <td key={column.key} className="table-cell">
                    {Array.isArray(row[column.key]) 
                      ? row[column.key].join(', ') 
                      : row[column.key] || '-'
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;