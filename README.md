# DynamoDB to Excel/CSV Converter

A Node.js script to convert DynamoDB database dumps (JSON format) to Excel and CSV files with support for data filtering and batch processing.

## Features

- Convert DynamoDB JSON dumps to CSV format
- Convert DynamoDB JSON dumps to Excel format
- Date-based filtering (today's records only)
- **Dynamic file discovery**: Automatically processes all JSON files in data folder
- **Organized structure**: Separate folders for input data and output files
- **Timestamped outputs**: Unique filenames prevent overwrites
- Batch processing of multiple JSON files (any number: 4, 5, 10, etc.)
- Progress tracking with real-time updates
- Automatic DynamoDB attribute flattening
- Error handling and logging

## Prerequisites

- Node.js (version 12 or higher)
- npm (Node Package Manager)

## Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd dynamo-csv-parser
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Project Structure

```
dynamo-csv-parser/
├── package.json          # Project dependencies
├── script.js            # Main CSV converter (all records)
├── index.js             # Excel converter with date filter (today only)
├── year-filter.js       # Excel converter for year 2025 with month column
├── data/                # Input JSON files directory
│   ├── reviews-1.json   # Sample DynamoDB dump file
│   ├── reviews-2.json   # Sample DynamoDB dump file
│   ├── reviews-3.json   # Sample DynamoDB dump file
│   └── reviews-4.json   # Sample DynamoDB dump file
├── output/              # Generated output files directory
│   ├── reviews_YYYY-MM-DDTHH-MM-SS.csv      # Generated CSV output
│   └── reviews_today_YYYY-MM-DDTHH-MM-SS.xlsx # Generated Excel output
└── README.md           # This file
```

**Note**: For reference, sample files are included:
- `data/sample-reviews.json` - Example DynamoDB dump format
- `output/sample-reviews_2024-01-15T10-30-00.csv` - Example CSV output
- `output/sample-reviews_today_2024-01-15T10-30-00.xlsx` - Example Excel output

For actual usage, add your own DynamoDB dump files to the `data/` folder.

## Quick Start Guide

### Step 1: Clone the Project
```bash
git clone <repository-url>
cd dynamo-csv-parser
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Add Your DynamoDB Dump Files
1. Place your DynamoDB JSON dump files in the `data/` folder
2. Files must have `.json` extension (e.g., `my-data.json`, `users.json`)
3. You can add any number of files - the scripts will process all of them
4. **For testing**: A sample file `sample-reviews.json` is provided in the `data/` folder

### Step 4: Run the Scripts

**For CSV conversion (all records):**
```bash
node script.js
```

**For Excel conversion (today's records only):**
```bash
node index.js
```

**For Excel conversion (year 2025 records with month breakdown):**
```bash
node year-filter.js
```

### Step 5: Check Output
Generated files will be in the `output/` folder:
- CSV: `output/reviews_YYYY-MM-DDTHH-MM-SS.csv`
- Excel: `output/reviews_today_YYYY-MM-DDTHH-MM-SS.xlsx`

**Note**: Sample output files are provided in the `output/` folder for reference.

## Detailed Usage

### 1. Convert All Records to CSV

Use `script.js` to convert all records from DynamoDB dumps to a single CSV file:

```bash
node script.js
```

**What it does:**
- Automatically discovers and processes all JSON files in the `data/` folder
- Converts DynamoDB format to flat CSV structure
- Outputs to `output/reviews_YYYY-MM-DDTHH-MM-SS.csv` with timestamp
- Shows progress with record count and percentage

### 2. Convert Today's Records to Excel

Use `index.js` to filter and convert only today's records to Excel format:

```bash
node index.js
```

**What it does:**
- Automatically discovers and processes all JSON files in the `data/` folder
- Filters records where `created_at` matches today's date (YYYY-MM-DD)
- Converts filtered data to Excel format
- Outputs to `output/reviews_today_YYYY-MM-DDTHH-MM-SS.xlsx` with timestamp
- Shows matched record count per file

### 3. Convert Year 2025 Records to Excel with Month Breakdown

Use `year-filter.js` to filter and convert only 2025 records with month analysis:

```bash
node year-filter.js
```

**What it does:**
- Automatically discovers and processes all JSON files in the `data/` folder
- Filters records where `created_at` is from year 2025
- Adds a `month` column with full month names (January, February, etc.)
- Adds `created_at_converted` column with date in YYYY-MM-DD format
- Converts filtered data to Excel format
- Outputs to `output/reviews_2025_YYYY-MM-DDTHH-MM-SS.xlsx` with timestamp
- Shows matched record count per file

## Input File Format

The scripts expect DynamoDB JSON dump files with the following structure:

```json
{"Item":{"id":{"S":"12345"},"name":{"S":"John Doe"},"rating":{"N":"5"},"created_at":{"S":"2024-01-15T10:30:00Z"}}}
{"Item":{"id":{"S":"67890"},"name":{"S":"Jane Smith"},"rating":{"N":"4"},"created_at":{"S":"2024-01-15T14:20:00Z"}}}
```

**Reference**: See `data/sample-reviews.json` for a complete example.

## DynamoDB Attribute Mapping

The scripts automatically convert DynamoDB attribute types:

| DynamoDB Type | Converted To |
|---------------|--------------|
| `{"S": "value"}` | String |
| `{"N": "123"}` | Number |
| `{"NULL": true}` | null |
| Other types | JSON string |

## Customization

### Add Input Files

Simply place your DynamoDB JSON dump files in the `data/` folder. The scripts will automatically discover and process all `.json` files in this directory. You can add any number of files (4, 5, 10, etc.).

### Change Output Directory

Output files are automatically saved to the `output/` folder with timestamps. To change the output directory, modify the path in the scripts:

```javascript
// For CSV output
const outputCsv = path.join("your-output-folder", `reviews_${timestamp}.csv`);

// For Excel output
const outputExcel = path.join("your-output-folder", `reviews_today_${timestamp}.xlsx`);
```

### Adjust Date Filter

In `index.js`, modify the date comparison logic:

```javascript
// For a specific date
const targetDate = "2024-01-15";
if (flat.created_at && flat.created_at.slice(0, 10) === targetDate) {
    // Process record
}
```

## Output Examples

### CSV Output (script.js)
- File: `output/reviews_2025-10-13T08-34-04.csv`
```csv
id,name,rating,created_at
12345,John Doe,5,2024-01-15T10:30:00Z
67890,Jane Smith,4,2024-01-15T14:20:00Z
```

### Excel Output (index.js)
- File: `output/reviews_today_2025-10-13T08-34-12.xlsx`
- Single worksheet named "ReviewsToday"
- Headers in first row
- Data formatted as table

## Error Handling

Both scripts include comprehensive error handling:

- **File not found**: Script will skip missing files and continue
- **Invalid JSON**: Malformed lines are logged and skipped
- **Processing errors**: Individual record errors don't stop the entire process

## Performance

- **Memory efficient**: Uses streaming to handle large files
- **Progress tracking**: Real-time updates during processing
- **Batch processing**: Handles multiple files sequentially
- **Dynamic file discovery**: Automatically processes any number of JSON files
- **Timestamped outputs**: Prevents file overwrites with unique timestamps

## Dependencies

- `json2csv`: CSV generation and formatting
- `xlsx`: Excel file creation and manipulation
- `readline`: Streaming file processing
- `fs`: File system operations

## Troubleshooting

### Common Issues

1. **"Cannot find module" error**
   ```bash
   npm install
   ```

2. **"File not found" error**
   - Ensure JSON dump files exist in the `data/` directory
   - Verify files have `.json` extension

3. **Empty output files**
   - Verify input JSON format matches DynamoDB structure
   - Check date format for filtering (YYYY-MM-DD)

4. **Memory issues with large files**
   - The scripts use streaming, but very large files may still cause issues
   - Consider splitting large JSON files into smaller chunks

## License

ISC License