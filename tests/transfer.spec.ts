import { test, expect } from '@playwright/test';
import { TransferPage } from '../pages/TransferPage';

test.describe('Money Transfer - API Mocking', () => {
	let transferPage: TransferPage;

	test('should handle successful money transfer (200 OK)', async ({ page }) => {
		await page.route('**/api/transfer', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					status: 'success',
					transactionId: '12345'
				})
			});
		});

		transferPage = new TransferPage(page);
		await transferPage.goto();

		await transferPage.fillTransferForm('ACC123456', '100.50');

		await transferPage.submitTransfer();

		await transferPage.waitForMessage();

		await transferPage.verifySuccessMessage('12345');

		await expect(transferPage.messageContainer).toContainText('success');
		await expect(transferPage.submitButton).toBeEnabled();
		await expect(transferPage.submitButton).toHaveText('Transfer Money');
	});

	test('should handle insufficient funds error (400 Bad Request)', async ({ page }) => {
		await page.route('**/api/transfer', async (route) => {
			await route.fulfill({
				status: 400,
				contentType: 'application/json',
				body: JSON.stringify({
					error: 'Insufficient funds'
				})
			});
		});

		transferPage = new TransferPage(page);
		await transferPage.goto();

		await transferPage.fillTransferForm('ACC789012', '5000.00');

		await transferPage.submitTransfer();

		await transferPage.waitForMessage();

		await transferPage.verifyErrorMessage('Insufficient funds');

		await expect(transferPage.messageContainer).toHaveClass(/error/);
		await expect(transferPage.submitButton).toBeEnabled();
		await expect(transferPage.submitButton).toHaveText('Transfer Money');
	});

	test('should handle network error gracefully', async ({ page }) => {
		await page.route('**/api/transfer', async (route) => {
			await route.abort('failed');
		});

		transferPage = new TransferPage(page);
		await transferPage.goto();

		await transferPage.fillTransferForm('ACC999999', '250.00');

		await transferPage.submitTransfer();

		await transferPage.waitForMessage();

		await expect(transferPage.messageContainer).toHaveClass(/error/);
		await expect(transferPage.messageContainer).toContainText('Network Error');
	});

	test('should disable submit button during processing', async ({ page }) => {
		await page.route('**/api/transfer', async (route) => {
			await new Promise(resolve => setTimeout(resolve, 2000));
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					status: 'success',
					transactionId: '67890'
				})
			});
		});

		transferPage = new TransferPage(page);
		await transferPage.goto();

		await transferPage.fillTransferForm('ACC111111', '75.25');

		const submitPromise = transferPage.submitTransfer();

		await expect(transferPage.submitButton).toBeDisabled();
		await expect(transferPage.submitButton).toContainText('Processing');

		await submitPromise;
		await transferPage.waitForMessage();

		await expect(transferPage.submitButton).toBeEnabled();
	});
});