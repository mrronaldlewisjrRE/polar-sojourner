import { test, expect } from "@playwright/test";
import { Buffer } from "node:buffer";

test.beforeEach(async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
        console.log(`[Browser] ${msg.text()}`);
    });
    (page as any)._consoleErrors = errors;
});

test.afterEach(async ({ page }) => {
    const errors: string[] = (page as any)._consoleErrors ?? [];
    expect(errors, `Console errors found:\n${errors.join("\n")}`).toEqual([]);
});

test("Dashboard loads and navigation works", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CDH|Order Intake|Platform|Polar/i);
    const newOrderLink = page.locator('[data-testid="nav-new-order"]');
    await expect(newOrderLink).toBeVisible();
    await newOrderLink.click();
    await expect(page).toHaveURL(/new-order/i);
});

test("New Order page: can add and remove a line item", async ({ page }) => {
    await page.goto("/new-order");
    await page.locator('[data-testid="retailer-select"]').selectOption({ index: 1 });
    const vendorSelect = page.locator('[data-testid="vendor-select"]');
    await expect(vendorSelect).toBeEnabled();
    await vendorSelect.selectOption({ index: 1 });
    const addItem = page.locator('[data-testid="add-item"]');
    await expect(addItem).toBeVisible();
    const rows = page.locator('[data-testid="line-item-row"]');
    const before = await rows.count();
    await addItem.click();
    await expect(rows).toHaveCount(before + 1);

    // Select SKU (Index 1 - first real option)
    await page.locator('[data-testid="line-item-row"] select').last().selectOption({ index: 1 });

    const remove = page.locator('[data-testid="remove-item"]').first();
    await expect(remove).toBeVisible();
    await remove.click();
    await expect(rows).toHaveCount(before);
});

test.skip("Soft Email prompt warning appears and permits submission on cancel", async ({ page }) => {
    test.setTimeout(90000);
    await page.goto("/new-order");

    await page.locator('[data-testid="retailer-select"]').selectOption({ label: "A & J Power Equipment (Bird In Hand, PA)" });

    const vendorSelect = page.locator('[data-testid="vendor-select"]');
    await expect(vendorSelect).toBeEnabled();
    await vendorSelect.selectOption({ index: 1 });

    await page.locator('[data-testid="add-item"]').click();
    // Select SKU to ensure valid order state
    await page.locator('[data-testid="line-item-row"] select').first().selectOption({ index: 1 });

    let dialogHandled = false;
    page.on("dialog", async (dialog) => {
        console.log(`[Dialog Triggered] ${dialog.message()}`);
        dialogHandled = true;
        await dialog.dismiss();
    });

    await page.getByRole("button", { name: /review/i }).click();

    const submitBtn = page.locator('[data-testid="submit-order"]');
    await expect(submitBtn).toBeVisible();
    // Direct click is safe here as button is clearly visible
    await submitBtn.click();

    await expect(page.locator('[data-testid="submission-success"]')).toBeVisible({ timeout: 20000 });
});

test("Product Intelligence menu opens and renders items", async ({ page }) => {
    await page.goto("/new-order");
    await page.locator('[data-testid="retailer-select"]').selectOption({ index: 1 });
    const vendorSelect = page.locator('[data-testid="vendor-select"]');
    await expect(vendorSelect).toBeEnabled();
    await vendorSelect.selectOption({ index: 1 });
    await page.locator('[data-testid="add-item"]').click();

    // CRITICAL: Select SKU so button renders
    await page.locator('[data-testid="line-item-row"] select').first().selectOption({ index: 1 });

    const searchBtn = page.locator('[data-testid="product-search"]').first();
    await expect(searchBtn).toBeVisible();

    // Standard click should work now that button is definitively rendered
    await searchBtn.click();

    const menu = page.locator('[data-testid="product-search-menu"]');
    await expect(menu).toBeVisible({ timeout: 10000 });
    await expect(menu).toContainText(/Google/i);
});

test.skip("Portal Submission Gating works for Portal-Enabled Vendors", async ({ page }) => {
    test.setTimeout(90000);
    await page.goto("/new-order");

    await page.locator('[data-testid="retailer-select"]').selectOption({ index: 1 });

    const vendorSelect = page.locator('[data-testid="vendor-select"]');
    await expect(vendorSelect).toBeEnabled();
    await vendorSelect.selectOption({ label: "Dize" });

    await page.locator('[data-testid="add-item"]').click();
    // Select SKU
    await page.locator('[data-testid="line-item-row"] select').first().selectOption({ index: 1 });

    await page.getByRole("button", { name: /review/i }).click();

    const portalBtn = page.getByRole("button", { name: /submit via portal/i });
    await expect(portalBtn).toBeVisible();
    await portalBtn.click();

    const modal = page.locator('[data-testid="portal-modal"]');
    await expect(modal).toBeVisible();

    // Step 1: Launch
    const popupPromise = page.waitForEvent('popup');
    await page.locator('[data-testid="launch-portal-btn"]').click();
    const popup = await popupPromise;
    await popup.close();

    // Step 2: Checklist
    const checkboxes = page.getByRole("checkbox");
    await expect(checkboxes).toHaveCount(3);
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();
    await checkboxes.nth(2).check();

    await page.getByRole("button", { name: "Next Step" }).click();

    // Step 3: Finalize
    const finalizeBtn = page.getByRole("button", { name: /Finalize & Submit/i });
    await expect(finalizeBtn).toBeDisabled();

    await page.locator('input[placeholder*="PO Number"]').fill("TEST-123");

    const fileContent = new TextEncoder().encode('evidence');
    await page.locator('input[type="file"]').setInputFiles({
        name: 'evidence.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from(fileContent)
    });

    await expect(finalizeBtn).not.toBeDisabled();
});
