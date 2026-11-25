import { importData } from "./import-data";
import { pool } from "../src/db/index";

importData()
  .catch((error) => {
    console.error("Veri aktarımı başarısız:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
