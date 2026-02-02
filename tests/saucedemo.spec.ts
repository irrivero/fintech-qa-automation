import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';

test.describe('SauceDemo E2E - Shopping Flow', () => {
	let loginPage: LoginPage;
	let inventoryPage: InventoryPage;
	let cartPage: CartPage;

	test.beforeEach(async ({ page }) => {
		loginPage = new LoginPage(page);
		inventoryPage = new InventoryPage(page);
		cartPage = new CartPage(page);

		await loginPage.goto();
	});

	test('should complete full shopping flow with price validation', async ({ page }) => {
		await loginPage.login('standard_user', 'secret_sauce');
		await loginPage.verifyLoginSuccess();

		const productName = await inventoryPage.getFirstProductName();
		const productPrice = await inventoryPage.getFirstProductPrice();

		await inventoryPage.addFirstItemToCart();

		await inventoryPage.verifyCartBadgeCount('1');

		await inventoryPage.goToCart();

		await cartPage.verifyItemInCart(productName);
		await cartPage.verifyCartItemCount(1);

		const cartPrice = await cartPage.getItemPrice(productName);

		await cartPage.verifyPriceFormat(cartPrice);

		expect(cartPrice).toBe(productPrice);

		expect(cartPrice).toMatch(/^\$\d+\.\d{2}$/);
		const numericPrice = parseFloat(cartPrice.replace('$', ''));
		expect(numericPrice).toBeGreaterThan(0);
	});

	test('should validate all cart item prices have correct format', async ({ page }) => {
		await loginPage.login('standard_user', 'secret_sauce');
		await loginPage.verifyLoginSuccess();

		await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
		await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');

		await inventoryPage.goToCart();

		const allPrices = await cartPage.getAllPrices();

		for (const price of allPrices) {
			await cartPage.verifyPriceFormat(price);

			expect(price).toContain('$');
			expect(price).toMatch(/\.\d{2}$/); // Must have exactly 2 decimal places

			const amount = parseFloat(price.replace('$', ''));
			expect(amount).toBeGreaterThan(0);
			expect(amount).toBeLessThan(10000); // Reasonable upper bound
		}
	});

	test('should verify cart functionality with specific product', async ({ page }) => {
		await loginPage.login('standard_user', 'secret_sauce');

		await inventoryPage.addItemToCartByName('Sauce Labs Bolt T-Shirt');

		await inventoryPage.goToCart();

		await cartPage.verifyItemInCart('Sauce Labs Bolt T-Shirt');

		const price = await cartPage.getItemPrice('Sauce Labs Bolt T-Shirt');
		await cartPage.verifyPriceFormat(price);

		expect(price).toBe('$15.99');
	});

	test('should maintain price integrity across pages', async ({ page }) => {
		await loginPage.login('standard_user', 'secret_sauce');

		const inventoryProductName = await inventoryPage.getFirstProductName();
		const inventoryPrice = await inventoryPage.getFirstProductPrice();

		expect(inventoryPrice).toMatch(/^\$\d+\.\d{2}$/);

		await inventoryPage.addFirstItemToCart();
		await inventoryPage.goToCart();

		const cartPrice = await cartPage.getItemPrice(inventoryProductName);

		expect(cartPrice).toBe(inventoryPrice);

		await cartPage.verifyPriceFormat(cartPrice);
	});
});