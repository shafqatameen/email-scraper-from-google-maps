import { NextRequest } from "next/server";
import { scrapeGoogleMaps } from "@/lib/mapsScraper";
import { extractEmails } from "@/lib/emailExtractor";
import { isGoogleMapsUrl } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { query, url, limit = 20 } = body;

  const input = url && isGoogleMapsUrl(url) ? url : query;

  if (!input) {
    return new Response(JSON.stringify({ error: "No query or URL provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        send({ type: "start", message: "Scraping Google Maps..." });

        let count = 0;
        for await (const business of scrapeGoogleMaps(input, limit)) {
          // Enrich with emails from website
          if (business.website) {
            send({
              type: "progress",
              message: `Extracting emails from ${business.name}...`,
              id: business.id,
            });
            business.emails = await extractEmails(business.website);
          }

          send({ type: "result", data: business });
          count++;
        }

        send({ type: "done", total: count });
      } catch (err: unknown) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
