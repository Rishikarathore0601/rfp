import axios from 'axios';
import fs from 'fs';

const API_URL = 'http://localhost:5000/api';

async function testPerformance() {
  console.log('🚀 Starting Performance Test...');
  console.log('-----------------------------------');

  try {
    // 1. Test RFP Generation Speed
    console.log('📝 Testing AI RFP Generation...');
    const startRfp = Date.now();
    const rfpResponse = await axios.post(`${API_URL}/rfps/ai-generate`, {
      description: 'I need 10 high-end office chairs with ergonomic support, budget $5000, deliver next week.'
    });
    const endRfp = Date.now();
    const rfpTime = (endRfp - startRfp) / 1000;
    console.log(`✅ RFP Generated in: ${rfpTime.toFixed(2)}s`);
    console.log(`📊 Structured Data: ${rfpResponse.data.structuredData.title}`);

    // Create the RFP so we can test comparison
    const createdRfp = await axios.post(`${API_URL}/rfps`, rfpResponse.data);
    const rfpId = createdRfp.data._id;

    // 2. Add some proposals (Simulated)
    console.log('\n📥 Adding Proposals...');
    const vendorResponse = await axios.get(`${API_URL}/vendors`);
    const vendors = vendorResponse.data;
    
    if (vendors.length < 2) {
        console.log('⚠️ Not enough vendors, creating mock vendors...');
        const v1 = await axios.post(`${API_URL}/vendors`, { name: 'Speedy Supply', company: 'Speedy Supply', email: 'v1@test.com' });
        const v2 = await axios.post(`${API_URL}/vendors`, { name: 'Value Hub', company: 'Value Hub', email: 'v2@test.com' });
        vendors.push(v1.data, v2.data);
    }

    await axios.post(`${API_URL}/proposals`, {
        rfpId,
        vendorId: vendors[0]._id,
        parsedData: { totalPrice: 4800, currency: 'USD', deliveryDays: 5, paymentTerms: 'Net 30', warranty: '1 Year' }
    });

    await axios.post(`${API_URL}/proposals`, {
        rfpId,
        vendorId: vendors[1]._id,
        parsedData: { totalPrice: 4200, currency: 'USD', deliveryDays: 12, paymentTerms: 'Net 30', warranty: '2 Years' }
    });

    // 3. Test Comparison & Recommendation Speed
    console.log('⚖️ Testing AI Recommendation Generation...');
    const startRec = Date.now();
    const recResponse = await axios.get(`${API_URL}/comparison/${rfpId}`);
    const endRec = Date.now();
    const recTime = (endRec - startRec) / 1000;
    console.log(`✅ Recommendation Generated in: ${recTime.toFixed(2)}s`);
    console.log(`🤖 Recommended: ${recResponse.data.recommendation.recommendedVendor}`);

    console.log('\n-----------------------------------');
    console.log('🏆 Performance Results:');
    console.log(`   - RFP Gen: ${rfpTime.toFixed(2)}s`);
    console.log(`   - Rec Gen: ${recTime.toFixed(2)}s`);
    console.log('-----------------------------------');

  } catch (err) {
    console.error('❌ Performance test failed:', err.response?.data || err.message);
  }
}

testPerformance();
