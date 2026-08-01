# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\transactions.spec.ts >> Transactions API >> stock_in increases inventory quantity
- Location: tests\api\transactions.spec.ts:4:7

# Error details

```
SyntaxError: Unexpected end of JSON input
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("Transactions API", () => {
  4   |   test("stock_in increases inventory quantity", async ({ request }) => {
  5   |     // Get current quantity first
  6   |     const before = await request.get("/api/inventory/1");
> 7   |     const beforeData = await before.json();
      |                        ^ SyntaxError: Unexpected end of JSON input
  8   |     const startQuantity = beforeData.quantity;
  9   | 
  10  |     const response = await request.post("/api/transactions", {
  11  |       data: {
  12  |         type: "stock_in",
  13  |         inventoryId: "1",
  14  |         quantity: 20,
  15  |         notes: "Playwright test - stock in",
  16  |       },
  17  |     });
  18  | 
  19  |     expect(response.status()).toBe(201);
  20  |     const body = await response.json();
  21  |     expect(body.updatedInventory.newQuantity).toBe(startQuantity + 20);
  22  |   });
  23  | 
  24  |   test("dispense decreases inventory quantity", async ({ request }) => {
  25  |     const before = await request.get("/api/inventory/2");
  26  |     const beforeData = await before.json();
  27  |     const startQuantity = beforeData.quantity;
  28  | 
  29  |     const response = await request.post("/api/transactions", {
  30  |       data: {
  31  |         type: "dispense",
  32  |         inventoryId: "2",
  33  |         quantity: 5,
  34  |         notes: "Playwright test - dispense",
  35  |       },
  36  |     });
  37  | 
  38  |     expect(response.status()).toBe(201);
  39  |     const body = await response.json();
  40  |     expect(body.updatedInventory.newQuantity).toBe(startQuantity - 5);
  41  |   });
  42  | 
  43  |   test("damage decreases inventory quantity", async ({ request }) => {
  44  |     const before = await request.get("/api/inventory/3");
  45  |     const beforeData = await before.json();
  46  |     const startQuantity = beforeData.quantity;
  47  | 
  48  |     const response = await request.post("/api/transactions", {
  49  |       data: {
  50  |         type: "damage",
  51  |         inventoryId: "3",
  52  |         quantity: 1,
  53  |         notes: "Playwright test - damage",
  54  |       },
  55  |     });
  56  | 
  57  |     expect(response.status()).toBe(201);
  58  |     const body = await response.json();
  59  |     expect(body.updatedInventory.newQuantity).toBe(startQuantity - 1);
  60  |   });
  61  | 
  62  |   test("dispense fails when quantity exceeds stock", async ({ request }) => {
  63  |     const response = await request.post("/api/transactions", {
  64  |       data: {
  65  |         type: "dispense",
  66  |         inventoryId: "3",
  67  |         quantity: 999,
  68  |         notes: "Playwright test - insufficient stock",
  69  |       },
  70  |     });
  71  | 
  72  |     expect(response.status()).toBe(400);
  73  |     const body = await response.json();
  74  |     expect(body.error).toContain("Not enough stock");
  75  |   });
  76  | 
  77  |   test("rejects invalid transaction type", async ({ request }) => {
  78  |     const response = await request.post("/api/transactions", {
  79  |       data: {
  80  |         type: "invalid_type",
  81  |         inventoryId: "1",
  82  |         quantity: 5,
  83  |       },
  84  |     });
  85  | 
  86  |     expect(response.status()).toBe(400);
  87  |   });
  88  | 
  89  |   test("GET /api/transactions/:id returns a transaction", async ({ request }) => {
  90  |     const response = await request.get("/api/transactions/t1");
  91  |     expect(response.status()).toBe(200);
  92  |     const body = await response.json();
  93  |     expect(body.id).toBe("t1");
  94  |   });
  95  | 
  96  |   test("GET /api/transactions/:id returns 404 for missing transaction", async ({ request }) => {
  97  |     const response = await request.get("/api/transactions/t999");
  98  |     expect(response.status()).toBe(404);
  99  |   });
  100 | });
```