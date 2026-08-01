import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";

// =====================================================
// Calculate Distance (Haversine Formula)
// =====================================================

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// =====================================================
// GET
// Transfer Matching Engine
//
// Query:
// ?pharmacy_id=
// &medication_id=
//
// Business Rules:
// - Source pharmacy must exist
// - Medication must exist
// - Find all approved pharmacies except the source
// - Calculate distance
// - Check whether they already stock the same medication
// - Lower stock => Higher demand
// - Rank pharmacies
// - Return best recommendation
// =====================================================

export async function GET(req: NextRequest) {
  try {
    const pharmacy_id = req.nextUrl.searchParams.get("pharmacy_id");
    const medication_id = req.nextUrl.searchParams.get("medication_id");

    // --------------------------------------
    // Validate Query Parameters
    // --------------------------------------

    if (!pharmacy_id || !medication_id) {
      return NextResponse.json(
        {
          message: "pharmacy_id and medication_id are required.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Source Pharmacy
    // --------------------------------------

    const pharmacy = await db.pharmacy.findUnique({
      where: {
        id: pharmacy_id,
      },
    });

    if (!pharmacy) {
      return NextResponse.json(
        {
          message: "Pharmacy not found.",
        },
        {
          status: 404,
        },
      );
    }

    // --------------------------------------
    // Medication
    // --------------------------------------

    const medication = await db.medication.findUnique({
      where: {
        id: medication_id,
      },
    });

    if (!medication) {
      return NextResponse.json(
        {
          message: "Medication not found.",
        },
        {
          status: 404,
        },
      );
    }

    // --------------------------------------
    // Candidate Pharmacies
    // --------------------------------------

    const candidates = await db.pharmacy.findMany({
      where: {
        id: {
          not: pharmacy_id,
        },
        is_approved: true,
      },
      include: {
        medications: true,
      },
    });

    // --------------------------------------
    // Ranking
    // --------------------------------------

    const ranked = candidates.map((candidate) => {
      const distance = calculateDistance(
        pharmacy.lat,
        pharmacy.lng,
        candidate.lat,
        candidate.lng,
      );

      // Does this pharmacy already sell the same medication?
      const sameMedication = candidate.medications.find(
        (m) => m.name === medication.name,
      );

      const stock = sameMedication?.stock ?? 0;

      let score = 100;

      // closer pharmacies are preferred
      score -= distance;

      // lower stock = higher demand
      score += Math.max(0, 50 - stock);

      // bonus if they already stock the medication
      if (sameMedication) {
        score += 25;
      }

      return {
        pharmacy_id: candidate.id,
        pharmacy_name: candidate.name,
        distance_km: Number(distance.toFixed(2)),
        current_stock: stock,
        has_same_medication: !!sameMedication,
        score: Number(score.toFixed(2)),
      };
    });

    // --------------------------------------
    // Sort by Best Score
    // --------------------------------------

    ranked.sort((a, b) => b.score - a.score);

    // --------------------------------------
    // Best Recommendation
    // --------------------------------------

    const recommendedTarget = ranked.length > 0 ? ranked[0] : null;

    return NextResponse.json(
      {
        recommended_target: recommendedTarget,
        other_candidates: ranked.slice(1),
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    handleError(error);

    return NextResponse.json(
      {
        message: "Failed to generate transfer recommendations.",
      },
      {
        status: 500,
      },
    );
  }
}
