"use client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import EditIcon from '@iconify-react/mynaui/edit';
import { Medication } from "@/data/medications";
import { Button } from "./ui/button";



export function columns(onEdit: (Medication: Medication) => void): ColumnDef<Medication>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "code",
            header: "Code",
        },
        {
            accessorKey: "image",
            header: "Image",
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "stock",
            header: ({ column }) => {
                return (
                    <Button variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Quantity
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "price",
            //header: "Original Price",
            header: () => <div className="text-right">Original Price</div>,
            cell: ({ row }) => {
                const price = parseFloat(row.getValue("price"))
                const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                }).format(price)

                return <div className="text-right font-medium">{formatted}</div>
            }, //make this display on hover "price before discount"
        },
        {
            accessorKey: "expiry",
            //header: "Expiry",
            header: ({ column }) => {
                return (
                    <Button variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Expiry
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const expiry: Date = new Date(row.getValue("expiry") as string);
                const formattedDate = expiry.toLocaleDateString('en-GB');
                return <div className="text-right font-medium">{formattedDate}</div>
            }
        },
        {
            accessorKey: "description",
            header: "Description", //this contains a link to view further description and ingredients
        },
        {
            accessorKey: "discount_percentage",
            header: "Discount",
        },
        {
            accessorKey: "discounted_price",
            //header: "Original Price",
            header: () => <div className="text-right">Discount Price</div>,
            cell: ({ row }) => {
                const price = parseFloat(row.getValue("discounted_price"))
                const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                }).format(price)

                return <div className="text-right font-medium">{formatted}</div>
            }, //make this display on hover "price after discount"
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                return (
                    <div className="text-right">
                        <button onClick={() => onEdit(row.original)}>
                            <EditIcon height="2em" />
                        </button>
                    </div>
                );
            },
        }
    ]
}