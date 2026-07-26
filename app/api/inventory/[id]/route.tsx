import { inventory } from "../../../../lib/data/inventory";

// PATCH — update an existing inventory batch
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // Find the item
  const index = inventory.findIndex((item) => item.id === id);

  if (index === -1) {
    return Response.json(
      { error: "Inventory item not found" },
      { status: 404 }
    );
  }

  // Update only the fields that were sent
  const updatedItem = {
    ...inventory[index],
    ...(body.code && { code: body.code }),
    ...(body.quantity && { quantity: body.quantity }),
    ...(body.price && { price: body.price }),
    ...(body.expiryDate && { expiryDate: body.expiryDate }),
  };

  // Save the updated item back to the array
  inventory[index] = updatedItem;

  return Response.json(updatedItem);
}

// DELETE — remove an inventory batch
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Find the item
  const index = inventory.findIndex((item) => item.id === id);

  if (index === -1) {
    return Response.json(
      { error: "Inventory item not found" },
      { status: 404 }
    );
  }

  // Remove the item from the array
  const deletedItem = inventory[index];
  inventory.splice(index, 1);

  return Response.json({
    message: "Inventory item deleted successfully",
    deletedItem,
  });
}