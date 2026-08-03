# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\inventory.spec.ts >> Inventory API >> GET /api/inventory returns correct shape
- Location: tests\api\inventory.spec.ts:17:7

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
  4   | test.describe("Inventory API", () => {
  5   | 
  6   |   // ============================================
  7   |   // GET /api/inventory
  8   |   // ============================================
  9   | 
  10  |   test("GET /api/inventory returns a list", async ({ request }) => {
  11  |     const response = await request.get("/api/inventory");
  12  |     expect(response.status()).toBe(200);
  13  |     const body = await response.json();
  14  |     expect(Array.isArray(body)).toBe(true);
  15  |   });
  16  | 
  17  |   test("GET /api/inventory returns correct shape", async ({ request }) => {
  18  |     const response = await request.get("/api/inventory");
> 19  |     expect(response.status()).toBe(200);
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  20  |     const body = await response.json();
  21  | 
  22  |     if (body.length > 0) {
  23  |       const item = body[0];
  24  |       expect(item.id).toBeDefined();
  25  |       expect(item.code).toBeDefined();
  26  |       expect(item.medicationName).toBeDefined();
  27  |       expect(item.pharmacyName).toBeDefined();
  28  |       expect(item.quantity).toBeDefined();
  29  |       expect(item.price).toBeDefined();
  30  |       expect(item.expiryDate).toBeDefined();
  31  |     }
  32  |   });
  33  | 
  34  |   test("GET /api/inventory filters by pharmacyId", async ({ request }) => {
  35  |     // First get all inventory to find a real pharmacyId
  36  |     const allResponse = await request.get("/api/inventory");
  37  |     const allBody = await allResponse.json();
  38  | 
  39  |     if (allBody.length > 0) {
  40  |       const pharmacyId = allBody[0].pharmacyId;
  41  |       const filtered = await request.get(
  42  |         `/api/inventory?pharmacyId=${pharmacyId}`
  43  |       );
  44  |       expect(filtered.status()).toBe(200);
  45  |       const filteredBody = await filtered.json();
  46  |       filteredBody.forEach((item: any) => {
  47  |         expect(item.pharmacyId).toBe(pharmacyId);
  48  |       });
  49  |     }
  50  |   });
  51  | 
  52  |   test("GET /api/inventory filters by medicationId", async ({ request }) => {
  53  |     const allResponse = await request.get("/api/inventory");
  54  |     const allBody = await allResponse.json();
  55  | 
  56  |     if (allBody.length > 0) {
  57  |       const medicationId = allBody[0].medicationId;
  58  |       const filtered = await request.get(
  59  |         `/api/inventory?medicationId=${medicationId}`
  60  |       );
  61  |       expect(filtered.status()).toBe(200);
  62  |       const filteredBody = await filtered.json();
  63  |       filteredBody.forEach((item: any) => {
  64  |         expect(item.medicationId).toBe(medicationId);
  65  |       });
  66  |     }
  67  |   });
  68  | 
  69  |   // ============================================
  70  |   // POST /api/inventory — Validation
  71  |   // ============================================
  72  | 
  73  |   test("POST /api/inventory rejects missing code", async ({ request }) => {
  74  |     const response = await request.post("/api/inventory", {
  75  |       data: {
  76  |         medicationName: "Test Med",
  77  |         pharmacyId: "some-id",
  78  |         quantity: 10,
  79  |         price: 5.0,
  80  |         expiryDate: "2027-01-01",
  81  |       },
  82  |     });
  83  |     expect(response.status()).toBe(400);
  84  |     const body = await response.json();
  85  |     expect(body.error).toBeTruthy();
  86  |   });
  87  | 
  88  |   test("POST /api/inventory rejects missing pharmacyId", async ({ request }) => {
  89  |     const response = await request.post("/api/inventory", {
  90  |       data: {
  91  |         code: faker.string.alphanumeric(8),
  92  |         medicationName: "Test Med",
  93  |         quantity: 10,
  94  |         price: 5.0,
  95  |         expiryDate: "2027-01-01",
  96  |       },
  97  |     });
  98  |     expect(response.status()).toBe(400);
  99  |     const body = await response.json();
  100 |     expect(body.error).toBeTruthy();
  101 |   });
  102 | 
  103 |   test("POST /api/inventory rejects negative quantity", async ({ request }) => {
  104 |     const response = await request.post("/api/inventory", {
  105 |       data: {
  106 |         code: faker.string.alphanumeric(8),
  107 |         medicationName: "Test Med",
  108 |         pharmacyId: "some-id",
  109 |         quantity: -5,
  110 |         price: 5.0,
  111 |         expiryDate: "2027-01-01",
  112 |       },
  113 |     });
  114 |     expect(response.status()).toBe(400);
  115 |     const body = await response.json();
  116 |     expect(body.error).toBeTruthy();
  117 |   });
  118 | 
  119 |   test("POST /api/inventory rejects negative price", async ({ request }) => {
```