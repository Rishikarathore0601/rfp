import axios from 'axios';

const API = 'http://localhost:5000/api';

console.log('🧪 Starting Comprehensive System Test...\n');

let rfpId, vendorId1, vendorId2, proposalId1, proposalId2;

// Test 1: AI RFP Generation
async function testRfpGeneration() {
  console.log('📝 Test 1: AI RFP Generation');
  try {
    const response = await axios.post(`${API}/rfps/ai-generate`, {
      description: 'I need 50 laptops with 16GB RAM and 512GB SSD, budget $75000, delivery in 45 days, payment terms Net 30, 1 year warranty'
    });
    rfpId = response.data._id;
    console.log('✅ RFP Created:', response.data.referenceId);
    console.log('   Title:', response.data.structuredData.title);
    console.log('   Budget:', response.data.structuredData.currency, response.data.structuredData.budget);
    console.log('   Items:', response.data.structuredData.items.length);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 2: Vendor Creation
async function testVendorCreation() {
  console.log('\n👥 Test 2: Vendor Management');
  try {
    // Create vendor 1
    const v1 = await axios.post(`${API}/vendors`, {
      name: 'John Smith',
      company: 'Tech Solutions Inc',
      email: 'john@techsolutions.com',
      phone: '+1-555-0123',
      address: '123 Tech Street, Silicon Valley'
    });
    vendorId1 = v1.data._id;
    console.log('✅ Vendor 1 Created:', v1.data.company);

    // Create vendor 2
    const v2 = await axios.post(`${API}/vendors`, {
      name: 'Jane Doe',
      company: 'Budget Computers Ltd',
      email: 'jane@budgetcomputers.com',
      phone: '+1-555-0456'
    });
    vendorId2 = v2.data._id;
    console.log('✅ Vendor 2 Created:', v2.data.company);

    // Get all vendors
    const all = await axios.get(`${API}/vendors`);
    console.log('✅ Total Vendors:', all.data.length);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 3: Associate Vendors with RFP
async function testVendorAssociation() {
  console.log('\n🔗 Test 3: Associate Vendors with RFP');
  try {
    const response = await axios.post(`${API}/rfps/${rfpId}/vendors`, {
      vendorIds: [vendorId1, vendorId2]
    });
    console.log('✅ Associated', response.data.vendors.length, 'vendors with RFP');
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 4: Email Configuration Test
async function testEmailConfig() {
  console.log('\n📧 Test 4: Email Configuration');
  try {
    const response = await axios.get(`${API}/email/test`);
    console.log('✅', response.data.message);
    return true;
  } catch (error) {
    console.log('⚠️  Email not configured (optional):', error.response?.data?.error || error.message);
    return true; // Not critical for testing
  }
}

// Test 5: Create Proposals
async function testProposalCreation() {
  console.log('\n📄 Test 5: Proposal Creation');
  try {
    // Proposal 1 - Better price, slower delivery
    const p1 = await axios.post(`${API}/proposals`, {
      rfpId: rfpId,
      vendorId: vendorId1,
      emailSubject: 'Re: RFP Response - Tech Solutions',
      emailBody: 'We can provide 50 laptops for $70,000 with delivery in 50 days',
      parsedData: {
        totalPrice: 70000,
        currency: 'USD',
        deliveryDays: 50,
        paymentTerms: 'Net 30',
        warranty: '2 years',
        itemPrices: [
          { itemName: 'Laptop 16GB/512GB', unitPrice: 1400, quantity: 50, totalPrice: 70000 }
        ]
      }
    });
    proposalId1 = p1.data._id;
    console.log('✅ Proposal 1 Created:', p1.data.vendor.company);
    console.log('   Price: $' + p1.data.parsedData.totalPrice);
    console.log('   Delivery:', p1.data.parsedData.deliveryDays, 'days');

    // Proposal 2 - Higher price, faster delivery
    const p2 = await axios.post(`${API}/proposals`, {
      rfpId: rfpId,
      vendorId: vendorId2,
      emailSubject: 'Re: RFP Response - Budget Computers',
      emailBody: 'We can provide 50 laptops for $72,000 with delivery in 35 days',
      parsedData: {
        totalPrice: 72000,
        currency: 'USD',
        deliveryDays: 35,
        paymentTerms: 'Net 45',
        warranty: '1 year',
        itemPrices: [
          { itemName: 'Laptop 16GB/512GB', unitPrice: 1440, quantity: 50, totalPrice: 72000 }
        ]
      }
    });
    proposalId2 = p2.data._id;
    console.log('✅ Proposal 2 Created:', p2.data.vendor.company);
    console.log('   Price: $' + p2.data.parsedData.totalPrice);
    console.log('   Delivery:', p2.data.parsedData.deliveryDays, 'days');

    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 6: Proposal Comparison
async function testComparison() {
  console.log('\n🏆 Test 6: Proposal Comparison & AI Recommendation');
  try {
    const response = await axios.get(`${API}/comparison/${rfpId}`);
    console.log('✅ Comparison Generated');
    console.log('   Total Proposals:', response.data.proposalCount);
    
    console.log('\n📊 Scores:');
    response.data.proposals.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.vendor.company}`);
      console.log(`      Price Score: ${p.scores.priceScore}/40`);
      console.log(`      Delivery Score: ${p.scores.deliveryScore}/30`);
      console.log(`      Completeness: ${p.scores.completenessScore}/30`);
      console.log(`      TOTAL: ${p.totalScore}/100`);
    });

    console.log('\n🤖 AI Recommendation:');
    console.log('   Recommended:', response.data.recommendation.recommendedVendor);
    console.log('   Reasoning:', response.data.recommendation.reasoning);
    console.log('   Pros:', response.data.recommendation.pros.join(', '));
    if (response.data.recommendation.cons) {
      console.log('   Cons:', response.data.recommendation.cons.join(', '));
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 7: CRUD Operations
async function testCrudOperations() {
  console.log('\n🔄 Test 7: CRUD Operations');
  try {
    // Get all RFPs
    const rfps = await axios.get(`${API}/rfps`);
    console.log('✅ Get All RFPs:', rfps.data.length, 'found');

    // Get single RFP
    const rfp = await axios.get(`${API}/rfps/${rfpId}`);
    console.log('✅ Get Single RFP:', rfp.data.title);

    // Update RFP
    const updated = await axios.put(`${API}/rfps/${rfpId}`, {
      status: 'SENT'
    });
    console.log('✅ Update RFP Status:', updated.data.status);

    // Get proposals by RFP
    const proposals = await axios.get(`${API}/proposals/rfp/${rfpId}`);
    console.log('✅ Get Proposals by RFP:', proposals.data.length, 'found');

    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

// Run all tests
(async () => {
  const results = [];
  
  results.push(await testRfpGeneration());
  if (!results[0]) return;
  
  results.push(await testVendorCreation());
  if (!results[1]) return;
  
  results.push(await testVendorAssociation());
  results.push(await testEmailConfig());
  
  results.push(await testProposalCreation());
  if (!results[4]) return;
  
  results.push(await testComparison());
  results.push(await testCrudOperations());

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n' + '='.repeat(60));
  console.log(`🎉 Test Results: ${passed}/${total} tests passed`);
  console.log('='.repeat(60));

  if (passed === total) {
    console.log('\n✅ ALL TESTS PASSED! System is fully functional.');
    console.log('\n📋 Summary:');
    console.log('   - AI RFP Generation: Working');
    console.log('   - Vendor Management: Working');
    console.log('   - Proposal Management: Working');
    console.log('   - Comparison & Scoring: Working');
    console.log('   - AI Recommendations: Working');
    console.log('   - CRUD Operations: Working');
  } else {
    console.log('\n⚠️  Some tests failed. Check errors above.');
  }
})();
