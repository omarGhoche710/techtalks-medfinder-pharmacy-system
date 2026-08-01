# Med Finder API Contract

This document defines the request and response shapes for all API endpoints in the Med Finder system.

---

## Health

### `GET /api/health`

Checks if the server is running correctly.

**Request**

- No parameters required
- No request body

**Response — Success (200)**

```json
{
  "status": "ok",
  "timestamp": "2026-07-13T10:00:00.000Z"
}
```

**Response — Fields**
| Field | Type | Description |
|-------|------|-------------|
| status | string | Always "ok" when the server is running |
| timestamp | string | Current server time in ISO 8601 format |

---

## Medications

### `GET /api/medications`

Returns a list of all medications in the catalog.

**Request**

- No parameters required
- No request body

**Response — Success (200)**

```json
[
  { "id": "1", "name": "Paracetamol", "category": "Pain Relief" },
  { "id": "2", "name": "Amoxicillin", "category": "Antibiotic" },
  { "id": "3", "name": "Ibuprofen", "category": "Pain Relief" }
]
```

**Response — Fields**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the medication |
| name | string | Name of the medication |
| category | string | Category the medication belongs to |

---

### `GET /api/medications/:id`

Returns the details of a single medication by its ID.

**Request**

- URL parameter: `id` (string) — the ID of the medication to fetch
- No request body

**Example**

**Response — Success (200)**

```json
{
  "id": "1",
  "name": "Paracetamol",
  "category": "Pain Relief"
}
```

**Response — Not Found (404)**

```json
{
  "error": "Medication not found"
}
```

**Response — Fields**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the medication |
| name | string | Name of the medication |
| category | string | Category the medication belongs to |

---

### `POST /api/medications`

Adds a new medication to the catalog.

**Request Body**

```json
{
  "name": "Aspirin",
  "category": "Pain Relief"
}
```

**Request — Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ Yes | Name of the medication |
| category | string | ✅ Yes | Category the medication belongs to |

**Response — Success (201)**

```json
{
  "id": "4",
  "name": "Aspirin",
  "category": "Pain Relief"
}
```

**Response — Bad Request (400)**

```json
{
  "error": "Name and category are required"
}
```

---

## Inventory

### `GET /api/inventory`

Returns a list of inventory items. Can be filtered by pharmacy or medication.

**Request — Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pharmacyId | string | ❌ No | Filter inventory by pharmacy ID |
| medicationId | string | ❌ No | Filter inventory by medication ID |

**Examples**

**Response — Success (200)**

```json
[
  {
    "id": "1",
    "medicationId": "1",
    "medicationName": "Paracetamol",
    "pharmacyId": "p1",
    "pharmacyName": "City Pharmacy",
    "quantity": 50,
    "price": 2.5,
    "expiryDate": "2027-01-15"
  }
]
```

**Response — Fields**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the inventory item |
| medicationId | string | ID of the medication |
| medicationName | string | Name of the medication |
| pharmacyId | string | ID of the pharmacy that owns this stock |
| pharmacyName | string | Name of the pharmacy |
| quantity | number | Number of units currently in stock |
| price | number | Price per unit in the local currency |
| expiryDate | string | Expiry date of this stock batch (YYYY-MM-DD) |

---

### `POST /api/inventory`

Adds a new stock entry for a pharmacy.

**Request Body**

```json
{
  "medicationId": "1",
  "medicationName": "Paracetamol",
  "pharmacyId": "p1",
  "pharmacyName": "City Pharmacy",
  "quantity": 100,
  "price": 2.5,
  "expiryDate": "2027-06-01"
}
```

**Request — Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| medicationId | string | ✅ Yes | ID of the medication |
| medicationName | string | ✅ Yes | Name of the medication |
| pharmacyId | string | ✅ Yes | ID of the pharmacy |
| pharmacyName | string | ✅ Yes | Name of the pharmacy |
| quantity | number | ✅ Yes | Number of units in stock |
| price | number | ✅ Yes | Price per unit |
| expiryDate | string | ✅ Yes | Expiry date in YYYY-MM-DD format |

**Response — Success (201)**

