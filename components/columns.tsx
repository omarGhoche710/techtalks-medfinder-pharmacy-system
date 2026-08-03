"use client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import EditIcon from '@iconify-react/mynaui/edit';
import { Medication } from "@/data/medications";
import { Button } from "./ui/button";

function SortableHeader({
    label,
    column,
}: {
    label: string;
    column: any;
}) {
    return (
        <div className="flex justify-center">
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="h-auto p-0 text-xs font-medium uppercase tracking-wide text-[#6B7280] hover:bg-transparent hover:text-[#2563EB]"
            >
                {label}
                <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
            </Button>
        </div>
    )
}

function PlainHeader({ label }: { label: string }) {
    return (
        <div className="text-center text-xs font-medium uppercase tracking-wide text-[#6B7280]">
            {label}
        </div>
    )
}

export function columns(onEdit: (Medication: Medication) => void): ColumnDef<Medication>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <div className="flex justify-center">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                        className="border-[#E5E7EB] data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB] data-[state=indeterminate]:bg-[#2563EB] data-[state=indeterminate]:border-[#2563EB]"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                        className="border-[#E5E7EB] data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB]"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "code",
            header: () => <PlainHeader label="Code" />,
            cell: ({ row }) => <div className="text-center text-[#111827]">{row.getValue("code")}</div>,
        },
        {
            accessorKey: "image",
            header: () => <PlainHeader label="Image" />,
            cell: ({ row }) => <div className="flex justify-center">{row.getValue("image")}</div>,
        },
        {
            accessorKey: "name",
            header: ({ column }) => <SortableHeader label="Name" column={column} />,
            cell: ({ row }) => <div className="text-center font-medium text-[#111827]">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "stock",
            header: ({ column }) => <SortableHeader label="Quantity" column={column} />,
            cell: ({ row }) => <div className="text-center text-[#111827]">{row.getValue("stock")}</div>,
        },
        {
            accessorKey: "price",
            header: () => <PlainHeader label="Original price" />,
            cell: ({ row }) => {
                const price = parseFloat(row.getValue("price"))
                const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                }).format(price)

                return <div className="text-center font-medium text-[#111827]">{formatted}</div>
            }, //make this display on hover "price before discount"
        },
        {
            accessorKey: "expiry",
            header: ({ column }) => <SortableHeader label="Expiry" column={column} />,
            cell: ({ row }) => {
                const expiry: Date = new Date(row.getValue("expiry") as string);
                const formattedDate = expiry.toLocaleDateString('en-GB');
                return <div className="text-center font-medium text-[#111827]">{formattedDate}</div>
            }
        },
        {
            accessorKey: "description",
            header: () => <PlainHeader label="Description" />,
            cell: ({ row }) => <div className="text-center text-[#111827]">{row.getValue("description")}</div>, //this contains a link to view further description and ingredients
        },
        {
            accessorKey: "discount_percentage",
            header: () => <PlainHeader label="Discount" />,
            cell: ({ row }) => <div className="text-center text-[#111827]">{row.getValue("discount_percentage")}%</div>,
        },
        {
            accessorKey: "discounted_price",
            header: () => <PlainHeader label="Discount price" />,
            cell: ({ row }) => {
                const price = parseFloat(row.getValue("discounted_price"))
                const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                }).format(price)

                return <div className="text-center font-medium text-[#111827]">{formatted}</div>
            }, //make this display on hover "price after discount"
        },
        {
            id: "actions",
            header: () => <PlainHeader label="Actions" />,
            cell: ({ row }) => {
                return (
                    <div className="flex justify-center">
                        <button
                            onClick={() => onEdit(row.original)}
                            className="text-[#6B7280] transition-colors hover:text-[#2563EB]"
                            aria-label="Edit medication"
                        >
                            <EditIcon height="1.5em" />
                        </button>
                    </div>
                );
            },
        }
    ]
}