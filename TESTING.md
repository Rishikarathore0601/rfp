
## 🖥️ Frontend End-to-End Test (Recommended)

The easiest way to test the full system is via the web interface.

### Step 1: Access the App
Open **http://localhost:3000** in your browser.

### Step 2: Create an RFP with AI
1. Click **"Create RFP"** in the menu.
2. Enter a natural language request:
   > "I need 20 MacBook Pros with M3 chips, 16GB RAM. Budget is $50,000. Delivery required within 14 days."
3. Click **"Generate with AI"**.
4. Wait for the AI to parse your request into structured data (Budget: 50000, Items: 20, etc.).
5. Click **"Save & Continue"**.

### Step 3: Add Vendors
1. Click **"Vendors"** in the menu.
2. Click **"New Vendor"**.
3. Create Vendor A:
   - Name: "Apple Sales"
   - Company: "Apple Enterprise"
   - Email: "sales@apple.com"
4. Create Vendor B:
   - Name: "BestBuy Rep"
   - Company: "BestBuy Business"
   - Email: "sales@bestbuy.com"

### Step 4: Add Proposals
1. Go back to **"Dashboard"** and click the **Eye Icon** (👁️) next to your new RFP.
2. Click **"Add Proposal"** (Green button).
3. **Proposal 1 (Apple)**:
   - Select "Apple Enterprise".
   - Price: $48,000
   - Delivery: 14 Days
   - Warranty: 1 Year
   - Notes: "Official manufacturer warranty."
4. **Proposal 2 (BestBuy)**:
   - Select "BestBuy Business".
   - Price: $45,000
   - Delivery: 7 Days
   - Warranty: 2 Years (AppleCare included)
   - Notes: "Immediate stock available."

### Step 5: Compare & Get AI Recommendation
1. On the RFP Detail page, click **"Compare Proposals"** (Purple button).
2. **View the Magic**:
   - **Scorecard**: BestBuy should score higher (lower price, faster delivery, better warranty).
   - **AI Recommendation**: The AI will analyze the data and explain *why* BestBuy is the better choice (e.g., "BestBuy is recommended due to 6% lower cost and 50% faster delivery...").

---

## ⚙️ Backend Test (Headless)


### 1. Test AI RFP Generation
```bash
# Using PowerShell:
$body = @{
    description = "I need 50 laptops with 16GB RAM, budget $75000, delivery in 45 days"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/rfps/ai-generate" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### 2. Get All RFPs
```bash
Invoke-WebRequest -Uri "http://localhost:5000/api/rfps" -Method GET
```

### 3. Create Vendor
```bash
$vendor = @{
    name = "John Doe"
    company = "Tech Inc"
    email = "john@tech.com"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/vendors" `
    -Method POST `
    -ContentType "application/json" `
    -Body $vendor
```

## Expected Test Results

When `testComplete.js` finishes, you should see:

```
🎉 Test Results: 7/7 tests passed

✅ ALL TESTS PASSED! System is fully functional.

📋 Summary:
   - AI RFP Generation: Working
   - Vendor Management: Working
   - Proposal Management: Working
   - Comparison & Scoring: Working
   - AI Recommendations: Working
   - CRUD Operations: Working
```

## Troubleshooting

**Test hangs on "AI RFP Generation":**
- This is normal - Ollama takes 30-60 seconds to process
- Check server logs for "🤖 AI Generation Attempt 1/3"
- If it retries, it will show attempts 2 and 3

**Connection refused:**
- Make sure backend server is running: `npm run dev`
- Check http://localhost:5000 in browser

**Ollama errors:**
- Verify Ollama is running: `ollama list`
- Check model is installed: should show `llama3:latest`
- If not: `ollama pull llama3:latest`

## What the Test Does

1. **Creates an RFP** from natural language
2. **Creates 2 vendors** (Tech Solutions Inc, Budget Computers Ltd)
3. **Associates vendors** with the RFP
4. **Tests email config** (optional)
5. **Creates 2 proposals** with different pricing/delivery
6. **Runs comparison** algorithm with AI recommendation
7. **Tests CRUD** operations (get, update, etc.)

## Success Criteria

All 7 tests should pass, demonstrating:
- ✅ AI can parse natural language into structured RFPs
- ✅ Vendor management works
- ✅ Proposals can be created and stored
- ✅ Comparison algorithm scores proposals correctly
- ✅ AI generates meaningful recommendations
- ✅ All CRUD operations function properly

---

**Note**: The test takes 1-2 minutes to complete due to AI processing time. This is normal for local LLMs.
