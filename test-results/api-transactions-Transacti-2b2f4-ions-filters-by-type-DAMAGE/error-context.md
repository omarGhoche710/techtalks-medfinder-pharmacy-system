# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\transactions.spec.ts >> Transactions API >> GET /api/transactions filters by type=DAMAGE
- Location: tests\api\transactions.spec.ts:42:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 500
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import { faker } from "@faker-js/faker";
  3   | 
  4   | // We'll store IDs created during tests to use across test cases
  5   | let createdMedicationId: string;
  6   | let createdPharmacyId: string;
  7   | let createdTransactionId: string;
  8   | 
  9   | test.describe("Transactions API", () => {
  10  | 
  11  |   // ============================================
  12  |   // GET /api/transactions
  13  |   // ============================================
  14  | 
  15  |   test("GET /api/transactions returns a list", async ({ request }) => {
  16  |     const response = await request.get("/api/transactions");
  17  |     expect(response.status()).toBe(200);
  18  |     const body = await response.json();
  19  |     expect(Array.isArray(body)).toBe(true);
  20  |   });
  21  | 
  22  |   test("GET /api/transactions filters by type=STOCK_IN", async ({ request }) => {
  23  |     const response = await request.get("/api/transactions?type=STOCK_IN");
  24  |     expect(response.status()).toBe(200);
  25  |     const body = await response.json();
  26  |     expect(Array.isArray(body)).toBe(true);
  27  |     body.forEach((t: any) => {
  28  |       expect(t.type).toBe("STOCK_IN");
  29  |     });
  30  |   });
  31  | 
  32  |   test("GET /api/transactions filters by type=DISPENSE", async ({ request }) => {
  33  |     const response = await request.get("/api/transactions?type=DISPENSE");
  34  |     expect(response.status()).toBe(200);
  35  |     const body = await response.json();
  36  |     expect(Array.isArray(body)).toBe(true);
  37  |     body.forEach((t: any) => {
  38  |       expect(t.type).toBe("DISPENSE");
  39  |     });
  40  |   });
  41  | 
  42  |   test("GET /api/transactions filters by type=DAMAGE", async ({ request }) => {
  43  |     const response = await request.get("/api/transactions?type=DAMAGE");
> 44  |     expect(response.status()).toBe(200);
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  45  |     const body = await response.json();
  46  |     expect(Array.isArray(body)).toBe(true);
  47  |     body.forEach((t: any) => {
  48  |       expect(t.type).toBe("DAMAGE");
  49  |     });
  50  |   });
  51  | 
  52  |   // ============================================
  53  |   // POST /api/transactions — Validation
  54  |   // ============================================
  55  | 
  56  |   test("POST /api/transactions rejects missing type", async ({ request }) => {
  57  |     const response = await request.post("/api/transactions", {
  58  |       data: {
  59  |         medicationId: "some-id",
  60  |         quantity: 5,
  61  |       },
  62  |     });
  63  |     expect(response.status()).toBe(400);
  64  |     const body = await response.json();
  65  |     expect(body.error).toBeTruthy();
  66  |   });
  67  | 
  68  |   test("POST /api/transactions rejects missing medicationId", async ({ request }) => {
  69  |     const response = await request.post("/api/transactions", {
  70  |       data: {
  71  |         type: "STOCK_IN",
  72  |         quantity: 5,
  73  |       },
  74  |     });
  75  |     expect(response.status()).toBe(400);
  76  |     const body = await response.json();
  77  |     expect(body.error).toBeTruthy();
  78  |   });
  79  | 
  80  |   test("POST /api/transactions rejects invalid transaction type", async ({ request }) => {
  81  |     const response = await request.post("/api/transactions", {
  82  |       data: {
  83  |         type: "INVALID_TYPE",
  84  |         medicationId: "some-id",
  85  |         quantity: 5,
  86  |       },
  87  |     });
  88  |     expect(response.status()).toBe(400);
  89  |     const body = await response.json();
  90  |     expect(body.error).toBeTruthy();
  91  |   });
  92  | 
  93  |   test("POST /api/transactions rejects quantity of zero", async ({ request }) => {
  94  |     const response = await request.post("/api/transactions", {
  95  |       data: {
  96  |         type: "STOCK_IN",
  97  |         medicationId: "some-id",
  98  |         quantity: 0,
  99  |       },
  100 |     });
  101 |     expect(response.status()).toBe(400);
  102 |     const body = await response.json();
  103 |     expect(body.error).toBeTruthy();
  104 |   });
  105 | 
  106 |   test("POST /api/transactions rejects negative quantity", async ({ request }) => {
  107 |     const response = await request.post("/api/transactions", {
  108 |       data: {
  109 |         type: "STOCK_IN",
  110 |         medicationId: "some-id",
  111 |         quantity: -5,
  112 |       },
  113 |     });
  114 |     expect(response.status()).toBe(400);
  115 |     const body = await response.json();
  116 |     expect(body.error).toBeTruthy();
  117 |   });
  118 | 
  119 |   test("POST /api/transactions rejects non-existent medicationId", async ({ request }) => {
  120 |     const response = await request.post("/api/transactions", {
  121 |       data: {
  122 |         type: "STOCK_IN",
  123 |         medicationId: "non-existent-uuid",
  124 |         quantity: 10,
  125 |       },
  126 |     });
  127 |     // Either 404 (not found) or 401/403 (auth required) — both are valid
  128 |     expect([401, 403, 404]).toContain(response.status());
  129 |   });
  130 | 
  131 |   // ============================================
  132 |   // POST /api/transactions — Auth
  133 |   // ============================================
  134 | 
  135 |   test("POST /api/transactions requires authentication", async ({ request }) => {
  136 |     const response = await request.post("/api/transactions", {
  137 |       data: {
  138 |         type: "STOCK_IN",
  139 |         medicationId: "some-id",
  140 |         quantity: 10,
  141 |       },
  142 |     });
  143 |     // Should return 401 since we're not logged in during tests
  144 |     expect([400, 401]).toContain(response.status());
```