```json
{
  "id": "5",
  "medicationId": "1",
  "medicationName": "Paracetamol",
  "pharmacyId": "p1",
  "pharmacyName": "City Pharmacy",
  "quantity": 100,
  "price": 2.5,
  "expiryDate": "2027-06-01"
}
```

**Response — Bad Request (400)**

```json
{
  "error": "All fields are required"
}
```

---

### `PATCH /api/inventory/:id`

Updates an existing inventory item (e.g. quantity or price).

**Request**

- URL parameter: `id` (string) — the ID of the inventory item to update

**Request Body**

```json
{
  "quantity": 80,
  "price": 3.0
}
```

**Request — Fields (all optional, send only what needs updating)**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| quantity | number | ❌ No | Updated quantity |
| price | number | ❌ No | Updated price per unit |
| expiryDate | string | ❌ No | Updated expiry date |

**Response — Success (200)**

```json
{
  "id": "1",
  "medicationId": "1",
  "medicationName": "Paracetamol",
  "pharmacyId": "p1",
  "pharmacyName": "City Pharmacy",
  "quantity": 80,
  "price": 3.0,
  "expiryDate": "2027-01-15"
}
```

**Response — Not Found (404)**

```json
{
  "error": "Inventory item not found"
}
```

---

### `DELETE /api/inventory/:id`

Removes a stock entry from inventory.

**Request**

- URL parameter: `id` (string) — the ID of the inventory item to delete
- No request body

**Example**

**Response — Success (200)**

```json
{
  "message": "Inventory item deleted successfully"
}
```

**Response — Not Found (404)**

```json
{
  "error": "Inventory item not found"
}
```

---

## Transactions

### `GET /api/transactions`

Returns a list of transactions. Can be filtered by type, pharmacy, or medication.

**Request — Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | ❌ No | Filter by transaction type: `purchase` or `exchange` |
| pharmacyId | string | ❌ No | Filter by pharmacy ID (checks all pharmacy fields) |
| medicationId | string | ❌ No | Filter by medication ID |

**Examples**

```
GET /api/transactions
GET /api/transactions?type=purchase
GET /api/transactions?type=exchange
GET /api/transactions?pharmacyId=p1
GET /api/transactions?medicationId=1
```

**Response — Success (200) — Purchase type**

```json
[
  {
    "id": "t1",
    "type": "purchase",
    "medicationId": "1",
    "medicationName": "Paracetamol",
    "quantity": 3,
    "totalPrice": 7.5,
    "date": "2026-06-01",
    "pharmacyId": "p1",
    "pharmacyName": "City Pharmacy",
    "customerId": "c1",
    "customerName": "Ahmed Hassan",
    "fromPharmacyId": null,
    "fromPharmacyName": null,
    "toPharmacyId": null,
    "toPharmacyName": null
  }
]
```

**Response — Success (200) — Exchange type**

```json
[
  {
    "id": "t3",
    "type": "exchange",
    "medicationId": "3",
    "medicationName": "Ibuprofen",
    "quantity": 10,
    "totalPrice": 20.0,
    "date": "2026-06-10",
    "pharmacyId": null,
    "pharmacyName": null,
    "customerId": null,
    "customerName": null,
    "fromPharmacyId": "p2",
    "fromPharmacyName": "Green Cross Pharmacy",
    "toPharmacyId": "p1",
    "toPharmacyName": "City Pharmacy"
  }
]
```

**Response — Fields**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the transaction |
| type | string | Type of transaction: `purchase` or `exchange` |
| medicationId | string | ID of the medication involved |
| medicationName | string | Name of the medication |
| quantity | number | Number of units in this transaction |
| totalPrice | number | Total price for this transaction |
| date | string | Date of the transaction (YYYY-MM-DD) |
| pharmacyId | string or null | ID of the pharmacy (purchases only) |
| pharmacyName | string or null | Name of the pharmacy (purchases only) |
| customerId | string or null | ID of the customer (purchases only) |
| customerName | string or null | Name of the customer (purchases only) |
| fromPharmacyId | string or null | ID of the sending pharmacy (exchanges only) |
| fromPharmacyName | string or null | Name of the sending pharmacy (exchanges only) |
| toPharmacyId | string or null | ID of the receiving pharmacy (exchanges only) |
| toPharmacyName | string or null | Name of the receiving pharmacy (exchanges only) |

