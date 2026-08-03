export type Medication = {
    id: string;
    name: string;
    code: string;
    stock: number;
    status: string;
    price: number;
    expiry: Date;
    description: string;
    imageColor: string;
    discount_percentage?: number | null;
    discounted_price?: number | null;
};

export const medications: Medication[] = [
    {
        id: "1",
        name: "Paracetamol",
        code: "PARACIP-500",
        stock: 120,
        status: "active",
        price: 1.5,
        expiry: new Date("2027-02-01"),
        description: "Pain reliever and fever reducer. Store in a cool, dry place.",
        imageColor: "#f97316",
    },
    {
        id: "2",
        name: "Amoxicillin",
        code: "AMOXIL-250",
        stock: 85,
        status: "active",
        price: 5,
        expiry: new Date("2029-08-01"),
        description: "Antibiotic used to treat bacterial infections.",
        imageColor: "#3b82f6",
    },
    {
        id: "3",
        name: "Ibuprofen",
        code: "IBU-400",
        stock: 200,
        status: "active",
        price: 6,
        expiry: new Date("2026-11-01"),
        description: "Nonsteroidal anti-inflammatory drug for pain and inflammation.",
        imageColor: "#ef4444",
    },
    {
        id: "4",
        name: "Metformin",
        code: "MET-500",
        stock: 64,
        status: "active",
        price: 0.25,
        expiry: new Date("2028-05-1"),
        description: "Oral diabetes medicine that helps control blood sugar levels.",
        imageColor: "#8b5cf6",
    },
    {
        id: "5",
        name: "Omeprazole",
        code: "OME-20",
        stock: 45,
        status: "active",
        price: 4.97,
        expiry: new Date("2027-03-01"),
        description: "Proton pump inhibitor used to treat acid reflux and ulcers.",
        imageColor: "#10b981",
    },
    {
        id: "6",
        name: "Loratadine",
        code: "LORA-10",
        stock: 150,
        status: "active",
        price: 8,
        expiry: new Date("2028-09-01"),
        description: "Antihistamine for relief of allergy symptoms.",
        imageColor: "#06b6d4",
    },
    {
        id: "7",
        name: "Aspirin",
        code: "ASP-100",
        stock: 300,
        status: "active",
        price: 5,
        expiry: new Date("2029-01-01"),
        description: "Salicylate used to reduce pain, fever, and inflammation.",
        imageColor: "#ec4899",
    },
    {
        id: "8",
        name: "Cetirizine",
        code: "CET-10",
        stock: 90,
        status: "active",
        price: 3,
        expiry: new Date("2027-02-01"),
        description: "Second-generation antihistamine for hay fever and hives.",
        imageColor: "#f59e0b",
    },
    {
        id: "9",
        name: "Naprosyn",
        code: "CET-10",
        stock: 90,
        status: "expired",
        price: 7,
        expiry: new Date("2025-07-01"),
        description: "nonsteroidal anti-inflammatory drug (NSAID) used to treat arthritis, pain, and inflammation.",
        imageColor: "#c8ff00",
    },
    {
        id: "10",
        name: "Atorvastatin",
        code: "C10AA05",
        stock: 90,
        status: "near expiry",
        price: 6,
        expiry: new Date("2026-08-01"),
        description: "lower cholesterol and triglyceride (fats) levels in the blood.",
        imageColor: "#00ff2f",
    },
];