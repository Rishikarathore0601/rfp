import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { Panel } from 'primereact/panel';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { SplitButton } from 'primereact/splitbutton'; // New import
import api from '../services/api';

export default function RfpDetail() {
  const { id } = useParams();
  const [rfp, setRfp] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [vendors, setVendors] = useState([]); // All vendors for selection
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [emailDialog, setEmailDialog] = useState(false);
  
  // Manual Proposal State
  const [proposalDialog, setProposalDialog] = useState(false);
  const [selectedProposalVendor, setSelectedProposalVendor] = useState(null);
  const [proposalData, setProposalData] = useState({
      totalPrice: 0,
      deliveryDays: 0,
      paymentTerms: 'Net 30',
      warranty: '1 Year',
      itemPrices: [],
      notes: ''
  });

  const toast = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRfp();
    loadProposals();
    loadAllVendors();
  }, [id]);

  const loadRfp = async () => {
    try {
        const res = await api.get(`/rfps/${id}`);
        setRfp(res.data);
    } catch (e) { console.error(e); }
  };

  const loadProposals = async () => {
    try {
        const res = await api.get(`/proposals/rfp/${id}`);
        setProposals(res.data);
    } catch (e) { console.error(e); }
  };
  
  const loadAllVendors = async () => {
      try {
          const res = await api.get('/vendors');
          setVendors(res.data);
      } catch (e) { console.error(e); }
  };

  const sendEmail = async () => {
      try {
          const vendorIds = selectedVendors.map(v => v._id);
          await api.post('/email/send-rfp', { rfpId: id, vendorIds });
          toast.current.show({ severity: 'success', summary: 'Sent', detail: 'RFP sent to vendors' });
          setEmailDialog(false);
          loadRfp(); 
      } catch (e) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to send email' });
      }
  };

  const checkInbox = async () => {
      try {
          toast.current.show({ severity: 'info', summary: 'Checking Inbox', detail: 'Scanning for proposals...', life: 4000 });
          const res = await api.post('/email/check');
          if (res.data.processed > 0) {
            toast.current.show({ severity: 'success', summary: 'Synced', detail: `Found ${res.data.processed} proposals!` });
            loadProposals();
            loadAllVendors();
          } else {
             toast.current.show({ severity: 'info', summary: 'Synced', detail: 'No new proposals found.' });
          }
      } catch (e) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to check inbox' });
      }
  };

  const openProposalDialog = () => {
      setProposalData({
          totalPrice: 0,
          deliveryDays: 0,
          paymentTerms: 'Net 30',
          warranty: '1 Year',
          itemPrices: [],
          notes: ''
      });
      setSelectedProposalVendor(null);
      setProposalDialog(true);
  };

  const saveProposal = async () => {
      if (!selectedProposalVendor) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: 'Select a vendor' });
          return;
      }
      
      try {
          // Construct payload mimicking parsed email data
          const payload = {
              rfpId: id,
              vendorId: selectedProposalVendor._id,
              emailSubject: `Manual Proposal Entry - ${selectedProposalVendor.company}`,
              emailBody: proposalData.notes || 'Manually entered proposal',
              parsedData: {
                  totalPrice: proposalData.totalPrice,
                  currency: rfp.structuredData.currency || 'USD',
                  deliveryDays: proposalData.deliveryDays,
                  paymentTerms: proposalData.paymentTerms,
                  warranty: proposalData.warranty,
                  itemPrices: [], // Skipping detailed item prices for simple manual entry
                  additionalNotes: proposalData.notes
              }
          };

          await api.post('/proposals', payload);
          toast.current.show({ severity: 'success', summary: 'Saved', detail: 'Proposal added successfully' });
          setProposalDialog(false);
          loadProposals();
      } catch (e) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to save proposal' });
      }
  };

  if (!rfp) return <div>Loading...</div>;

  return (
    <div className="grid">
        <Toast ref={toast} />
        <div className="col-12">
            <div className="flex justify-content-between align-items-center mb-4">
                <Button label="Back" icon="pi pi-arrow-left" text onClick={() => navigate('/')} />
                <div className="flex gap-2">
                    <Button label="Compare Proposals" icon="pi pi-chart-bar" severity="help" onClick={() => navigate(`/comparison/${id}`)} disabled={proposals.length === 0} />
                    <Button label="Sync Emails" icon="pi pi-refresh" severity="warning" onClick={checkInbox} tooltip="Check Gmail for new proposals" />
                    <Button label="Add Proposal" icon="pi pi-plus" severity="success" onClick={openProposalDialog} />
                    <Button label="Send to Vendors" icon="pi pi-send" onClick={() => setEmailDialog(true)} />
                </div>
            </div>

            <Card title={rfp.title} subTitle={rfp.status} className="mb-4">
                <div className="grid">
                    <div className="col-12 mb-2">
                        <Tag value={`Ref ID: ${rfp.referenceId}`} severity="info" icon="pi pi-hashtag" />
                    </div>
                    <div className="col-6">
                        <strong>Budget:</strong> {rfp.structuredData.currency} {rfp.structuredData.budget}
                    </div>
                    <div className="col-6">
                         <strong>Delivery Expected:</strong> {rfp.structuredData.delivery_days} days
                    </div>
                </div>
            </Card>

            <TabView>
                <TabPanel header="Items">
                    <DataTable value={rfp.structuredData.items}>
                        <Column field="name" header="Item"></Column>
                        <Column field="quantity" header="Quantity"></Column>
                        <Column field="specs" header="Specs"></Column>
                    </DataTable>
                </TabPanel>
                <TabPanel header="Proposals Received">
                    <DataTable value={proposals} emptyMessage="No proposals received yet.">
                        <Column field="vendor.company" header="Vendor"></Column>
                        <Column field="parsedData.totalPrice" header="Price" body={(r) => `${r.parsedData.currency} ${r.parsedData.totalPrice}`}></Column>
                        <Column field="parsedData.deliveryDays" header="Delivery (Days)"></Column>
                        <Column field="parsedData.warranty" header="Warranty"></Column>
                         <Column field="aiConfidence" header="Source" body={(r) => r.aiExtracted ? <Tag value="AI Parsed" severity="info" /> : <Tag value="Manual" severity="success" />}></Column>
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>

        {/* Email Dialog */}
        <Dialog header="Select Vendors" visible={emailDialog} style={{ width: '50vw' }} onHide={() => setEmailDialog(false)} footer={
            <Button label="Send" icon="pi pi-send" onClick={sendEmail} />
        }>
            <div className="field">
                <label className="block mb-2">Choose Vendors to Receive RFP</label>
                <MultiSelect value={selectedVendors} options={vendors} onChange={(e) => setSelectedVendors(e.value)} optionLabel="company" placeholder="Select Vendors" display="chip" className="w-full" />
            </div>
        </Dialog>
        
        {/* Manual Proposal Dialog */}
        <Dialog header="Add Manual Proposal" visible={proposalDialog} style={{ width: '30vw' }} onHide={() => setProposalDialog(false)} footer={
            <Button label="Save Proposal" icon="pi pi-check" onClick={saveProposal} />
        }>
             <div className="field mb-3">
                <label className="block mb-2">Vendor</label>
                <Dropdown value={selectedProposalVendor} options={vendors} onChange={(e) => setSelectedProposalVendor(e.value)} optionLabel="company" placeholder="Select Vendor" className="w-full" />
            </div>
            
            <div className="field mb-3">
                <label className="block mb-2">Total Price</label>
                <InputNumber value={proposalData.totalPrice} onValueChange={(e) => setProposalData({...proposalData, totalPrice: e.value})} mode="currency" currency="USD" locale="en-US" className="w-full" />
            </div>
            
            <div className="field mb-3">
                <label className="block mb-2">Delivery Time (Days)</label>
                <InputNumber value={proposalData.deliveryDays} onValueChange={(e) => setProposalData({...proposalData, deliveryDays: e.value})} className="w-full" />
            </div>
            
             <div className="field mb-3">
                <label className="block mb-2">Warranty</label>
                <InputText value={proposalData.warranty} onChange={(e) => setProposalData({...proposalData, warranty: e.target.value})} className="w-full" />
            </div>
            
             <div className="field mb-3">
                <label className="block mb-2">Notes</label>
                <InputTextarea value={proposalData.notes} onChange={(e) => setProposalData({...proposalData, notes: e.target.value})} rows={3} className="w-full" />
            </div>
        </Dialog>
    </div>
  );
}
