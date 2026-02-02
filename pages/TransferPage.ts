import { Page, Locator, expect } from '@playwright/test';

export class TransferPage {
	readonly page: Page;
	readonly recipientInput: Locator;
	readonly amountInput: Locator;
	readonly submitButton: Locator;
	readonly messageContainer: Locator;
	readonly transactionId: Locator;

	constructor(page: Page) {
		this.page = page;
		this.recipientInput = page.getByTestId('recipient-input');
		this.amountInput = page.getByTestId('amount-input');
		this.submitButton = page.getByTestId('submit-button');
		this.messageContainer = page.getByTestId('message');
		this.transactionId = page.getByTestId('transaction-id');
	}

	async goto() {
		await this.page.goto('http://localhost:3000/transfer.html');
	}

	async fillTransferForm(recipient: string, amount: string) {
		await this.recipientInput.fill(recipient);
		await this.amountInput.fill(amount);
	}

	async submitTransfer() {
		await this.submitButton.click();
	}

	async verifySuccessMessage(expectedTransactionId: string) {
		await expect(this.messageContainer).toHaveClass(/success/);
		await expect(this.messageContainer).toContainText('Transfer Successful');
		await expect(this.transactionId).toHaveText(expectedTransactionId);
	}

	async verifyErrorMessage(expectedError: string) {
		await expect(this.messageContainer).toHaveClass(/error/);
		await expect(this.messageContainer).toContainText('Transfer Failed');
		await expect(this.messageContainer).toContainText(expectedError);
	}

	async waitForMessage() {
		await this.messageContainer.waitFor({ state: 'visible' });
	}
}