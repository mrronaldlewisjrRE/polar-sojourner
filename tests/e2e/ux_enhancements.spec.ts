import { test, expect } from '@playwright/test';

test.describe('Phase 5A UX Enhancements', () => {

    test('Mobile Menu Toggle', async ({ page }) => {
        // Set viewport to mobile
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // Check if menu button exists
        const menuButton = page.locator('header button').nth(1); // 2nd button (1st is theme)
        await expect(menuButton).toBeVisible();

        // Open menu
        await menuButton.click();
        const mobileMenu = page.locator('text=Menu');
        await expect(mobileMenu).toBeVisible();

        // Check nav item
        const navItem = page.locator('text=New Order').first();
        await expect(navItem).toBeVisible();

        // Click nav item, menu should close (if we implemented that logic, let's verify)
        // In code: <NavContent onClick={() => setIsMobileMenuOpen(false)} /> ✅
        await navItem.click();
        await expect(mobileMenu).not.toBeVisible();
        await expect(page).toHaveURL('/new-order');
    });

    test('New Order Live Search', async ({ page }) => {
        await page.goto('/new-order');

        // Input should be type=text now, not select
        const input = page.locator('input[list="retailer-list-search"]');
        await expect(input).toBeVisible();

        // Test search match
        await input.fill('Ace Hardware');
        // We expect it to find match. Logic: value={RETAILERS.find...?.name || retailerId}
        // If I type "Ace Hardware", value should remain "Ace Hardware" if it matches.

        // Test No Match -> Add New Prompt
        await input.fill('NonExistent Store');
        const prompt = page.locator('text=Retailer "NonExistent Store" not found');
        await expect(prompt).toBeVisible();

        const addButton = page.locator('button:has-text("+ Add New Retailer")');
        await expect(addButton).toBeVisible();
    });

    test('Order History Filter', async ({ page }) => {
        await page.goto('/orders');

        const filterSelect = page.locator('select').nth(0); // Assuming it's the first or we find by values
        // Actually we have a search input and a select.
        // Let's find by option text
        const statusDropdown = page.locator('select', { hasText: 'All Status' });
        await expect(statusDropdown).toBeVisible();

        // Select 'Draft'
        await statusDropdown.selectOption('Draft');
        // Verify filter logic (might be hard without data, but ensuring no error is a good start)
    });

    test('Retailer Favorites', async ({ page }) => {
        await page.goto('/retailers');

        // Check for "Favorites" section (might be hidden if none exist)
        // Let's toggle one first.
        const starButton = page.locator('button[title="Add to favorites"]').first();
        await starButton.click();

        // Now Favorites section should appear
        const favSection = page.locator('text=Favorites').first();
        await expect(favSection).toBeVisible();

        // Toggle off
        await starButton.click();
        // Section might disappear if it was the only one.
    });

});
