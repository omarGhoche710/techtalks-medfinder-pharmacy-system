# ⏰ Expired Medication Trigger - Setup Guide

## 🎯 What It Does

```
1️⃣ Automatically detects expired medications (date_expired < today)
2️⃣ Moves them to ExpiredMedication table
3️⃣ Removes from active Medication table
4️⃣ Creates AuditLog entries

Plus:
5️⃣ Detects medications expiring soon (< 30 days)
6️⃣ Auto-applies discounts based on days remaining
7️⃣ Marks as transferable for exchange
```

---

## 📋 Expiry Rules

```
Days Until Expiry | Discount | Status
────────────────────────────────────
0-7 days         | 30%      | NEAR_EXPIRY
8-14 days        | 20%      | NEAR_EXPIRY
15-21 days       | 15%      | NEAR_EXPIRY
22-30 days       | 10%      | NEAR_EXPIRY
> 30 days        | None     | ACTIVE
```

---

## 🚀 Implementation

### **File Structure:**

```
lib/
└─ database/
   └─ triggers/
      └─ expiredMedicationTrigger.ts   (Trigger logic)

app/
└─ api/
   └─ cron/
      └─ check-expired-medications/
         └─ route.ts                   (Cron endpoint)
```

---

## 🔐 Setup Environment Variables

```env
# .env
CRON_SECRET=your_super_secret_key_here_12345
```

**Generate a secure key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ⏰ Setup Cron Job

### **Option 1: Vercel Cron (Built-in)**

1. **Go to Vercel Dashboard**
   - Project → Settings → Cron Jobs

2. **Add New Cron Job**
   ```
   Cron Expression: 0 0 * * *    (Daily at midnight)
   Route: /api/cron/check-expired-medications
   ```

3. **Vercel automatically includes `Authorization` header**
   - You don't need to do anything else!

---

### **Option 2: EasyCron (External Service)**

1. **Go to https://www.easycron.com**

2. **Create New Cron Job**
   ```
   URL: https://yourdomain.com/api/cron/check-expired-medications
   HTTP Method: GET
   HTTP Authentication: No
   Cron Expression: 0 0 * * *    (Daily at midnight)
   ```

3. **Manual Setup (Add Authorization):**
   ```
   GET /api/cron/check-expired-medications
   Header: Authorization: Bearer YOUR_CRON_SECRET
   ```

---

### **Option 3: Node-Cron (Local/Self-hosted)**

```typescript
// lib/cron/scheduledJobs.ts

import cron from 'node-cron';
import { 
  checkAndMoveExpiredMedications,
  checkAndUpdateNearExpiryMedications 
} from '@/lib/database/triggers/expiredMedicationTrigger';

export function setupScheduledJobs() {
  // Run every day at midnight (0 0)
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Running scheduled expired medication check...');
    
    await checkAndUpdateNearExpiryMedications();
    await checkAndMoveExpiredMedications();
  });

  console.log('✅ Scheduled jobs initialized');
}
```

**Call in your app initialization:**
```typescript
// app/layout.tsx or server startup
import { setupScheduledJobs } from '@/lib/cron/scheduledJobs';

if (process.env.NODE_ENV === 'production') {
  setupScheduledJobs();
}
```

---

## 🧪 Manual Testing

### **Test via API (POST)**

```bash
curl -X POST http://localhost:3000/api/cron/check-expired-medications \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your_cron_secret_here",
    "pharmacyId": null
  }'
```

### **Test Specific Pharmacy**

```bash
curl -X POST http://localhost:3000/api/cron/check-expired-medications \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your_cron_secret_here",
    "pharmacyId": "pharmacy-id-here"
  }'
```

---

## 📊 How It Works

### **Step 1: Check for Expired Medications**
```
SELECT * FROM medications
WHERE date_expired < TODAY
```

### **Step 2: Transaction**
```
BEGIN TRANSACTION
  → Create ExpiredMedication record
  → Delete from Medication table
  → Create AuditLog entry
COMMIT
```

### **Step 3: Check for Near-Expiry**
```
SELECT * FROM medications
WHERE date_expired BETWEEN TODAY AND TODAY + 30 DAYS
AND status = 'ACTIVE'
```

### **Step 4: Update Status & Discount**
```
UPDATE medications
SET status = 'NEAR_EXPIRY',
    discount_percentage = (calculated),
    is_transferable = true
```

---

## ✅ Monitoring & Logging

Check logs:
```bash
# Vercel
vercel logs [project-name]

# Local
npm run dev  # Check console output
```

Expected logs:
```
✅ Moved 5 expired medications to ExpiredMedication
✅ Updated 12 medications to NEAR_EXPIRY status
```

---

## 🔒 Security Checklist

```
✅ CRON_SECRET is strong (32+ chars)
✅ CRON_SECRET is not in git history
✅ Endpoint validates authorization header
✅ Only system user can trigger (user_id: "system")
✅ AuditLog tracks all auto-actions
```

---

## 📈 Production Checklist

Before deploying to production:

```
✅ Environment variables set in Vercel/hosting
✅ Cron job scheduled (Vercel or external service)
✅ Test with real data in staging
✅ Monitor first run in production
✅ Set up alerts for cron failures
✅ Review expired medications weekly
```

---

## 🐛 Troubleshooting

### **Cron job not running?**
```
1. Check CRON_SECRET is set in environment
2. Verify cron schedule (0 0 * * * = daily at midnight UTC)
3. Check Vercel/hosting logs
4. Test manually via POST endpoint
```

### **Medications not expiring?**
```
1. Verify date_expired is in past
2. Check timezone (uses UTC by default)
3. Run manual check: POST to /api/cron/check-expired-medications
4. Review AuditLog for any errors
```

### **Too many medications expired at once?**
```
If > 1000 expired meds:
- Cron might timeout
- Solution: Add pagination to trigger
- Process in batches of 100
```

---

## 📝 API Response Example

**Success:**
```json
{
  "success": true,
  "timestamp": "2026-07-30T00:00:00.000Z",
  "results": {
    "nearExpiryUpdated": 12,
    "expiredMoved": 5
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

**Done! Trigger is ready to deploy.** 🚀