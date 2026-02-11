import { test, expect } from '@playwright/test';

test.describe('Retailer Discovery (Live Search)', () => {

    test('Search and Import Retailer', async ({ page }) => {
        // Mock the Nominatim API
        await page.route('https://nominatim.openstreetmap.org/search?*', async route => {
            const json = [{
                osm_id: 12345,
                name: 'Mock Hardware Store',
                display_name: 'Mock Hardware Store, 123 Main St, Test City, TS, 12345, USA',
                type: 'hardware',
                address: {
                    city: 'Test City',
                    state: 'TS'
                }
            }];
            await route.fulfill({ json });
        });

        await page.goto('/retailers');
        await expect(page.locator('h1')).toHaveText('Retailer Management');

        // Open Modal
        const discoverBtn = page.locator('button', { hasText: 'Discover New' });
        await expect(discoverBtn).toBeVisible();
        await discoverBtn.click();

        await expect(page.locator('h2:has-text("Retailer Discovery")')).toBeVisible();

        // Perform Search
        await page.fill('input[placeholder*="Hardware Stores"]', 'Hardware Test');
        await page.click('button:has-text("Search")');

        // Check Results
        const resultCard = page.locator('text=Mock Hardware Store');
        await expect(resultCard).toBeVisible();

        // Verify Link
        const link = page.locator('a:has-text("Verify on Google")');
        await expect(link).toHaveAttribute('href', /google\.com\/maps\/search/);

        // Import
        await page.click('button:has-text("Import")');

        // Verify Modal Closed & Retailer Added
        await expect(page.locator('h2:has-text("Retailer Discovery")')).not.toBeVisible();

        // Check if added to list (might need to filter if list is long, but let's check text)
        // We search for it in the main page search bar to filter
        await page.fill('input[placeholder="Search retailers..."]', 'Mock Hardware Store');
        await expect(page.locator('h3:has-text("Mock Hardware Store")')).toBeVisible();
    });

});
