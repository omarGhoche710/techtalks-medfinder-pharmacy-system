export type Medication = {
  id: string;
  name: string;
  code: string;
  quantity: number;
  expiry: string;
  description: string;
  imageColor: string;
};

export const medications: Medication[] = [
  {
    id: "1",
    name: "Paracetamol",
    code: "PARACIP-500",
    quantity: 120,
    expiry: "02/2027",
    description: "Pain reliever and fever reducer. Store in a cool, dry place.",
    imageColor: "#f97316",
  },
  {
    id: "2",
    name: "Amoxicillin",
    code: "AMOXIL-250",
    quantity: 85,
    expiry: "08/2029",
    description: "Antibiotic used to treat bacterial infections.",
    imageColor: "#3b82f6",
  },
  {
    id: "3",
    name: "Ibuprofen",
    code: "IBU-400",
    quantity: 200,
    expiry: "11/2026",
    description: "Nonsteroidal anti-inflammatory drug for pain and inflammation.",
    imageColor: "#ef4444",
  },
  {
    id: "4",
    name: "Metformin",
    code: "MET-500",
    quantity: 64,
    expiry: "05/2028",
    description: "Oral diabetes medicine that helps control blood sugar levels.",
    imageColor: "#8b5cf6",
  },
  {
    id: "5",
    name: "Omeprazole",
    code: "OME-20",
    quantity: 45,
    expiry: "03/2027",
    description: "Proton pump inhibitor used to treat acid reflux and ulcers.",
    imageColor: "#10b981",
  },
  {
    id: "6",
    name: "Loratadine",
    code: "LORA-10",
    quantity: 150,
    expiry: "09/2028",
    description: "Antihistamine for relief of allergy symptoms.",
    imageColor: "#06b6d4",
  },
  {
    id: "7",
    name: "Aspirin",
    code: "ASP-100",
    quantity: 300,
    expiry: "01/2029",
    description: "Salicylate used to reduce pain, fever, and inflammation.",
    imageColor: "#ec4899",
  },
  {
    id: "8",
    name: "Cetirizine",
    code: "CET-10",
    quantity: 90,
    expiry: "07/2027",
    description: "Second-generation antihistamine for hay fever and hives.",
    imageColor: "#f59e0b",
  },
];
