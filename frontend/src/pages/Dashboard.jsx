import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRfps();
  }, []);

  const loadRfps = async () => {
    try {
      const response = await api.get('/rfps');
      setRfps(response.data);
    } catch (error) {
      console.error('Failed to load RFPs', error);
    } finally {
      setLoading(false);
    }
  };

  const statusBodyTemplate = (rowData) => {
    const severity = rowData.status === 'CLOSED' ? 'danger' : rowData. status === 'SENT' ? 'success' : 'warning';
    return <Tag value={rowData.status} severity={severity} />;
  };

  const deleteRfp = async (id) => {
    if (confirm('Are you sure you want to delete this RFP?')) {
        try {
            await api.delete(`/rfps/${id}`);
            loadRfps();
        } catch (e) {
            console.error(e);
        }
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
        <React.Fragment>
            <Button icon="pi pi-eye" rounded text severity="info" aria-label="View" onClick={() => navigate(`/rfp/${rowData._id}`)} />
            <Button icon="pi pi-trash" rounded text severity="danger" aria-label="Delete" onClick={() => deleteRfp(rowData._id)} />
        </React.Fragment>
    );
  };

  const header = (
      <div className="flex flex-wrap align-items-center justify-content-between gap-2">
          <span className="text-xl text-900 font-bold">Requests for Proposal</span>
          <Button icon="pi pi-refresh" rounded raised onClick={loadRfps} />
      </div>
  );

  return (
    <div className="card">
        <DataTable value={rfps} header={header} loading={loading} tableStyle={{ minWidth: '50rem' }} stripedRows paginator rows={10}>
            <Column field="title" header="Title" sortable></Column>
            <Column field="structuredData.budget" header="Budget" sortable body={(row) => `${row.structuredData?.currency || '$'} ${row.structuredData?.budget || 0}`}></Column>
            <Column field="createdAt" header="Created" sortable body={(row) => new Date(row.createdAt).toLocaleDateString()}></Column>
            <Column field="status" header="Status" body={statusBodyTemplate} sortable></Column>
            <Column header="Actions" body={actionBodyTemplate}></Column>
        </DataTable>
    </div>
  );
}
