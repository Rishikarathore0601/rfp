import React, { useState } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { ProgressBar } from 'primereact/progressbar';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag'; // Added missing Tag import
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react'; // Added useEffect import

export default function CreateRFP() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [rfp, setRfp] = useState(null);
  const [error, setError] = useState(null);
  const loadingMessages = [
    "Receiving requirements...",
    "AI is brainstorming RFP structure...",
    "Extracting items and quantities...",
    "Estimating budget and timelines...",
    "Finalizing structured JSON...",
    "Validating RFP details..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2000); // Faster updates for better feel
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const generateRFP = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    setRfp(null); // Clear previous results
    try {
      const response = await api.post('/rfps/ai-generate', { description });
      setRfp(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to generate RFP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const header = (
      <div className="flex align-items-center gap-2">
          <i className="pi pi-sparkles text-primary text-2xl" />
          <span className="font-bold text-lg">AI RFP Generator</span>
      </div>
  );

  return (
    <div className="grid">
      <div className="col-12 lg:col-6">
        <Card title={header} className="h-full">
            <div className="field">
                <label htmlFor="description" className="font-medium text-lg block mb-2">Describe your procurement needs</label>
                <InputTextarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    rows={8} 
                    className="w-full" 
                    placeholder="E.g., I need 20 laptops with 16GB RAM, budget $30,000, delivery within 2 weeks..." 
                />
            </div>
            
            {error && <Message severity="error" text={error} className="w-full mb-3" />}
            
            <div className="flex justify-content-end">
                <Button 
                    label={loading ? 'Generating...' : 'Generate with AI'} 
                    icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-bolt'} 
                    onClick={generateRFP} 
                    disabled={loading || !description}
                />
            </div>
            
            {loading && (
                <div className="mt-4 text-center p-3 surface-100 border-round">
                    <ProgressBar mode="indeterminate" style={{ height: '8px' }} className="mb-3" />
                    <div className="flex align-items-center justify-content-center gap-2">
                        <i className="pi pi-cog pi-spin text-primary" />
                        <span className="text-primary font-bold">{loadingMessages[loadingStep]}</span>
                    </div>
                </div>
            )}
        </Card>
      </div>

      <div className="col-12 lg:col-6">
        {rfp ? (
             <Panel header="Generated RFP Preview" toggleable>
                <div className="mb-3">
                    <span className="font-bold block mb-1">Title:</span>
                    <span>{rfp.structuredData.title}</span>
                </div>
                <div className="mb-3">
                    <span className="font-bold block mb-1">Summary:</span>
                    <p className="m-0 text-600">{rfp.structuredData.summary}</p>
                </div>
                <div className="flex gap-4 mb-3">
                    <div>
                        <span className="font-bold block mb-1">Budget:</span>
                        <Tag severity="success" value={`${rfp.structuredData.currency} ${rfp.structuredData.budget}`} />
                    </div>
                    <div>
                        <span className="font-bold block mb-1">Delivery:</span>
                        <Tag severity="info" value={`${rfp.structuredData.delivery_days} days`} />
                    </div>
                </div>
                
                <h4 className="mb-2">Items</h4>
                <ul className="list-none p-0 m-0">
                    {rfp.structuredData.items.map((item, i) => (
                        <li key={i} className="p-3 border-round bg-gray-50 mb-2 flex justify-content-between align-items-center">
                            <div>
                                <div className="font-bold">{item.name}</div>
                                <small className="text-600">{item.specs}</small>
                            </div>
                            <Tag value={`Qty: ${item.quantity}`} />
                        </li>
                    ))}
                </ul>

                <div className="mt-4 flex justify-content-end gap-2">
                    <Button label="Save & Continue" icon="pi pi-check" onClick={() => navigate('/')} />
                </div>
             </Panel>
        ) : (
            <div className="h-full flex align-items-center justify-content-center border-2 border-dashed border-300 border-round p-5 text-center text-500">
                <div>
                    <i className="pi pi-file text-5xl mb-3"></i>
                    <p className="text-xl m-0">Generated RFP will appear here</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
