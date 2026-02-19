
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACTS_DIR = 'C:\\Users\\ronal\\.gemini\\antigravity\\brain\\9e8edb51-7618-4cef-aedc-29f43d973e2d';
const OUTPUT_FILE = path.join(process.cwd(), 'src/data/retailerCatalog.js');

const catalog = {
    'tractor-supply': {},
    'lowes': {},
    'homedepot': {},
    'amazon': {}
};

// Helper: Parse Tab-Separated Value Line
const parseLine = (line) => line.split('\t').map(c => c.trim());

// Helper: Normalize Price
const normalizePrice = (priceStr) => {
    if (!priceStr) return null;
    return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
};

const processFile = (filename, storeKey) => {
    const filePath = path.join(ARTIFACTS_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`Warning: File not found: ${filePath}`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Skip Header (Row 0)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const cols = parseLine(line);
        // Col 0: Name, Col 1: Store Item #, Col 2: CDH Code, Col 3: Price
        const name = cols[0];
        const storeSku = cols[1];
        const cdhCode = cols[2];
        const priceRaw = cols[3];

        if (cdhCode) {
            // Map: CDH Code -> Store Data
            // Normalize CDH Code (remove spaces, uppercase) mainly for safety
            const cleanCode = cdhCode.trim();

            if (!catalog[storeKey]) catalog[storeKey] = {};

            catalog[storeKey][cleanCode] = {
                storeSku: storeSku || null,
                price: normalizePrice(priceRaw),
                name: name
            };
        }
    }
    console.log(`Processed ${filename} for ${storeKey}`);
};

// Process All Chunks
processFile('tractor_supply_chunk_1.tsv', 'tractor-supply');
processFile('tractor_supply_chunk_2.tsv', 'tractor-supply');
processFile('tractor_supply_chunk_3.tsv', 'tractor-supply');

processFile('lowes_chunk_1.tsv', 'lowes');
processFile('lowes_chunk_2.tsv', 'lowes');

processFile('homedepot_chunk_1.tsv', 'homedepot');
processFile('homedepot_chunk_2.tsv', 'homedepot');
processFile('homedepot_chunk_3.tsv', 'homedepot');

processFile('amazon_chunk_1.tsv', 'amazon');

// Generate Output
const fileContent = `// Auto-generated from Staged E-com Data
// Generated at: ${new Date().toISOString()}

export const RETAILER_CATALOG = ${JSON.stringify(catalog, null, 4)};
`;

// Ensure directory exists
const dir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(OUTPUT_FILE, fileContent);
console.log(`Successfully generated catalog at ${OUTPUT_FILE}`);
console.log(`Summary:`);
Object.keys(catalog).forEach(k => {
    console.log(`  ${k}: ${Object.keys(catalog[k]).length} items`);
});
