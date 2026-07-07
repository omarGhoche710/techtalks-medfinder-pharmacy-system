"use client"
import { ColumnDef } from "@tanstack/react-table"
import EditIcon from '@iconify-react/mynaui/edit';

export type medicine = {
    code: number,
    image: string
    name: string
    stock: number
    expiry: Date
    description: string
    price: number,
    discount_percentage: number,
    discounted_price: number,
}

export function columns(onEdit: (medicine: medicine) => void): ColumnDef<medicine>[] {
    return [
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
            header: "Name",
        },
        {
            accessorKey: "stock",
            header: "Quantity",
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
            header: () => <div className="text-right">Expiry</div>,
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