// This script will parse the data from source | FOR TODAY ONLY
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const XLSX = require("xlsx");

// Get all JSON files from data folder
const dataFolder = "data";
const files = fs.readdirSync(dataFolder).filter(file => file.endsWith('.json')).map(file => path.join(dataFolder, file));
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outputExcel = path.join("output", `reviews_today_${timestamp}.xlsx`);

// Get today's date in YYYY-MM-DD format
const today = new Date();
const todayStr = today.toISOString().slice(0, 10); // e.g., "2025-10-08"

console.log(`📁 Found ${files.length} JSON files in ${dataFolder}:`, files.map(f => path.basename(f)));
console.log(`📄 Output will be saved to: ${outputExcel}`);
console.log(`📅 Filtering for today's date: ${todayStr}`);

const filteredData = [];

(async function processFiles() {
  try {
    for (const file of files) {
      console.log(`\n📄 Processing file: ${file}`);
      const rl = readline.createInterface({
        input: fs.createReadStream(file),
        crlfDelay: Infinity,
      });

      let lineCount = 0;
      let matchedCount = 0;

      for await (const line of rl) {
        lineCount++;
        if (!line.trim()) continue;

        try {
          const item = JSON.parse(line).Item;
          const flat = {};

          // Flatten DynamoDB attributes
          for (const key in item) {
            if ("S" in item[key]) flat[key] = item[key].S;
            else if ("N" in item[key]) flat[key] = Number(item[key].N);
            else if ("NULL" in item[key] && item[key].NULL) flat[key] = null;
            else flat[key] = JSON.stringify(item[key]);
          }

          // Add created_at_converted column
          if (flat.created_at) {
            flat.created_at_converted = flat.created_at.slice(0, 10);
          }

          // Check if created_at is today
          if (flat.created_at && flat.created_at.slice(0, 10) === todayStr) {
            filteredData.push(flat);
            matchedCount++;
          }
        } catch (err) {
          console.error(`❌ Error processing line ${lineCount} in ${file}:`, err.message);
        }
      }

      console.log(`✅ Finished file: ${file} | Total lines: ${lineCount} | Matched today: ${matchedCount}`);
    }

    if (filteredData.length === 0) {
      console.log("⚠️ No reviews found for today!");
      return;
    }

    // Convert filtered data to Excel
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ReviewsToday");
    XLSX.writeFile(wb, outputExcel);

    console.log(`\n🎉 Excel file created successfully: ${outputExcel} | Rows: ${filteredData.length}`);
  } catch (err) {
    console.error("❌ Fatal error:", err.message);
  }
})();
