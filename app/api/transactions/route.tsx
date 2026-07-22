import { NextResponse } from "next/server";
import { transactions } from "../../../lib/data/transactions";
import { inventory } from "../../../lib/data/inventory";

// GET — list all transactions with optional filters
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const inventoryId = searchParams.get("inventoryId");

  let result = transactions;

  if (type) {
    result = result.filter((t) => t.type === type);
  }

  if (inventoryId) {
    result = result.filter((t) => t.inventoryId === inventoryId);
  }

  return NextResponse.json(result);
}

// POST — create a new transaction and update inventory quantity
export async function POST(request: Request) {
  const body = await request.json();
  const { type, inventoryId, quantity, notes } = body;

  // Validate required fields
  if (!type || !inventoryId || !quantity) {
    return NextResponse.json(
      { error: "type, inventoryId and quantity are required" },
      { status: 400 }
    );
  }

  // Validate transaction type
  if (!["stock_in", "dispense", "damage"].includes(type)) {
    return NextResponse.json(
      { error: "type must be stock_in, dispense or damage" },
      { status: 400 }
    );
  }

  // Find the inventory item
  const inventoryIndex = inventory.findIndex(
    (item) => item.id === inventoryId
  );

  if (inventoryIndex === -1) {
    return NextResponse.json(
      { error: "Inventory item not found" },
      { status: 404 }
    );
  }

  const inventoryItem = inventory[inventoryIndex];

  // Calculate new quantity based on transaction type
  let newQuantity = inventoryItem.quantity;

  if (type === "stock_in") {
    // Stock in — quantity goes up
    newQuantity = inventoryItem.quantity + quantity;
  } else if (type === "dispense" || type === "damage") {
    // Dispense or damage — quantity goes down
    newQuantity = inventoryItem.quantity - quantity;

    // Make sure quantity doesn't go below zero
    if (newQuantity < 0) {
      return NextResponse.json(
        {
          error: `Not enough stock. Current quantity is ${inventoryItem.quantity}, requested ${quantity}.`,
        },
        { status: 400 }
      );
    }
  }

  // Update the inventory quantity
  inventory[inventoryIndex] = {
    ...inventoryItem,
    quantity: newQuantity,
  };

  // Create the transaction record
  const newTransaction = {
    id: `t${transactions.length + 1}`,
    type,
    inventoryId,
    medicationName: inventoryItem.medicationName,
    pharmacyName: inventoryItem.pharmacyName,
    quantity,
    notes: notes || "",
    date: new Date().toISOString().split("T")[0],
  };

  transactions.push(newTransaction);

  return Response.json(
    {
      transaction: newTransaction,
      updatedInventory: {
        id: inventoryItem.id,
        medicationName: inventoryItem.medicationName,
        previousQuantity: inventoryItem.quantity,
        newQuantity,
      },
    },
    { status: 201 }
  );
}