export default async function handler(req, res) {
  const path = Array.isArray(req.query.path)
    ? req.query.path.join("/")
    : req.query.path || "";

  const target = `http://16.170.187.200:8000/${path}`;

  const headers = {};
  if (req.headers.authorization) {
    headers["Authorization"] = req.headers.authorization;
  }
  if (req.headers["content-type"]) {
    headers["Content-Type"] = req.headers["content-type"];
  }

  let body = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      body = new URLSearchParams(req.body).toString();
    } else if (contentType.includes("application/json")) {
      body = JSON.stringify(req.body);
    } else {
      body = req.body;
    }
  }

  try {
    const response = await fetch(target, {
      method: req.method,
      headers,
      body,
    });

    const contentType = response.headers.get("content-type") || "";
    const data = await response.text();

    res.setHeader("Content-Type", contentType);
    res.status(response.status).send(data);
  } catch (error) {
    res.status(502).json({ error: "Backend unreachable" });
  }
}
