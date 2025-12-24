import { AgGridReact } from "ag-grid-react"; // AG Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import React, { useCallback, useEffect, useState } from "react";
const ApiExample = () => {
  const [data, setData] = useState();

  useEffect(() => {
    return async () => {
      await fetch("https://dummyjson.com/products")
        .then((res) => res.json())
        .then((res) => setData(res.products));
    };
  }, []);

  const onRowSelected = useCallback((event) => {
    // window.alert(
    //   "row " +
    //     event.node.data.brand +
    //     " selected = " +
    //     event.node.isSelected()
    // );
    console.log(event.data);
  }, []);

  const onSelectionChanged = useCallback((event) => {
    var rowCount = event.api.getSelectedNodes().length;
    window.alert("selection changed, " + rowCount + " rows selected");
  }, []);

  const [columnDefs, setColumnDefs] = useState([
    {
      field: "id",
    },
    {
      field: "brand",
    },
    {
      field: "category",
    },
    {
      field: "description",
      flex: 4,
    },
  ]);

  return (
    <div
      className="ag-theme-quartz"
      style={{ width: "100%", height: "310px", marginBottom: "100px" }}
    >
      <h1>Api Example</h1>
      <AgGridReact
        rowData={data}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={[20]}
        // paginationPageSizeSelector={false}
        rowSelection="multiple"
        onRowSelected={onRowSelected}
        onSelectionChanged={onSelectionChanged}
      />
    </div>
  );
};

export default ApiExample;