---

### `GET /api/transactions/:id`

Returns the details of a single transaction by its ID.

**Request**

- URL parameter: `id` (string) — the ID of the transaction to fetch
- No request body

**Example**

```
GET /api/transactions/t1
```

**Response — Success (200)**

```json
{
  "id": "t1",
  "type": "purchase",
  "medicationId": "1",
  "medicationName": "Paracetamol",
  "quantity": 3,
  "totalPrice": 7.5,
  "date": "2026-06-01",
  "pharmacyId": "p1",
  "pharmacyName": "City Pharmacy",
  "customerId": "c1",
  "customerName": "Ahmed Hassan",
  "fromPharmacyId": null,
  "fromPharmacyName": null,
  "toPharmacyId": null,
  "toPharmacyName": null
}
```

**Response — Not Found (404)**

```json
{
  "error": "Transaction not found"
}
```

---

### `POST /api/transactions`

Creates a new transaction. Works for both purchases and exchanges depending on the `type` field.

**Request Body — Purchase**

```json
{
  "type": "purchase",
  "medicationId": "1",
  "medicationName": "Paracetamol",
  "quantity": 3,
  "totalPrice": 7.5,
  "date": "2026-07-13",
  "pharmacyId": "p1",
  "pharmacyName": "City Pharmacy",
  "customerId": "c1",
  "customerName": "Ahmed Hassan"
}
```

**Request Body — Exchange**

```json
{
  "type": "exchange",
  "medicationId": "3",
  "medicationName": "Ibuprofen",
  "quantity": 10,
  "totalPrice": 20.0,
  "date": "2026-07-13",
  "fromPharmacyId": "p2",
  "fromPharmacyName": "Green Cross Pharmacy",
  "toPharmacyId": "p1",
  "toPharmacyName": "City Pharmacy"
}
```

**Request — Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | ✅ Yes | `purchase` or `exchange` |
| medicationId | string | ✅ Yes | ID of the medication |
| medicationName | string | ✅ Yes | Name of the medication |
| quantity | number | ✅ Yes | Number of units |
| totalPrice | number | ✅ Yes | Total price of the transaction |
| date | string | ✅ Yes | Date in YYYY-MM-DD format |
| pharmacyId | string | ✅ For purchases | ID of the selling pharmacy |
| pharmacyName | string | ✅ For purchases | Name of the selling pharmacy |
| customerId | string | ✅ For purchases | ID of the customer |
| customerName | string | ✅ For purchases | Name of the customer |
| fromPharmacyId | string | ✅ For exchanges | ID of the sending pharmacy |
| fromPharmacyName | string | ✅ For exchanges | Name of the sending pharmacy |
| toPharmacyId | string | ✅ For exchanges | ID of the receiving pharmacy |
| toPharmacyName | string | ✅ For exchanges | Name of the receiving pharmacy |

**Response — Success (201)**

```json
{
  "id": "t5",
  "type": "purchase",
  "medicationId": "1",
  "medicationName": "Paracetamol",
  "quantity": 3,
  "totalPrice": 7.5,
  "date": "2026-07-13",
  "pharmacyId": "p1",
  "pharmacyName": "City Pharmacy",
  "customerId": "c1",
  "customerName": "Ahmed Hassan",
  "fromPharmacyId": null,
  "fromPharmacyName": null,
  "toPharmacyId": null,
  "toPharmacyName": null
}
```

**Response — Bad Request (400)**

```json
{
  "error": "Type, medicationId, quantity, totalPrice and date are required"
}
```

---

## Transfers

### `GET /api/transfers`

Returns a list of pharmacy-to-pharmacy transfer proposals. Can be filtered by status, pharmacy, or medication.

**Request — Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | ❌ No | Filter by status: `pending`, `accepted`, or `rejected` |
| fromPharmacyId | string | ❌ No | Filter by the sending pharmacy ID |
| toPharmacyId | string | ❌ No | Filter by the receiving pharmacy ID |
| medicationId | string | ❌ No | Filter by medication ID |

**Examples**

```
GET /api/transfers
GET /api/transfers?status=pending
GET /api/transfers?status=accepted
GET /api/transfers?fromPharmacyId=p1
GET /api/transfers?toPharmacyId=p2
GET /api/transfers?medicationId=2
```

