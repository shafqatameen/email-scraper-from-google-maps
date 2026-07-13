import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, format } = body;

  if (!data || !Array.isArray(data)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const rows = data.map(
    (b: {
      name: string;
      emails: string[];
      phone: string;
      website: string;
      address: string;
      rating: string;
      reviews: string;
      category: string;
    }) => ({
      Name: b.name,
      Emails: b.emails?.join(", ") || "",
      Phone: b.phone,
      Website: b.website,
      Address: b.address,
      Rating: b.rating,
      Reviews: b.reviews,
      Category: b.category,
    })
  );

  if (format === "csv") {
    const headers = Object.keys(rows[0] || {});
    const csvLines = [
      headers.join(","),
      ...rows.map((row: Record<string, string>) =>
        headers
          .map((h) => `"${String(row[h] || "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];
    const csv = csvLines.join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="maps-emails-${Date.now()}.csv"`,
      },
    });
  }

  if (format === "excel") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Results");

    sheet.columns = [
      { header: "Name", key: "Name", width: 30 },
      { header: "Emails", key: "Emails", width: 40 },
      { header: "Phone", key: "Phone", width: 20 },
      { header: "Website", key: "Website", width: 35 },
      { header: "Address", key: "Address", width: 40 },
      { header: "Rating", key: "Rating", width: 10 },
      { header: "Reviews", key: "Reviews", width: 12 },
      { header: "Category", key: "Category", width: 25 },
    ];

    // Style header row
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1C2541" },
    };

    sheet.addRows(rows);

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="maps-emails-${Date.now()}.xlsx"`,
      },
    });
  }

  return NextResponse.json({ error: "Invalid format" }, { status: 400 });
}
