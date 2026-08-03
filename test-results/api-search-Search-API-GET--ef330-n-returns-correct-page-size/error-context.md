# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\search.spec.ts >> Search API >> GET /api/search pagination returns correct page size
- Location: tests\api\search.spec.ts:127:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 500
```

# Test source

```ts
  29  |     const body = await response.json();
  30  | 
  31  |     if (body.results.length > 0) {
  32  |       const result = body.results[0];
  33  |       // Check medication object
  34  |       expect(result.medication).toBeDefined();
  35  |       expect(result.medication.id).toBeDefined();
  36  |       expect(result.medication.name).toBeDefined();
  37  |       expect(result.medication.price).toBeDefined();
  38  |       // Check inventory object
  39  |       expect(result.inventory).toBeDefined();
  40  |       expect(result.inventory.quantity).toBeDefined();
  41  |       expect(result.inventory.stockStatus).toBeDefined();
  42  |       // Check pharmacy object
  43  |       expect(result.pharmacy).toBeDefined();
  44  |       expect(result.pharmacy.id).toBeDefined();
  45  |       expect(result.pharmacy.name).toBeDefined();
  46  |       expect(result.pharmacy.address).toBeDefined();
  47  |     }
  48  |   });
  49  | 
  50  |   test("GET /api/search returns empty array for unknown medication", async ({ request }) => {
  51  |     const response = await request.get("/api/search?q=xyzunknownmed999");
  52  |     expect(response.status()).toBe(200);
  53  |     const body = await response.json();
  54  |     expect(body.results).toEqual([]);
  55  |     expect(body.meta.total).toBe(0);
  56  |   });
  57  | 
  58  |   // ============================================
  59  |   // Near Me Search
  60  |   // ============================================
  61  | 
  62  |   test("GET /api/search with nearMe and location returns distanceKm", async ({ request }) => {
  63  |     const response = await request.get(
  64  |       "/api/search?q=a&nearMe=true&lat=33.8938&lng=35.5018"
  65  |     );
  66  |     expect(response.status()).toBe(200);
  67  |     const body = await response.json();
  68  |     expect(body.meta.nearMe).toBe(true);
  69  | 
  70  |     if (body.results.length > 0) {
  71  |       expect(body.results[0].pharmacy.distanceKm).not.toBeNull();
  72  |     }
  73  |   });
  74  | 
  75  |   test("GET /api/search nearMe results sorted by distance", async ({ request }) => {
  76  |     const response = await request.get(
  77  |       "/api/search?q=a&nearMe=true&lat=33.8938&lng=35.5018"
  78  |     );
  79  |     expect(response.status()).toBe(200);
  80  |     const body = await response.json();
  81  | 
  82  |     const distances = body.results
  83  |       .map((r: any) => r.pharmacy.distanceKm)
  84  |       .filter((d: any) => d !== null);
  85  | 
  86  |     for (let i = 1; i < distances.length; i++) {
  87  |       expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1]);
  88  |     }
  89  |   });
  90  | 
  91  |   test("GET /api/search with small radius returns fewer results", async ({ request }) => {
  92  |     const broadResponse = await request.get(
  93  |       "/api/search?q=a&nearMe=true&lat=33.8938&lng=35.5018&radius=100"
  94  |     );
  95  |     const narrowResponse = await request.get(
  96  |       "/api/search?q=a&nearMe=true&lat=33.8938&lng=35.5018&radius=0.1"
  97  |     );
  98  | 
  99  |     expect(broadResponse.status()).toBe(200);
  100 |     expect(narrowResponse.status()).toBe(200);
  101 | 
  102 |     const broadBody = await broadResponse.json();
  103 |     const narrowBody = await narrowResponse.json();
  104 | 
  105 |     expect(narrowBody.meta.total).toBeLessThanOrEqual(broadBody.meta.total);
  106 |   });
  107 | 
  108 |   // ============================================
  109 |   // Availability Filter
  110 |   // ============================================
  111 | 
  112 |   test("GET /api/search with available=true returns only in-stock items", async ({ request }) => {
  113 |     const response = await request.get("/api/search?q=a&available=true");
  114 |     expect(response.status()).toBe(200);
  115 |     const body = await response.json();
  116 | 
  117 |     body.results.forEach((result: any) => {
  118 |       expect(result.inventory.quantity).toBeGreaterThan(0);
  119 |       expect(result.inventory.stockStatus).not.toBe("out_of_stock");
  120 |     });
  121 |   });
  122 | 
  123 |   // ============================================
  124 |   // Pagination
  125 |   // ============================================
  126 | 
  127 |   test("GET /api/search pagination returns correct page size", async ({ request }) => {
  128 |     const response = await request.get("/api/search?q=a&page=1&pageSize=2");
> 129 |     expect(response.status()).toBe(200);
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  130 |     const body = await response.json();
  131 |     expect(body.results.length).toBeLessThanOrEqual(2);
  132 |     expect(body.meta.pageSize).toBe(2);
  133 |     expect(body.meta.page).toBe(1);
  134 |   });
  135 | 
  136 |   test("GET /api/search pagination meta is correct", async ({ request }) => {
  137 |     const response = await request.get("/api/search?q=a&page=1&pageSize=2");
  138 |     expect(response.status()).toBe(200);
  139 |     const body = await response.json();
  140 |     expect(body.meta.total).toBeDefined();
  141 |     expect(body.meta.totalPages).toBeDefined();
  142 |     expect(body.meta.totalPages).toBe(
  143 |       body.meta.total === 0
  144 |         ? 0
  145 |         : Math.ceil(body.meta.total / body.meta.pageSize)
  146 |     );
  147 |   });
  148 | 
  149 |   test("GET /api/search page 2 returns different results than page 1", async ({ request }) => {
  150 |     const page1 = await request.get("/api/search?q=a&page=1&pageSize=2");
  151 |     const page2 = await request.get("/api/search?q=a&page=2&pageSize=2");
  152 | 
  153 |     expect(page1.status()).toBe(200);
  154 |     expect(page2.status()).toBe(200);
  155 | 
  156 |     const body1 = await page1.json();
  157 |     const body2 = await page2.json();
  158 | 
  159 |     if (body1.results.length > 0 && body2.results.length > 0) {
  160 |       expect(body1.results[0].id).not.toBe(body2.results[0].id);
  161 |     }
  162 |   });
  163 | 
  164 |   // ============================================
  165 |   // Demand Signal
  166 |   // ============================================
  167 | 
  168 |   test("GET /api/search result has demandSignal field", async ({ request }) => {
  169 |     const response = await request.get("/api/search?q=a");
  170 |     expect(response.status()).toBe(200);
  171 |     const body = await response.json();
  172 | 
  173 |     if (body.results.length > 0) {
  174 |       const result = body.results[0];
  175 |       expect("demandSignal" in result.medication).toBe(true);
  176 |       expect(["critical", "low", null]).toContain(result.medication.demandSignal);
  177 |     }
  178 |   });
  179 | 
  180 | });
```