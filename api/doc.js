import dotenv from "dotenv";
dotenv.config();
const docUrl = process.env.GOOGLE_DOC_URL;
export default async function handler(req, res) {
  try {
    const response = await fetch(docUrl);
    const html = await response.text();

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (err) {
    console.error("Error fetching Google Doc:", err);
    res.status(500).send("Error fetching document");
  }
}
