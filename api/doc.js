// api/doc.js
// Serverless handler that fetches your published Google Doc safely and gives diagnostics.
// Do NOT return the Google Docs URL to clients.
// Make sure you set DOC_URL in Vercel Environment Variables (or .env for local testing).

// For local testing with .env, install dotenv and uncomment next line:
// import 'dotenv/config';

export default async function handler(req, res) {
  const docUrl = process.env.DOC_URL;
  if (!docUrl) {
    console.error("DOC_URL is not set in environment variables");
    return res
      .status(500)
      .json({ error: "Server misconfiguration: DOC_URL not set" });
  }

  try {
    // Try fetching with a browser-like header and following redirects
    const response = await fetch(docUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        // Some servers respond better to a sensible user agent
        "User-Agent": "Mozilla/5.0 (compatible; MyDocFetcher/1.0)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      // you can add a timeout wrapper if your environment supports AbortController
    });

    // Log status for debugging (server side only)
    console.log(
      `Fetch to DOC_URL returned status: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      // Get a short text body for diagnostics, but never echo the full body to the client
      const errText = await response.text().catch(() => "");
      console.error(
        "Fetch failed. Status:",
        response.status,
        "Snippet:",
        errText.slice(0, 400)
      );
      return res.status(502).json({
        error: "Failed to fetch document from Google Docs",
        status: response.status,
        note: "Check sharing settings and DOC_URL value",
      });
    }

    // Get the HTML
    let html = await response.text();

    // Simple sanitization: remove the Google "Published using Google Docs" banner if present.
    // This replace is non-fatal — if it doesn't match, nothing happens.
    try {
      // remove top bar container by common patterns (safe no-throw)
      html = html.replace(
        /<div[^>]*>\s*Published using Google Docs[\s\S]*?<\/div>/i,
        ""
      );
      html = html.replace(
        /Report abuse|Learn more|Updated automatically every 5 minutes/gi,
        ""
      );
    } catch (sanitizeErr) {
      console.warn("Sanitization step failed but continuing:", sanitizeErr);
    }

    // Send the cleaned HTML to the client
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (err) {
    // Log full error server-side
    console.error("Unexpected error fetching DOC_URL:", err);

    // Return safe diagnostics to client (no secrets)
    return res.status(500).json({
      error: "Error fetching document",
      message:
        "See server logs for details. Possible causes: DOC_URL not published, incorrect URL, network error, or Google blocking the request.",
    });
  }
}
