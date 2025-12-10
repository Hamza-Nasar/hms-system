"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface PatientsTableProps {
    rows: any[];
    columns: GridColDef[];
}

export default function PatientsTable({ rows, columns }: PatientsTableProps) {
    return (
        <div style={{ height: 500, width: "100%" }}>
            <DataGrid rows={rows} columns={columns} />
        </div>
    );
}
