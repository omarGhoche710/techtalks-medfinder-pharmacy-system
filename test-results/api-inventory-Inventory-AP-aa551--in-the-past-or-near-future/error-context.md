# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\inventory.spec.ts >> Inventory API >> GET /api/expired items have expiry dates in the past or near future
- Location: tests\api\inventory.spec.ts:200:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 500
```

# Test source

```ts
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
  120 |     const response = await request.post("/api/inventory", {
  121 |       data: {
  122 |         code: faker.string.alphanumeric(8),
  123 |         medicationName: "Test Med",
  124 |         pharmacyId: "some-id",
  125 |         quantity: 10,
  126 |         price: -1.0,
  127 |         expiryDate: "2027-01-01",
  128 |       },
  129 |     });
  130 |     expect(response.status()).toBe(400);
  131 |     const body = await response.json();
  132 |     expect(body.error).toBeTruthy();
  133 |   });
  134 | 
  135 |   test("POST /api/inventory requires auth", async ({ request }) => {
  136 |     const response = await request.post("/api/inventory", {
  137 |       data: {
  138 |         code: faker.string.alphanumeric(8),
  139 |         medicationName: "Test Med",
  140 |         pharmacyId: "some-id",
  141 |         quantity: 10,
  142 |         price: 5.0,
  143 |         expiryDate: "2027-01-01",
  144 |       },
  145 |     });
  146 |     expect([400, 401, 403, 404]).toContain(response.status());
  147 |   });
  148 | 
  149 |   // ============================================
  150 |   // PATCH /api/inventory/:id
  151 |   // ============================================
  152 | 
  153 |   test("PATCH /api/inventory/:id returns 404 for non-existent id", async ({ request }) => {
  154 |     const response = await request.patch(
  155 |       "/api/inventory/non-existent-uuid",
  156 |       {
  157 |         data: { price: 10.0 },
  158 |       }
  159 |     );
  160 |     expect(response.status()).toBe(404);
  161 |   });
  162 | 
  163 |   test("PATCH /api/inventory/:id rejects direct stock update", async ({ request }) => {
  164 |     const allResponse = await request.get("/api/inventory");
  165 |     const allBody = await allResponse.json();
  166 | 
  167 |     if (allBody.length > 0) {
  168 |       const id = allBody[0].id;
  169 |       const response = await request.patch(`/api/inventory/${id}`, {
  170 |         data: { quantity: 999 },
  171 |       });
  172 |       expect(response.status()).toBe(400);
  173 |       const body = await response.json();
  174 |       expect(body.error).toContain("Stock cannot be updated directly");
  175 |     }
  176 |   });
  177 | 
  178 |   // ============================================
  179 |   // DELETE /api/inventory/:id
  180 |   // ============================================
  181 | 
  182 |   test("DELETE /api/inventory/:id returns 404 for non-existent id", async ({ request }) => {
  183 |     const response = await request.delete(
  184 |       "/api/inventory/non-existent-uuid"
  185 |     );
  186 |     expect(response.status()).toBe(404);
  187 |   });
  188 | 
  189 |   // ============================================
  190 |   // GET /api/expired
  191 |   // ============================================
  192 | 
  193 |   test("GET /api/expired returns a list", async ({ request }) => {
  194 |     const response = await request.get("/api/expired");
  195 |     expect(response.status()).toBe(200);
  196 |     const body = await response.json();
  197 |     expect(Array.isArray(body)).toBe(true);
  198 |   });
  199 | 
  200 |   test("GET /api/expired items have expiry dates in the past or near future", async ({ request }) => {
  201 |     const response = await request.get("/api/expired");
> 202 |     expect(response.status()).toBe(200);
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  203 |     const body = await response.json();
  204 |     const thirtyDaysFromNow = new Date();
  205 |     thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  206 | 
  207 |     body.forEach((item: any) => {
  208 |       const expiryDate = new Date(item.expiryDate);
  209 |       expect(expiryDate.getTime()).toBeLessThanOrEqual(
  210 |         thirtyDaysFromNow.getTime()
  211 |       );
  212 |     });
  213 |   });
  214 | 
  215 | });
```