export default async function handler(req, res) {
  try {
    const response = await fetch(process.env.DOC_URL);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    let html = await response.text();

    // Use DOMParser via JSDOM (if supported) OR simple regex fallback
    try {
      // This regex removes the entire header section that includes “Published using Google Docs”
      html = html.replace(
        /<div[^>]*>Published using Google Docs[\s\S]*?<\/div>/i,
        ""
      );
      html = html.replace(
        /Report abuse|Learn more|Updated automatically every 5 minutes/gi,
        ""
      );
    } catch (innerErr) {
      console.warn("Sanitization skipped:", innerErr);
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (err) {
    console.error("Error fetching document:", err);
    res.status(500).send("Error fetching document");
  }
}
