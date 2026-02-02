import { Page, Locator, expect } from '@playwright/test';

export class InventoryPage {
	readonly page: Page;
	readonly inventoryItems: Locator;
	readonly shoppingCartBadge: Locator;
	readonly shoppingCartLink: Locator;

	constructor(page: Page) {
		this.page = page;
		this.inventoryItems = page.locator('.inventory_item');
		this.shoppingCartBadge = page.locator('.shopping_cart_badge');
		this.shoppingCartLink = page.locator('.shopping_cart_link');
	}

	async addFirstItemToCart() {
		const firstItem = this.inventoryItems.first();
		const addToCartButton = firstItem.locator('[data-test^="add-to-cart"]');
		await addToCartButton.click();
	}

	async addItemToCartByName(productName: string) {
		const item = this.page.locator('.inventory_item', { hasText: productName });
		const addToCartButton = item.locator('[data-test^="add-to-cart"]');
		await addToCartButton.click();
	}

	async getFirstProductName(): Promise<string> {
		const firstItem = this.inventoryItems.first();
		const productName = firstItem.locator('.inventory_item_name');
		return await productName.textContent() || '';
	}

	async getFirstProductPrice(): Promise<string> {
		const firstItem = this.inventoryItems.first();
		const priceElement = firstItem.locator('.inventory_item_price');
		return await priceElement.textContent() || '';
	}

	async verifyCartBadgeCount(expectedCount: string) {
		await expect(this.shoppingCartBadge).toHaveText(expectedCount);
	}

	async goToCart() {
		await this.shoppingCartLink.click();
	}
}