**Response — Success (200)**

```json
[
  {
    "id": "tr1",
    "medicationId": "3",
    "medicationName": "Ibuprofen",
    "fromPharmacyId": "p2",
    "fromPharmacyName": "Green Cross Pharmacy",
    "toPharmacyId": "p1",
    "toPharmacyName": "City Pharmacy",
    "quantity": 15,
    "pricePerUnit": 3.0,
    "status": "pending",
    "reason": "Nearing expiry — transferring to higher demand area",
    "createdAt": "2026-07-01"
  }
]
```

**Response — Fields**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the transfer |
| medicationId | string | ID of the medication being transferred |
| medicationName | string | Name of the medication |
| fromPharmacyId | string | ID of the pharmacy sending the medication |
| fromPharmacyName | string | Name of the sending pharmacy |
| toPharmacyId | string | ID of the pharmacy receiving the medication |
| toPharmacyName | string | Name of the receiving pharmacy |
| quantity | number | Number of units being transferred |
| pricePerUnit | number | Discounted price per unit for this transfer |
| status | string | Current status: `pending`, `accepted`, or `rejected` |
| reason | string | Reason for proposing this transfer |
| createdAt | string | Date the transfer was proposed (YYYY-MM-DD) |

---

### `POST /api/transfers`

Creates a new transfer proposal from one pharmacy to another.

**Request Body**

```json
{
  "medicationId": "2",
  "medicationName": "Amoxicillin",
  "fromPharmacyId": "p1",
  "fromPharmacyName": "City Pharmacy",
  "toPharmacyId": "p2",
  "toPharmacyName": "Green Cross Pharmacy",
  "quantity": 10,
  "pricePerUnit": 5.0,
  "reason": "Surplus stock — transferring to pharmacy with higher demand"
}
```

**Request — Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| medicationId | string | ✅ Yes | ID of the medication |
| medicationName | string | ✅ Yes | Name of the medication |
| fromPharmacyId | string | ✅ Yes | ID of the sending pharmacy |
| fromPharmacyName | string | ✅ Yes | Name of the sending pharmacy |
| toPharmacyId | string | ✅ Yes | ID of the receiving pharmacy |
| toPharmacyName | string | ✅ Yes | Name of the receiving pharmacy |
| quantity | number | ✅ Yes | Number of units to transfer |
| pricePerUnit | number | ✅ Yes | Discounted price per unit |
| reason | string | ✅ Yes | Reason for the transfer |

**Response — Success (201)**

```json
{
  "id": "tr4",
  "medicationId": "2",
  "medicationName": "Amoxicillin",
  "fromPharmacyId": "p1",
  "fromPharmacyName": "City Pharmacy",
  "toPharmacyId": "p2",
  "toPharmacyName": "Green Cross Pharmacy",
  "quantity": 10,
  "pricePerUnit": 5.0,
  "status": "pending",
  "reason": "Surplus stock — transferring to pharmacy with higher demand",
  "createdAt": "2026-07-13"
}
```

Notice that `status` is automatically set to `"pending"` when a transfer is first created — the receiving pharmacy hasn't accepted or rejected it yet.

**Response — Bad Request (400)**

```json
{
  "error": "All fields are required"
}
```

---

### `PATCH /api/transfers/:id`

Updates the status of an existing transfer — used by the receiving pharmacy to accept or reject a proposal.

**Request**

- URL parameter: `id` (string) — the ID of the transfer to update
- No other parameters needed

**Request Body**

```json
{
  "status": "accepted"
}
```

**Request — Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | ✅ Yes | New status: `accepted` or `rejected` |

**Response — Success (200)**

```json
{
  "id": "tr1",
  "medicationId": "3",
  "medicationName": "Ibuprofen",
  "fromPharmacyId": "p2",
  "fromPharmacyName": "Green Cross Pharmacy",
  "toPharmacyId": "p1",
  "toPharmacyName": "City Pharmacy",
  "quantity": 15,
  "pricePerUnit": 3.0,
  "status": "accepted",
  "reason": "Nearing expiry — transferring to higher demand area",
  "createdAt": "2026-07-01"
}
```

**Response — Not Found (404)**

