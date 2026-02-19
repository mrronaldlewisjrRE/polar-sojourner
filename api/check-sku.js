export default async function handler(request, response) {
    const { sku, vendor, url } = request.query;

    if (!url && (!sku || !vendor)) {
        return response.status(400).json({ error: 'Missing parameters. Provide url OR sku+vendor.' });
    }

    // Construct URL if not provided
    let targetUrl = url;
    if (!targetUrl) {
        if (vendor === 'tractor-supply') {
            targetUrl = `https://www.tractorsupply.com/tsc/product/${sku}`; // Simplified guess, usually need slug
            // Better: TSC search? Or just try direct SKU lookup if pattern known. 
            // TSC URL pattern: /tsc/product/name-sku? 
            // Actually, without the name/slug, direct ID lookup is hard on some sites.
            // But let's try a search URL or a direct ID URL if known.
            // For now, let's assume we can search by SKU or use a known pattern.
            targetUrl = `https://www.tractorsupply.com/tsc/search/${sku}`;
        } else if (vendor === 'homedepot') {
            targetUrl = `https://www.homedepot.com/p/${sku}`;
        } else if (vendor === 'lowes') {
            targetUrl = `https://www.lowes.com/pd/${sku}`; // Lowe's uses item ID not SKU usually in URL, potentially tricky.
        } else if (vendor === 'amazon') {
            // Amazon ASIN
            targetUrl = `https://www.amazon.com/dp/${sku}`;
        } else {
            return response.status(400).json({ status: 'unknown', message: 'Vendor not supported for auto-url' });
        }
    }

    try {
        const res = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!res.ok) {
            // If 404, it might be inactive/deleted
            if (res.status === 404) {
                return response.status(200).json({
                    status: 'inactive',
                    timestamp: new Date().toISOString(),
                    reason: '404 Not Found'
                });
            }
            throw new Error(`Fetch failed: ${res.status}`);
        }

        const html = await res.text();
        const lowerHtml = html.toLowerCase();

        // Heuristic Checks
        let status = 'active';
        let reason = 'Available';

        // 1. Out of Stock markers
        if (
            lowerHtml.includes('out of stock') ||
            lowerHtml.includes('currently unavailable') ||
            lowerHtml.includes('sold out') ||
            lowerHtml.includes('delivery unavailable')
        ) {
            status = 'inactive';
            reason = 'Detected "Out of Stock" text';
        }

        // 2. Add to Cart markers (Positive confirmation)
        if (status === 'active' && !lowerHtml.includes('add to cart') && !lowerHtml.includes('add to bag')) {
            // Weak signal: If we don't see "Add to Cart", is it really active? or just a content page?
            // Let's be conservative: If we retrieved the page successfully (200 OK) and didn't find "Out of Stock", we assume Active.
            // But listing "Unknown" if unsure is safer.
            // status = 'unknown'; 
            // reason = 'No "Add to Cart" button found';
        }

        return response.status(200).json({
            status,
            timestamp: new Date().toISOString(),
            reason,
            url: targetUrl
        });

    } catch (error) {
        return response.status(200).json({
            status: 'unknown',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
}
