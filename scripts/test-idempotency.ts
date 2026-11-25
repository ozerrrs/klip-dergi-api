import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { db, pool } from "../src/db/index";
import {
  people,
  photos,
  socialLinks,
  episodes,
  clips,
  clipPeople,
} from "../src/db/schema";
import { count } from "drizzle-orm";
import { importData } from "./import-data";

const tables = [
  ["people", people],
  ["photos", photos],
  ["social_links", socialLinks],
  ["episodes", episodes],
  ["clips", clips],
  ["clip_people", clipPeople],
] as const;

async function getCounts(): Promise<Record<string, number>> {
  const result: Record<string, number> = {};

  for (const [name, table] of tables) {
    const [row] = await db.select({ total: count() }).from(table);

    result[name] = Number(row.total);
  }

  return result;
}

async function runTest() {
  try {
    console.log("İlk import çalıştırılıyor...");
    await importData();
    const firstRun = await getCounts();

    console.log("\nİkinci import çalıştırılıyor...");
    await importData();
    const secondRun = await getCounts();

    const lines: string[] = [];

    lines.push("========== IDEMPOTENCY TEST ==========\n");
    lines.push("TABLE             FIRST RUN    SECOND RUN");
    lines.push("----------------------------------------");

    let passed = true;
    let totalFirst = 0;
    let totalSecond = 0;

    for (const [name] of tables) {
      const first = firstRun[name];
      const second = secondRun[name];

      totalFirst += first;
      totalSecond += second;

      lines.push(`${name.padEnd(18)} ${String(first).padEnd(12)} ${second}`);

      if (first !== second) passed = false;
    }

    lines.push("----------------------------------------");
    lines.push(`TOTAL RECORDS     ${totalFirst}           ${totalSecond}`);
    lines.push(`NEW RECORDS       ${totalSecond - totalFirst}`);
    lines.push("");
    lines.push(`RESULT: ${passed ? "PASSED" : "FAILED"}`);
    lines.push("========================================");

    const report = lines.join("\n");

    await mkdir("reports", { recursive: true });
    await writeFile("reports/idempotency-test.txt", report, "utf-8");

    console.log("\n" + report);
    console.log("\nRapor kaydedildi: reports/idempotency-test.txt");

    if (!passed) {
      process.exitCode = 1;
    }
  } finally {
    await pool.end();
  }
}

runTest().catch((error) => {
  console.error("Test başarısız:", error);
  process.exitCode = 1;
});
