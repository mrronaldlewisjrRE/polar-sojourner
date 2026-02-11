export const DISTRIBUTORS = [
    {
        id: 'orgill',
        name: 'Orgill',
        format: 'Format A',
        submissionMethod: 'ASSISTED_PORTAL',
        portalUrl: 'https://www.orgill.com/login',
        portalInstructions: 'Use Dealer Login. Enter SKUs in Quick Entry form.'
    },
    {
        id: 'house-hasson',
        name: 'House-Hasson',
        format: 'Format B',
        submissionMethod: 'ASSISTED_PORTAL',
        portalUrl: 'https://www.househasson.com/dealer-login',
        portalInstructions: 'Navigate to "Electronic Order". Select "Drop Ship".'
    },
    { id: 'wallace', name: 'Wallace', format: 'Format C' },
];

export const VENDORS = [
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

export const RETAILERS = [
    { id: 'r1', name: 'Home & Hardware Co.', location: 'Atlanta, GA', accounts: { 'orgill': '12345', 'wallace': '99887' } },
    { id: 'r2', name: 'Westside Supply', location: 'Nashville, TN', accounts: { 'house-hasson': 'HH-554' } },
    { id: 'r3', name: 'Smith Family Hardware', location: 'Birmingham, AL', accounts: { 'orgill': '55443', 'house-hasson': 'HH-112', 'wallace': 'W-332' } },
    // Imported from House-Hasson Database
    { id: 'r4', name: 'Southeast Plumbing & Electric', location: 'Fayetteville, TN', accounts: { 'house-hasson': '863258' } },
    { id: 'r5', name: 'Star Home Center', location: 'Middlebury, IN', accounts: {} },
    { id: 'r6', name: "Al-Joe's Pet & Garden Center", location: 'Hamilton, OH', accounts: {} },
    { id: 'r7', name: "Al-Joe's Lawn & Garden Center", location: 'West Chester, OH', accounts: {} },
    { id: 'r8', name: 'Anderson Feed & Hardware', location: 'Dahlonega, GA', accounts: { 'house-hasson': '25874' } },
    { id: 'r9', name: 'Animal Health Center', location: 'La Grange, KY', accounts: {} },
    { id: 'r10', name: 'Ashland Feed Store', location: 'Ashland, KY', accounts: {} },
    { id: 'r11', name: "Atwood's", location: 'Great Bend, KS', accounts: {} },
    { id: 'r12', name: "Atwood's", location: 'Arkansas City, KS', accounts: {} },
    { id: 'r13', name: "Atwood's", location: 'Blackwell, OK', accounts: {} },
    { id: 'r14', name: "Atwood's", location: 'Guymon, OK', accounts: {} },
    { id: 'r15', name: "Atwood's", location: 'Jackson, WY', accounts: {} },
    { id: 'r16', name: "Atwood's", location: 'Stillwater, OK', accounts: {} },
    { id: 'r17', name: "Atwood's", location: 'Kingman, KS', accounts: {} },
    { id: 'r18', name: "Atwood's", location: 'Altus, OK', accounts: {} },
    { id: 'r19', name: "Atwood's", location: 'Arkadelphia, AR', accounts: {} },
    { id: 'r20', name: "Atwood's", location: 'Chickasha, OK', accounts: {} },
    { id: 'r21', name: "Atwood's", location: 'Perryton, TX', accounts: {} },
    { id: 'r22', name: "Atwood's", location: 'Pratt, KS', accounts: {} },
    { id: 'r23', name: "Atwood's", location: 'Ulysses, KS', accounts: {} },
    { id: 'r24', name: "Atwood's", location: 'Enid, OK', accounts: {} },
    { id: 'r25', name: "Atwood's", location: 'Farmington, NM', accounts: {} },
];

export const PRODUCTS = {
    'v1': [
        { sku: 'AC-100', description: 'Acme Hammer 16oz', packQty: 4, cost: 12.50, distSkus: { orgill: '111-001', 'house-hasson': 'HH-100' } },
        { sku: 'AC-101', description: 'Acme Screwdriver Set', packQty: 6, cost: 18.00, distSkus: { orgill: '111-002', 'house-hasson': 'HH-101' } },
        { sku: 'AC-200', description: 'Acme Power Drill', packQty: 2, cost: 45.00, distSkus: { orgill: '111-003', 'house-hasson': 'HH-102' } },
    ],
    'v2': [
        { sku: 'AP-55', description: 'Apex Wrench Set', packQty: 4, cost: 22.00, distSkus: { wallace: 'W-550' } },
        { sku: 'AP-56', description: 'Apex Pliers', packQty: 10, cost: 8.50, distSkus: { wallace: 'W-560' } },
    ],
    'v3': [ // Dize
        { sku: 'DZ-99', description: 'Dize Awning 12ft', packQty: 1, cost: 120.00, distSkus: { orgill: '999-DIZ' } },
        { sku: 'DZ-100', description: 'Dize Canvas Repair Kit', packQty: 12, cost: 15.00, distSkus: { orgill: '998-DIZ' } },
    ],
    'v4': [ // Dundas Jafine (Verified via Internet Search)
        { sku: 'PCLT4WZW', description: 'ProClean Dryer Duct Lint Trap', packQty: 1, cost: 27.37, distSkus: { 'house-hasson': 'DJ-100', orgill: '998-NEW' } },
        { sku: 'CHK100ZW6', description: 'White Heat Kit', packQty: 12, cost: 19.87, distSkus: { 'house-hasson': 'DJ-101', orgill: '999-NEW' } },
    ],
    'v5': [ // Ettore (Verified via Internet Search)
        { sku: '11112', description: 'Original Window Squeegee 12in', packQty: 6, cost: 12.50, distSkus: { 'house-hasson': 'ET-112', orgill: '622-11112' } },
        { sku: '1144', description: 'Brass Channel w/ Rubber 18in', packQty: 6, cost: 14.25, distSkus: { 'house-hasson': 'ET-118', orgill: '622-1144' } },
    ],
    'v10': [ // Midwest Can (Verified via Internet Search)
        { sku: '1210', description: 'Gas Can 1 Gallon (Red)', packQty: 12, cost: 8.99, distSkus: { 'house-hasson': '7794332', orgill: 'MC-1210' } },
        { sku: '3681491', description: 'Scepter Auto-Flow Gas Can', packQty: 4, cost: 16.50, distSkus: { orgill: '3681491' } },
    ],
    'v11': [ // Mr. Heater
        { sku: 'MH-BUDDY', description: 'Mr. Heater Buddy Portable', packQty: 2, cost: 85.00, distSkus: { 'house-hasson': 'HTR-001' } },
        { sku: 'MH-BIG', description: 'Mr. Heater Big Buddy', packQty: 1, cost: 140.00, distSkus: { 'house-hasson': 'HTR-002' } },
        { sku: 'MH-HOSE', description: '12ft Propane Hose', packQty: 10, cost: 18.50, distSkus: { 'house-hasson': 'HTR-003' } },
    ],
    'v21': [ // United General
        { sku: 'UG-GLOVES', description: 'Work Gloves (Leather) L', packQty: 24, cost: 4.50, distSkus: { orgill: 'GLV-555' } },
        { sku: 'UG-ROPE', description: 'Nylon Rope 50ft', packQty: 12, cost: 6.75, distSkus: { orgill: 'RP-555' } },
    ]
};