```json
{
  "error": "Transfer not found"
}
```

**Response — Bad Request (400)**

```json
{
  "error": "Status must be accepted or rejected"
}
```

---

## Expired

### `GET /api/expired`

Returns a list of inventory items that are already expired or expiring within the next 30 days. Can be filtered by pharmacy.

**Request — Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pharmacyId | string | ❌ No | Filter by pharmacy ID |

**Examples**

```
GET /api/expired
GET /api/expired?pharmacyId=p1
GET /api/expired?pharmacyId=p2
```

**Response — Success (200)**

```json
[
  {
    "id": "4",
    "medicationId": "3",
    "medicationName": "Ibuprofen",
    "pharmacyId": "p2",
    "pharmacyName": "Green Cross Pharmacy",
    "quantity": 30,
    "price": 4.5,
    "expiryDate": "2025-12-20"
  }
]
```

**Response — Fields**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the inventory item |
| medicationId | string | ID of the medication |
| medicationName | string | Name of the medication |
| pharmacyId | string | ID of the pharmacy that owns this stock |
| pharmacyName | string | Name of the pharmacy |
| quantity | number | Number of units currently in stock |
| price | number | Price per unit |
| expiryDate | string | Expiry date of this stock batch (YYYY-MM-DD) |

**Notes**

- Items are considered "nearing expiry" if their expiry date falls within the next 30 days from today
- Items whose expiry date has already passed are also included in the results
- This endpoint is useful for pharmacies to identify stock they should discount or transfer to other pharmacies before it expires

---

## Search

### `GET /api/search`

Searches for a medication by name and returns a list of pharmacies that have it in stock, sorted by distance from the user's location.

**Request — Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | ✅ Yes | The medication name to search for |
| lat | number | ✅ Yes | The user's current latitude |
| lng | number | ✅ Yes | The user's current longitude |
| radius | number | ❌ No | Search radius in kilometers (default: 10) |

**Examples**

```
GET /api/search?name=Paracetamol&lat=33.8938&lng=35.5018
GET /api/search?name=Ibuprofen&lat=33.8938&lng=35.5018&radius=5
```

**Response — Success (200)**

```json
[
  {
    "pharmacyId": "p1",
    "pharmacyName": "City Pharmacy",
    "medicationId": "1",
    "medicationName": "Paracetamol",
    "quantity": 50,
    "price": 2.5,
    "expiryDate": "2027-01-15",
    "distanceKm": 1.2
  },
  {
    "pharmacyId": "p2",
    "pharmacyName": "Green Cross Pharmacy",
    "medicationId": "1",
    "medicationName": "Paracetamol",
    "quantity": 5,
    "price": 3.0,
    "expiryDate": "2026-09-01",
    "distanceKm": 3.7
  }
]
```

**Response — Fields**
| Field | Type | Description |
|-------|------|-------------|
| pharmacyId | string | ID of the pharmacy that has the medication in stock |
| pharmacyName | string | Name of the pharmacy |
| medicationId | string | ID of the medication |
| medicationName | string | Name of the medication found |
| quantity | number | Number of units currently in stock at this pharmacy |
| price | number | Price per unit at this pharmacy |
| expiryDate | string | Expiry date of this stock batch (YYYY-MM-DD) |
| distanceKm | number | Distance in kilometers from the user's location to this pharmacy |

**Response — No Results (200)**

```json
[]
```

**Response — Bad Request (400)**

```json
{
  "error": "name, lat and lng are required"
}
```

**Notes**

- Results are sorted by distance (nearest pharmacy first)
- Only pharmacies with quantity greater than 0 are returned
- Search is case-insensitive (searching "paracetamol" matches "Paracetamol")
- The `radius` parameter limits results to pharmacies within that distance from the user
- When no pharmacies are found, an empty array is returned (not a 404 error)

---

## Memberships

### `GET /api/memberships`

Returns a list of memberships — pharmacists who belong to a pharmacy.

**Request — Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pharmacyId | string | ❌ No | Filter memberships by pharmacy ID |
| userId | string | ❌ No | Filter memberships by pharmacist user ID |

**Examples**
```
GET /api/memberships
GET /api/memberships?pharmacyId=p1
GET /api/memberships?userId=u1
```

