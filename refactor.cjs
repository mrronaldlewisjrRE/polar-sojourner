const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let modified = false;

            // 1. Fix Maps: Match SomeVar.map or Some.Prop.map
            // We skip if variable is 'Object', 'Array', 'String', 'Promise'
            const mapRegex = /\b([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)\.map\(/g;
            content = content.replace(mapRegex, (match, g1) => {
                if (g1 === 'Object' || g1 === 'Array' || g1 === 'String' || g1 === 'Promise' || g1.includes('isArray')) return match;
                // If it was already wrapped, we won't match the whole line properly but g1 won't contain the wrap.
                // Wait, if code has `(Array.isArray(filteredVendors) ? filteredVendors : []).map(`, 
                // the regex matches `].map(` no, it matches nothing because `]` is not in [a-zA-Z0-9_]. So it safely skips!
                modified = true;
                return `(Array.isArray(${g1}) ? ${g1} : []).map(`;
            });

            // Handle optional chaining: SomeVar?.map(
            const optMapRegex = /\b([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)\?\.map\(/g;
            content = content.replace(optMapRegex, (match, g1) => {
                modified = true;
                return `(Array.isArray(${g1}) ? ${g1} : []).map(`;
            });

            // 2. Fix useState for plurals / arrays initialized to nothing or null
            // match: const [items, setItems] = useState(); or useState(null);
            const stateRegex = /const \[([a-zA-Z0-9_]+s|items|data|list|results|logs|vendors|retailers|distributors|events), ([a-zA-Z0-9_]+)\] = useState\(\s*(?:null|undefined)?\s*\)/gi;
            content = content.replace(stateRegex, (match, g1, g2) => {
                modified = true;
                return `const [${g1}, ${g2}] = useState([])`;
            });

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf-8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
console.log("Refactoring map calls complete.");
