const fs = require('fs');
const path = require('path');

function makeSafeOptionalHandling(str) {
    // Converts "A.B.C" to "A?.B?.C"
    return str.replace(/\./g, '?.');
}

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let modified = false;

            // 1. Fix previously wrapped items that lack optional chaining:
            // Matches (Array.isArray(foo.bar) ? foo.bar : [])
            // We want (Array.isArray(foo?.bar) ? foo?.bar : [])
            const wrapRegex = /Array\.isArray\(([a-zA-Z0-9_.]+(?:\?\.[a-zA-Z0-9_.]+)*)\)\s*\?\s*\1\s*:\s*\[\]/g;
            content = content.replace(wrapRegex, (match, g1) => {
                // g1 is the variable, e.g., "order.items" or "foo?.bar.baz"
                if (g1.includes('.')) {
                    modified = true;
                    const safe = makeSafeOptionalHandling(g1);
                    return `Array.isArray(${safe}) ? ${safe} : []`;
                }
                return match;
            });

            // 2. Catch ANY .map that was missed and has a dot.
            // Match something.property.map( or something?.property.map( or something?.property?.map(
            // Ensure it's not already preceded by "]" which implies it was wrapped.
            // E.g. match object.items.map(
            const rawMapRegex = /(?<!\])\b([a-zA-Z0-9_]+(?:\?\.[a-zA-Z0-9_]+|\.[a-zA-Z0-9_]+)+)\.?map\(/g;
            content = content.replace(rawMapRegex, (match, g1) => {
                modified = true;
                const safe = makeSafeOptionalHandling(g1);
                return `(Array.isArray(${safe}) ? ${safe} : []).map(`;
            });

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf-8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
console.log("Nested map refactoring complete.");
