export const transactions: {
  id: string;
  type: "stock_in" | "dispense" | "damage";
  inventoryId: string;
  medicationName: string;
  pharmacyName: string;
  quantity: number;
  notes: string;
  date: string;
}[] = [
  {
    id: "t1",
    type: "stock_in",
    inventoryId: "1",
    medicationName: "Paracetamol",
    pharmacyName: "City Pharmacy",
    quantity: 50,
    notes: "New stock arrived from supplier",
    date: "2026-06-01",
  },
  {
    id: "t2",
    type: "dispense",
    inventoryId: "2",
    medicationName: "Amoxicillin",
    pharmacyName: "City Pharmacy",
    quantity: 5,
    notes: "Dispensed to customer Ahmed Hassan",
    date: "2026-06-05",
  },
  {
    id: "t3",
    type: "damage",
    inventoryId: "3",
    medicationName: "Paracetamol",
    pharmacyName: "Green Cross Pharmacy",
    quantity: 10,
    notes: "Damaged during storage — dropped and broken",
    date: "2026-06-10",
  },
];