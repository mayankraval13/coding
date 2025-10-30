import dotenv from "dotenv";
dotenv.config();
export default async function handler(req, res) {
  const docUrl = process.env.GOOGLE_DOC_URL;

  try {
    const response = await fetch(docUrl);
    const html = await response.text();

    text = text.replace(/<div id="header"[\s\S]*?<\/div>/, ""); // common pattern
    text = text.replace(
      /Report abuse|Learn more|Updated automatically every 5 minutes/gi,
      ""
    );

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (err) {
    console.error("Error fetching Google Doc:", err);
    res.status(500).send("Error fetching document");
  }
}
