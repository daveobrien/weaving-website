const http = require("http");
const path = require("path");
const fs = require("fs");

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const relativePath =
    urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  
  // Check if it's an image request from the root images folder
  let filePath;
  if (relativePath.startsWith("images/")) {
    const imagesDir = path.join(__dirname, "images");
    filePath = path.resolve(imagesDir, relativePath.replace("images/", ""));
    
    // Security check: ensure file is within images directory
    if (!filePath.startsWith(imagesDir + path.sep)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
  } else {
    filePath = path.resolve(publicDir, relativePath);
    
    // Security check: ensure file is within public directory
    if (!filePath.startsWith(publicDir + path.sep)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(err && err.code === "ENOENT" ? 404 : 500);
      res.end(err && err.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, () => {
  console.log(`Local server running at http://localhost:${port}`);
});