**Response — Success (200)**
```json
[
  {
    "id": "m1",
    "pharmacyId": "p1",
    "pharmacyName": "City Pharmacy",
    "userId": "u1",
    "userFullName": "Ahmed Hassan",
    "userEmail": "ahmed@example.com",
    "role": "pharmacist",
    "status": "active",
    "joinedAt": "2026-06-01"
  }
]
```

**Response — Fields**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the membership |
| pharmacyId | string | ID of the pharmacy the pharmacist belongs to |
| pharmacyName | string | Name of the pharmacy |
| userId | string | ID of the pharmacist user |
| userFullName | string | Full name of the pharmacist |
| userEmail | string | Email address of the pharmacist |
| role | string | Role of the member — always `pharmacist` for now |
| status | string | Membership status: `active` or `inactive` |
| joinedAt | string | Date the pharmacist joined the pharmacy (YYYY-MM-DD) |

---

## Invitations

### `POST /api/invitations`

Creates a new invitation — a pharmacy owner invites a pharmacist to join their pharmacy via email.

**Request Body**
```json
{
  "pharmacyId": "p1",
  "inviteeEmail": "newpharmacist@example.com",
  "role": "pharmacist"
}
```

**Request — Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| pharmacyId | string | ✅ Yes | ID of the pharmacy sending the invitation |
| inviteeEmail | string | ✅ Yes | Email address of the pharmacist being invited |
| role | string | ✅ Yes | Role being assigned — `pharmacist` |

**Response — Success (201)**
```json
{
  "id": "inv1",
  "pharmacyId": "p1",
  "pharmacyName": "City Pharmacy",
  "inviteeEmail": "newpharmacist@example.com",
  "role": "pharmacist",
  "status": "pending",
  "token": "a1b2c3d4e5f6...",
  "expiresAt": "2026-08-01",
  "createdAt": "2026-07-25"
}
```

**Response — Fields**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the invitation |
| pharmacyId | string | ID of the pharmacy that sent the invitation |
| pharmacyName | string | Name of the pharmacy |
| inviteeEmail | string | Email address of the invited pharmacist |
| role | string | Role being assigned |
| status | string | Invitation status: `pending`, `accepted`, or `expired` |
| token | string | Unique token sent to the pharmacist via email to accept the invitation |
| expiresAt | string | Date the invitation expires (YYYY-MM-DD) |
| createdAt | string | Date the invitation was created (YYYY-MM-DD) |

**Response — Bad Request (400)**
```json
{
  "error": "pharmacyId, inviteeEmail and role are required"
}
```

**Response — Conflict (409)**
```json
{
  "error": "An invitation has already been sent to this email for this pharmacy"
}
```

**Notes**
- When an invitation is created, the system sends an email to the pharmacist with a link containing the token
- The token expires after 7 days
- If the same email is invited to the same pharmacy again, a 409 conflict error is returned

---

### `POST /api/invitations/:token/accept`

Accepts an invitation using the token from the invitation email. Creates a membership record for the pharmacist.

**Request**
- URL parameter: `token` (string) — the unique token from the invitation email
- No request body required

**Example**
```
POST /api/invitations/a1b2c3d4e5f6.../accept
```

**Response — Success (201)**
```json
{
  "message": "Invitation accepted successfully. You are now a member of City Pharmacy.",
  "membership": {
    "id": "m2",
    "pharmacyId": "p1",
    "pharmacyName": "City Pharmacy",
    "userId": "u2",
    "userFullName": "Sara Ali",
    "userEmail": "newpharmacist@example.com",
    "role": "pharmacist",
    "status": "active",
    "joinedAt": "2026-07-25"
  }
}
```

**Response — Not Found (404)**
```json
{
  "error": "Invitation not found or invalid token"
}
```

**Response — Bad Request (400)**
```json
{
  "error": "This invitation has already been accepted"
}
```

**Response — Bad Request (400)**
```json
{
  "error": "This invitation has expired"
}
```

**Notes**
- Once accepted, the invitation status changes to `accepted` and a new membership record is created
- An expired or already accepted token cannot be used again
- The pharmacist must be logged in (via Clerk) when accepting — their user ID is taken from the auth session, not the request body

---