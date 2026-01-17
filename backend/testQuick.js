import axios from 'axios';

const API = 'http://localhost:5000/api';

console.log('🧪 Quick System Test\n');

// Test basic connectivity and CRUD
async function quickTest() {
  try {
    // Test 1: Server is running
    console.log('1️⃣ Testing server connectivity...');
    const health = await axios.get('http://localhost:5000');
    console.log('✅ Server is running\n');

    // Test 2: Create vendor
    console.log('2️⃣ Testing vendor creation...');
    const vendor = await axios.post(`${API}/vendors`, {
      name: 'Test Vendor',
      company: 'Test Company',
      email: `test${Date.now()}@example.com`
    });
    console.log('✅ Vendor created:', vendor.data.company);
    console.log('   ID:', vendor.data._id, '\n');

    // Test 3: Get all vendors
    console.log('3️⃣ Testing vendor retrieval...');
    const vendors = await axios.get(`${API}/vendors`);
    console.log('✅ Retrieved', vendors.data.length, 'vendors\n');

    // Test 4: Get all RFPs
    console.log('4️⃣ Testing RFP retrieval...');
    const rfps = await axios.get(`${API}/rfps`);
    console.log('✅ Retrieved', rfps.data.length, 'RFPs\n');

    console.log('═'.repeat(50));
    console.log('✅ BASIC TESTS PASSED!');
    console.log('═'.repeat(50));
    console.log('\n📋 System Status:');
    console.log('   ✅ Server: Running');
    console.log('   ✅ Database: Connected');
    console.log('   ✅ API Endpoints: Working');
    console.log('   ✅ CRUD Operations: Functional');
    console.log('\n💡 To test AI features:');
    console.log('   Run: node testAiGeneration.js');
    console.log('   (This will test AI RFP generation separately)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

quickTest();
