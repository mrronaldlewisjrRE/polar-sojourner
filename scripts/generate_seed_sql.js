import fs from 'fs';
import { RETAILERS } from '../src/data/retailers.js';

const sqlPath = 'seed_retailers.sql';

console.log(`Generating SQL for ${RETAILERS.length} retailers...`);

let sql = `-- Seed Data for Retailers\n`;
sql += `INSERT INTO public.retailers (id, name, location, address, city, state, zip, warehouse_code, contact_name, email, phone, cell, notes, accounts, is_favorite)\nVALUES\n`;

const rows = RETAILERS.map(r => {
    // Sanitize values for SQL
    const escape = (val) => val ? `'${val.toString().replace(/'/g, "''")}'` : 'NULL';
    const json = (val) => val ? `'${JSON.stringify(val)}'` : "'{}'";

    return `(${escape(r.id)}, ${escape(r.name)}, ${escape(r.location)}, ${escape(r.address)}, ${escape(r.city)}, ${escape(r.state)}, ${escape(r.zip)}, ${escape(r.warehouseCode)}, ${escape(r.contactName)}, ${escape(r.email)}, ${escape(r.phone)}, ${escape(r.cell)}, ${escape(r.notes)}, ${json(r.accounts)}, false)`;
});

sql += rows.join(',\n') + `\nON CONFLICT (id) DO NOTHING;`;

fs.writeFileSync(sqlPath, sql);
console.log(`Generated ${sqlPath}`);
