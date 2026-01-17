import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import api from '../services/api';

export default function VendorManagement() {
    let emptyVendor = {
        name: '',
        company: '',
        email: '',
        phone: ''
    };

    const [vendors, setVendors] = useState(null);
    const [vendorDialog, setVendorDialog] = useState(false);
    const [vendor, setVendor] = useState(emptyVendor);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef(null);

    useEffect(() => {
        loadVendors();
    }, []);

    const loadVendors = async () => {
        const res = await api.get('/vendors');
        setVendors(res.data);
    };

    const openNew = () => {
        setVendor(emptyVendor);
        setSubmitted(false);
        setVendorDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setVendorDialog(false);
    };

    const saveVendor = async () => {
        setSubmitted(true);

        if (vendor.name.trim()) {
            let _vendors = [...vendors];
            let _vendor = { ...vendor };

            try {
                if (vendor._id) {
                    const res = await api.put(`/vendors/${vendor._id}`, _vendor);
                    const index = findIndexById(vendor._id);
                    _vendors[index] = res.data;
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Vendor Updated', life: 3000 });
                } else {
                    const res = await api.post('/vendors', _vendor);
                    _vendors.push(res.data);
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Vendor Created', life: 3000 });
                }

                setVendors(_vendors);
                setVendorDialog(false);
                setVendor(emptyVendor);
            } catch (e) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to save vendor', life: 3000 });
            }
        }
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _vendor = { ...vendor };
        _vendor[name] = val;
        setVendor(_vendor);
    };

    const editVendor = (vendor) => {
        setVendor({ ...vendor });
        setVendorDialog(true);
    };

    const confirmDeleteVendor = (vendor) => {
        if (confirm(`Are you sure you want to delete ${vendor.name}?`)) {
            deleteVendor(vendor);
        }
    };

    const deleteVendor = async (vendor) => {
        try {
            await api.delete(`/vendors/${vendor._id}`);
            let _vendors = vendors.filter((val) => val._id !== vendor._id);
            setVendors(_vendors);
            toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Vendor Deleted', life: 3000 });
        } catch (e) {
             toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error Deleting Vendor', life: 3000 });
        }
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < vendors.length; i++) {
            if (vendors[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded text severity="success" className="mr-2" onClick={() => editVendor(rowData)} />
                <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => confirmDeleteVendor(rowData)} />
            </React.Fragment>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="New Vendor" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

                <DataTable value={vendors} dataKey="_id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} vendors">
                    <Column field="name" header="Name" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="company" header="Company" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="email" header="Email" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="phone" header="Phone" style={{ minWidth: '10rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={vendorDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Vendor Details" modal className="p-fluid" footer={
                <React.Fragment>
                    <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
                    <Button label="Save" icon="pi pi-check" onClick={saveVendor} />
                </React.Fragment>
            } onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="name" className="font-bold">Name</label>
                    <InputText id="name" value={vendor.name} onChange={(e) => onInputChange(e, 'name')} required autoFocus className={classNames({ 'p-invalid': submitted && !vendor.name })} />
                    {submitted && !vendor.name && <small className="p-error">Name is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="company" className="font-bold">Company</label>
                    <InputText id="company" value={vendor.company} onChange={(e) => onInputChange(e, 'company')} required className={classNames({ 'p-invalid': submitted && !vendor.company })} />
                </div>
                 <div className="field">
                    <label htmlFor="email" className="font-bold">Email</label>
                    <InputText id="email" value={vendor.email} onChange={(e) => onInputChange(e, 'email')} required />
                </div>
                 <div className="field">
                    <label htmlFor="phone" className="font-bold">Phone</label>
                    <InputText id="phone" value={vendor.phone} onChange={(e) => onInputChange(e, 'phone')} />
                </div>
            </Dialog>
        </div>
    );
}
