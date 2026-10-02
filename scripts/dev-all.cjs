const { spawn } = require("node:child_process");

const apps = [
  ["Seller", ["run", "dev", "--workspace", "@bazaarx/seller", "--", "--host", "127.0.0.1"]],
  ["Admin", ["run", "dev", "--workspace", "@bazaarx/admin", "--", "--host", "127.0.0.1"]],
  ["API", ["run", "dev:api"]],
  ["Buyer", ["run", "dev", "--workspace", "@bazaarx/web", "--", "--host", "127.0.0.1"]],
];

const children = [];
let stopping = false;

function stopAll(signal = "SIGTERM") {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null) {
      try { process.kill(-child.pid, signal); } catch {}
    }
  }
}

process.on("SIGINT", () => stopAll("SIGINT"));
process.on("SIGTERM", () => stopAll("SIGTERM"));

console.log("\nBazaarX portals share one URL: http://localhost:5173");
console.log("Buyer: /  Seller: /seller/  Admin: /admin/\n");

for (const [name, args] of apps) {
  const child = spawn("npm", args, { stdio: "inherit", detached: true });
  children.push(child);
  child.on("error", (error) => {
    console.error(`${name} could not start: ${error.message}`);
    stopAll();
  });
  child.on("exit", (code) => {
    if (!stopping && code !== 0) {
      console.error(`${name} stopped with exit code ${code}`);
      stopAll();
    }
  });
}
