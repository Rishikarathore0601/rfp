import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Rating } from 'primereact/rating';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import api from '../services/api';

export default function Comparison() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadComparison();
  }, [id]);

  const loadComparison = async () => {
    try {
        const res = await api.get(`/comparison/${id}`);
        setData(res.data);
    } catch (e) { console.error(e); }
  };

  if (!data) return (
    <div className="text-center p-8">
        <ProgressBar mode="indeterminate" style={{ height: '6px' }} className="mb-4" />
        <h3 className="text-primary animate-pulse">🤖 AI Advisor is analyzing proposals...</h3>
        <p className="text-500 italic">Calculating scores and determining the best value for you.</p>
    </div>
  );

  const { recommendation, proposals, rfp } = data;

  const scoreBody = (rowData) => {
      // rowData is a proposal with scores
      return <div className="font-bold text-lg">{rowData.totalScore} <span className="text-500 text-sm">/ 100</span></div>;
  };

  const deliveryBody = (rowData) => <div>{rowData.parsedData.deliveryDays} Days</div>;
  const priceBody = (rowData) => <div>{rowData.parsedData.currency} {rowData.parsedData.totalPrice}</div>;

  return (
    <div className="grid">
        <div className="col-12 mb-4">
            <Button label="Back to RFP" icon="pi pi-arrow-left" text onClick={() => navigate(`/rfp/${id}`)} />
            <h2 className="mt-2">Proposal Comparison: {rfp.title}</h2>
        </div>

        {/* AI Recommendation Section */}
        <div className="col-12 lg:col-5">
            <Card title="🤖 AI Recommendation" className="h-full bg-primary-50">
                <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-primary mb-2">{recommendation.recommendedVendor}</div>
                    <Tag severity="success" value="Best Option" icon="pi pi-check" />
                </div>
                
                <Panel header="Reasoning" className="mb-3">
                    <p className="m-0 line-height-3">{recommendation.reasoning}</p>
                </Panel>

                <div className="grid">
                    <div className="col-6">
                        <h4 className="text-green-600 mb-2">Pros</h4>
                        <ul className="pl-3 mt-0">
                            {recommendation.pros.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                    </div>
                    <div className="col-6">
                         <h4 className="text-orange-600 mb-2">Cons</h4>
                         <ul className="pl-3 mt-0">
                            {recommendation.cons && recommendation.cons.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                    </div>
                </div>

                {recommendation.alternativeOption && (
                    <div className="mt-3 p-3 surface-card border-round">
                        <span className="font-bold text-600">Alternative:</span> {recommendation.alternativeOption}
                    </div>
                )}
            </Card>
        </div>

        {/* Comparison Table */}
        <div className="col-12 lg:col-7">
             <Card title="Scorecard" className="h-full">
                <DataTable value={proposals} sortField="totalScore" sortOrder={-1} stripedRows>
                    <Column field="vendor.name" header="Vendor"></Column>
                    <Column field="parsedData.totalPrice" header="Price" body={priceBody} sortable></Column>
                    <Column field="parsedData.deliveryDays" header="Delivery" body={deliveryBody} sortable></Column>
                    <Column field="totalScore" header="Score" body={scoreBody} sortable></Column>
                </DataTable>

                <div className="mt-4">
                    <h4>Scoring Breakdown</h4>
                    {proposals.map((p, i) => (
                        <div key={i} className="mb-3">
                            <div className="flex justify-content-between mb-1">
                                <span className="font-bold">{p.vendor.company}</span>
                                <span>{p.totalScore}%</span>
                            </div>
                            <ProgressBar value={p.totalScore} showValue={false} style={{ height: '10px' }} color={i === 0 ? 'var(--green-500)' : 'var(--blue-500)'} />
                            <div className="flex gap-3 text-sm text-600 mt-1">
                                <span>Price: {p.scores.priceScore}/40</span>
                                <span>Delivery: {p.scores.deliveryScore}/30</span>
                                <span>Completeness: {p.scores.completenessScore}/30</span>
                            </div>
                        </div>
                    ))}
                </div>
             </Card>
        </div>
    </div>
  );
}
