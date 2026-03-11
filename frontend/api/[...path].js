export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  const path = Array.isArray(req.query.path)
    ? req.query.path.join("/")
    : req.query.path || "";

  const target = `http://16.170.187.200:8000/${path}`;

  const headers = {};
  if (req.headers.authorization) {
    headers["Authorization"] = req.headers.authorization;
  }

  let body = undefined;
  const contentType = req.headers["content-type"] || "";

  if (req.method !== "GET" && req.method !== "HEAD") {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      if (typeof req.body === "object") {
        body = new URLSearchParams(req.body).toString();
      } else {
        body = req.body;
      }
    } else if (contentType.includes("application/json")) {
      headers["Content-Type"] = "application/json";
      body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    } else {
      headers["Content-Type"] = contentType;
      body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }
  }

  try {
    const response = await fetch(target, {
      method: req.method,
      headers,
      body,
    });

    const respContentType = response.headers.get("content-type") || "";
    const data = await response.text();

    res.setHeader("Content-Type", respContentType);
    res.status(response.status).send(data);
  } catch (error) {
    res.status(502).json({ error: "Backend unreachable" });
  }
}
