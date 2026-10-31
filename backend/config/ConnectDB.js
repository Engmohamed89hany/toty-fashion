const fs = require("fs");
const path = require("path");
const mysql2 = require("mysql2");
require("dotenv").config();

const sslMode = new URL(
  process.env.DATABASE_URL || "mysql://localhost",
).searchParams.get("ssl-mode");
const sslEnabled =
  /^(1|true|yes|required)$/i.test(process.env.DATABASE_SSL || "") ||
  /^(required|verify_ca|verify_identity)$/i.test(sslMode || "");

const connectionOptions = process.env.DATABASE_URL
  ? (() => {
      const databaseUrl = new URL(process.env.DATABASE_URL);
      if (!["mysql:", "mysql2:"].includes(databaseUrl.protocol)) {
        throw new Error("DATABASE_URL must use the mysql:// protocol");
      }

      return {
        host: databaseUrl.hostname,
        user: decodeURIComponent(databaseUrl.username),
        password: decodeURIComponent(databaseUrl.password),
        database: decodeURIComponent(databaseUrl.pathname.slice(1)),
        port: Number(databaseUrl.port) || 3306,
        connectTimeout: 15000,
      };
    })()
  : {
      host: process.env.DATABASE_HOST || "localhost",
      user: process.env.DATABASE_USER || "root",
      password: process.env.DATABASE_PASSWORD || "",
      database:
        process.env.DATABASE_NAME ||
        process.env.DATABASEN_NAME ||
        "totyfashion",
      port: Number(process.env.DATABASE_PORT) || 3306,
      connectTimeout: 15000,
    };

if (sslEnabled) {
  connectionOptions.ssl = { rejectUnauthorized: true };

  const certificate = process.env.DATABASE_SSL_CA;
  if (certificate) {
    connectionOptions.ssl.ca = certificate.includes("-----BEGIN CERTIFICATE-----")
      ? certificate.replace(/\\n/g, "\n")
      : fs.readFileSync(path.resolve(process.cwd(), certificate), "utf8");
  } else {
    connectionOptions.ssl.ca = fs.readFileSync(
      path.join(__dirname, "aiven-ca.pem"),
      "utf8",
    );
  }
}

const db = mysql2.createConnection(connectionOptions);
module.exports = { db };
