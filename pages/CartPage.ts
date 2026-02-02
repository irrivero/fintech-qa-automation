import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
	readonly page: Page;
	readonly cartItems: Locator;
	readonly cartItemNames: Locator;
	readonly cartItemPrices: Locator;
	readonly checkoutButton: Locator;
	readonly continueShoppingButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.cartItems = page.locator('.cart_item');
		this.cartItemNames = page.locator('.inventory_item_name');
		this.cartItemPrices = page.locator('.inventory_item_price');
		this.checkoutButton = page.locator('[data-test="checkout"]');
		this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
	}

	async verifyItemInCart(productName: string) {
		await expect(this.cartItemNames.filter({ hasText: productName })).toBeVisible();
	}

	async getItemPrice(productName: string): Promise<string> {
		const item = this.page.locator('.cart_item', { hasText: productName });
		const priceElement = item.locator('.inventory_item_price');
		return await priceElement.textContent() || '';
	}

	async verifyPriceFormat(price: string) {
		expect(price).toMatch(/^\$\d+\.\d{2}$/);
	}

	async verifyCartItemCount(expectedCount: number) {
		await expect(this.cartItems).toHaveCount(expectedCount);
	}

	async getAllPrices(): Promise<string[]> {
		const prices = await this.cartItemPrices.allTextContents();
		return prices;
	}
}