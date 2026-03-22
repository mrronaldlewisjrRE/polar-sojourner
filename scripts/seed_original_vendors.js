import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Data from src/lib/mockData.js
const VENDORS = [
    { id: 'v1', name: 'Aion Products', status: 'Active', email: 'orders@aionproducts.com', contact: 'Nancy', authorizedDistributors: [] },
    { id: 'v2', name: 'Danner Pumps', status: 'Active', email: 'CustomerService@Dannermfg.com', contact: 'Priscilla Abatzidis', authorizedDistributors: [] },
    {
        id: 'v3',
        name: 'Dize',
        status: 'Active',
        email: 'pautry@dizeco.com',
        contact: 'Pam Autry',
        authorizedDistributors: [],
        submissionMethod: 'ASSISTED_PORTAL',
        portalUrl: 'https://www.dizeco.com/portal',
        portalInstructions: 'Login with rep credentials. Enter Retailer Account #.'
    },
    { id: 'v4', name: 'Dundas Jafine', status: 'Active', email: 'nsummut@dundasjafine.com', contact: 'Natalie Summut', authorizedDistributors: [] },
    { id: 'v5', name: 'Ettore', status: 'Active', email: 'customerservice@ettore.com', contact: 'Diane', authorizedDistributors: [] },
    { id: 'v6', name: 'Hartline', status: 'Active', email: 'Rockitecement@aol.com', contact: 'Diane', authorizedDistributors: [] },
    { id: 'v7', name: 'IGLOO', status: 'Active', email: 'felice.skillern@igloocorp.com', contact: 'Felice Skillern', authorizedDistributors: [] },
    { id: 'v8', name: 'JED Pool', status: 'Active', email: 'rheyen@jedpooltools.com', contact: 'Rob Heyen', authorizedDistributors: [] },
    { id: 'v9', name: 'Master Gardner', status: 'Active', email: 'csr@mastergardner.com', contact: '', authorizedDistributors: [] },
    { id: 'v10', name: 'Midwest Can', status: 'Active', email: 'dselzer@midwestcan.com', contact: 'Dora Selzer', authorizedDistributors: [] },
    {
        id: 'v11',
        name: 'Mr. Heater',
        status: 'Active',
        email: 'iris.mcclure@us-egi.com',
        contact: 'McClure, Iris',
        authorizedDistributors: [],
        submissionMethod: 'ASSISTED_PORTAL',
        portalUrl: 'https://portal.mrheater.com',
        portalInstructions: 'Select "Drop Ship" for orders under $500.'
    },
    { id: 'v12', name: 'Myron Mixon', status: 'Active', email: 'amy@cdhassociates.com', contact: 'Amy', authorizedDistributors: [] },
    { id: 'v13', name: 'NSI', status: 'Active', email: 'joan.mckinnish@nsiindustries.com', contact: 'Joan McKinnish', authorizedDistributors: [] },
    { id: 'v14', name: 'Police Sec / LB', status: 'Active', email: 'orders@policesecurity.com', contact: '', authorizedDistributors: [] },
    { id: 'v15', name: 'ReadiSoil', status: 'Active', email: 'amy@cdhassociates.com', contact: 'Amy Cooper', authorizedDistributors: [] },
    { id: 'v16', name: 'Remwood', status: 'Active', email: 'sales@remwood.com', contact: '', authorizedDistributors: [] },
    { id: 'v17', name: 'Screen Tight', status: 'Active', email: 'orders@screentight.com', contact: '', authorizedDistributors: [] },
    { id: 'v18', name: 'Solo', status: 'Active', email: 'customerservice@solousa.com', contact: '', authorizedDistributors: [] },
    { id: 'v19', name: 'Total Sourcing', status: 'Active', email: 'amy@cdhassociates.com', contact: 'Amy Cooper', authorizedDistributors: [] },
    { id: 'v20', name: 'Turner Hat', status: 'Active', email: 'info@turnerhat.com', contact: '', authorizedDistributors: [] },
    { id: 'v21', name: 'United General', status: 'Active', email: 'erika@ugsco.com', contact: 'Erika Escamilla', authorizedDistributors: [] },
    { id: 'v22', name: 'United Mkt', status: 'Active', email: 'JD@UnitedMarketingInc.com', contact: 'JD Kramer', authorizedDistributors: [] },
    { id: 'v23', name: 'Wells Lamont', status: 'Active', email: 'emma.lange@wellslamontretail.com', contact: 'Emma Lange', authorizedDistributors: [] },
    { id: 'v24', name: "Wenzel's", status: 'Active', email: 'surp@att.net', contact: 'Randy Payne', authorizedDistributors: [] },
];

async function seedVendors() {
    console.log("Seeding vendors table...");

    // First, check what's there
    const { data: existing, error: fetchError } = await supabase.from('vendors').select('id, name');
    if (fetchError) {
        console.error("Error fetching expected vendors:", fetchError);
        return;
    }

    const existingNames = new Set(existing.map(v => v.name));

    const preparedVendors = VENDORS.filter(v => !existingNames.has(v.name)).map(v => {
        return {
            id: v.id,
            name: v.name,
            authorized_distributors: v.authorizedDistributors || []
        };
    });

    if (preparedVendors.length === 0) {
        console.log("No new vendors to insert. They may already exist.");
        return;
    }

    console.log(`Inserting ${preparedVendors.length} new vendors...`);
    const { data, error } = await supabase.from('vendors').upsert(preparedVendors);

    if (error) {
        console.error("Failed to seed vendors:", error);
    } else {
        console.log("Vendors seeded successfully.");
    }
}

seedVendors();
