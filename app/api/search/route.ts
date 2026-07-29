import { db } from "@/lib/db";
import { haversineKm } from "@/lib/geo";
import { handleError } from "@/lib/utils";
import type { SearchResult, SearchParams } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

function formatStockStatus(stock: number) {
  if (stock <= 0) return "out_of_stock";
  if (stock < 20) return "low_stock";
  return "in_stock";
}

function formatPharmacyHours(hours: any) {
  if (!hours) return "Not available";

  const times = [
    hours.monday_open && hours.monday_close
      ? `Mon ${hours.monday_open}-${hours.monday_close}`
      : null,
    hours.tuesday_open && hours.tuesday_close
      ? `Tue ${hours.tuesday_open}-${hours.tuesday_close}`
      : null,
    hours.wednesday_open && hours.wednesday_close
      ? `Wed ${hours.wednesday_open}-${hours.wednesday_close}`
      : null,
    hours.thursday_open && hours.thursday_close
      ? `Thu ${hours.thursday_open}-${hours.thursday_close}`
      : null,
    hours.friday_open && hours.friday_close
      ? `Fri ${hours.friday_open}-${hours.friday_close}`
      : null,
    hours.saturday_open && hours.saturday_close
      ? `Sat ${hours.saturday_open}-${hours.saturday_close}`
      : null,
    hours.sunday_open && hours.sunday_close
      ? `Sun ${hours.sunday_open}-${hours.sunday_close}`
      : null,
  ].filter((entry): entry is string => Boolean(entry));

  if (times.length === 0) {
    return "Not available";
  }

  const uniqueTimes = Array.from(new Set(times));
  return uniqueTimes.length === 1
    ? uniqueTimes[0]
    : uniqueTimes.slice(0, 3).join(", ");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("q")?.trim() ?? "";
    const nearMe = searchParams.get("nearMe") === "true";
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!query) {
      return NextResponse.json(
        { results: [], query, nearMe, total: 0 },
        { status: 200 },
      );
    }

    const parsedLat = lat ? parseFloat(lat) : undefined;
    const parsedLng = lng ? parseFloat(lng) : undefined;

    const medications = await db.medication.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            code: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            pharmacy: {
              is: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },
      include: {
        pharmacy: {
          include: {
            openingHours: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const results: SearchResult[] = medications.map((medication) => {
      const pharmacy = medication.pharmacy;
      const distanceKm =
        nearMe && parsedLat !== undefined && parsedLng !== undefined
          ? haversineKm(parsedLat, parsedLng, pharmacy.lat, pharmacy.lng)
          : null;
      // compute days to expiry if available
      let daysToExpiry: number | null = null;
      if (medication.date_expired) {
        const now = new Date();
        const exp = new Date(medication.date_expired);
        const msPerDay = 1000 * 60 * 60 * 24;
        daysToExpiry = Math.ceil((exp.getTime() - now.getTime()) / msPerDay);
      }

      return {
        id: medication.id,
        medicineName: medication.name,
        medicineCode: medication.code,
        pharmacy: {
          id: pharmacy.id,
          name: pharmacy.name,
          address: pharmacy.address,
          lat: pharmacy.lat,
          lng: pharmacy.lng,
          phone: pharmacy.phone,
          hours: formatPharmacyHours(pharmacy.openingHours),
        },
        price: medication.discounted_price ?? medication.price,
        originalPrice: medication.price,
        stock: formatStockStatus(medication.stock),
        quantity: medication.stock,
        distanceKm,
        description: medication.description ?? "",
        daysToExpiry,
      };
    });

    if (nearMe && parsedLat !== undefined && parsedLng !== undefined) {
      results.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    return NextResponse.json({
      results,
      query,
      nearMe,
      total: results.length,
    });
  } catch (error) {
    console.error(error);
    handleError(error);
    return NextResponse.json(
      { error: "Search service temporarily unavailable." },
      { status: 500 },
    );
  }
}
