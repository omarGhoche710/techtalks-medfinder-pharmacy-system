import { db } from "@/lib/db";
import { haversineKm } from "@/lib/geo";
import { handleError } from "@/lib/utils";
import type { SearchResult } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";


function formatStockStatus(stock: number) {
  if (stock <= 0) return "out_of_stock";
  if (stock < 20) return "low_stock";
  return "in_stock";
}


function formatPharmacyHours(hours: any) {

  if (!hours) return "Not available";


  const days = [
    ["Mon", hours.monday_open, hours.monday_close],
    ["Tue", hours.tuesday_open, hours.tuesday_close],
    ["Wed", hours.wednesday_open, hours.wednesday_close],
    ["Thu", hours.thursday_open, hours.thursday_close],
    ["Fri", hours.friday_open, hours.friday_close],
    ["Sat", hours.saturday_open, hours.saturday_close],
    ["Sun", hours.sunday_open, hours.sunday_close],
  ];


  const times = days
    .filter(
      ([, open, close]) => open && close
    )
    .map(
      ([day, open, close]) =>
        `${day} ${open}-${close}`
    );


  if (times.length === 0)
    return "Not available";


  return Array.from(new Set(times))
    .slice(0, 3)
    .join(", ");
}



export async function GET(
  request: NextRequest
) {

  try {


    const params =
      request.nextUrl.searchParams;


    const query =
      params.get("q")?.trim() ?? "";


    const nearMe =
      params.get("nearMe") === "true";


    const lat =
      Number(params.get("lat"));


    const lng =
      Number(params.get("lng"));



    const hasLocation =
      Number.isFinite(lat) &&
      Number.isFinite(lng);



    if (!query) {

      return NextResponse.json({
        results: [],
        query,
        nearMe,
        total: 0
      });

    }



    const medications =
      await db.medication.findMany({

        where: {
          OR: [

            {
              name: {
                contains: query,
                mode: "insensitive"
              }
            },


            {
              code: {
                contains: query,
                mode: "insensitive"
              }
            },


            {
              pharmacy: {
                is: {
                  name: {
                    contains: query,
                    mode: "insensitive"
                  }
                }
              }
            }

          ]
        },


        include: {
          pharmacy: {
            include: {
              openingHours: true
            }
          }
        },


        orderBy: {
          created_at: "desc"
        }

      });





    let results: SearchResult[] =
      medications.map((med) => {


        const pharmacy =
          med.pharmacy;


        const distanceKm =
          hasLocation
            ?
            haversineKm(
              lat,
              lng,
              pharmacy.lat,
              pharmacy.lng
            )
            :
            null;



        let daysToExpiry: null | number = null;


        if (med.date_expired) {

          const diff =
            new Date(med.date_expired).getTime()
            -
            Date.now();


          daysToExpiry =
            Math.max(
              0,
              Math.ceil(
                diff / (1000 * 60 * 60 * 24)
              )
            );

        }




        return {


          id: med.id,


          medicineName: med.name,


          medicineCode: med.code,


          pharmacy: {
            id: pharmacy.id,
            name: pharmacy.name,
            address: pharmacy.address,
            lat: pharmacy.lat,
            lng: pharmacy.lng,
            phone: pharmacy.phone,
            hours:
              formatPharmacyHours(
                pharmacy.openingHours
              )
          },


          price:
            med.discounted_price ??
            med.price,


          originalPrice:
            med.price,


          stock:
            formatStockStatus(
              med.stock
            ),


          quantity:
            med.stock,


          distanceKm,


          description:
            med.description ?? "",


          daysToExpiry

        };


      });





    if (
      nearMe &&
      hasLocation
    ) {

      const MAX_DISTANCE = 200;


      results =
        results.filter(
          r =>
            r.distanceKm !== null &&
            r.distanceKm <= MAX_DISTANCE
        );



      results.sort(
        (a, b) =>
          (a.distanceKm ?? Infinity)
          -
          (b.distanceKm ?? Infinity)
      );


    }





    return NextResponse.json({

      results,

      query,

      nearMe,

      total: results.length

    });



  }
  catch (error) {

    console.error(error);

    handleError(error);


    return NextResponse.json(
      {
        error:
          "Search service temporarily unavailable."
      },
      {
        status: 500
      }
    );

  }

}