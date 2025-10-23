// This script will parse the data from source | No Date Filter
const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");
const readline = require("readline");

// Get all JSON files from data folder
const dataFolder = "data";
const files = fs.readdirSync(dataFolder).filter(file => file.endsWith('.json')).map(file => path.join(dataFolder, file));
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outputCsv = path.join("output", `reviews_${timestamp}.csv`);

console.log(`📁 Found ${files.length} JSON files in ${dataFolder}:`, files.map(f => path.basename(f)));
console.log(`📄 Output will be saved to: ${outputCsv}`);

// Write stream for CSV
const writeStream = fs.createWriteStream(outputCsv);

let headersWritten = false;

(async function processFiles() {
  try {
    for (const file of files) {
      console.log(`\n📄 Starting processing file: ${file}`);

      const stats = fs.statSync(file);
      const totalBytes = stats.size;
      let bytesRead = 0;

      const rl = readline.createInterface({
        input: fs.createReadStream(file),
        crlfDelay: Infinity,
      });

      let lineCount = 0;
      let lastPercent = 0;

      for await (const line of rl) {
        bytesRead += Buffer.byteLength(line, "utf8") + 1; // +1 for newline
        lineCount++;

        const percent = Math.floor((bytesRead / totalBytes) * 100);
        if (percent !== lastPercent || lineCount % 10000 === 0) {
          process.stdout.write(`   📝 Processed ${lineCount} records (${percent}%)\r`);
          lastPercent = percent;
        }

        if (!line.trim()) continue;

        try {
          const item = JSON.parse(line).Item;
          const flat = {};

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

          const parser = new Parser({ header: !headersWritten });
          const csvLine = parser.parse([flat]);

          writeStream.write(csvLine + "\n");
          headersWritten = true;

        } catch (err) {
          console.error(`\n❌ Error processing line ${lineCount} in ${file}:`, err.message);
        }
      }

      console.log(`\n✅ Finished processing file: ${file} (total ${lineCount} records)`);
    }

    writeStream.end();
    console.log(`\n🎉 All files processed. CSV created successfully: ${outputCsv}`);
  } catch (err) {
    console.error("❌ Fatal error:", err.message);
  }
})();
