import axios from 'axios';

const testRfpGeneration = async () => {
  try {
    console.log('🧪 Testing AI RFP Generation...\n');
    
    const response = await axios.post('http://localhost:5000/api/rfps/ai-generate', {
      description: 'I need 50 laptops with 16GB RAM and 512GB SSD, budget $75000, delivery in 45 days, payment terms Net 30, 1 year warranty'
    });
    
    console.log('✅ SUCCESS!');
    console.log('\n📄 Generated RFP:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ FAILED:', error.response?.data || error.message);
  }
};

testRfpGeneration();
