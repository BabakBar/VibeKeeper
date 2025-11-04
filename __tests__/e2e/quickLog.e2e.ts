/**
 * E2E Test: Quick Log Flow
 *
 * Tests the quick log functionality on device/simulator
 * Critical flow for MVP: User can quickly log a cigarette
 *
 * Duration: ~30 seconds
 */

describe('Quick Log Flow', () => {
  beforeAll(async () => {
    // Launch app before tests
    await device.launchApp({
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    // Reset app state between tests
    await device.reloadReactNative();
  });

  it('should display home screen with 0 cigarettes initially', async () => {
    // Verify header is visible
    await expect(element(by.text('VibeKeeper'))).toBeVisible();

    // Verify initial count is 0
    await expect(element(by.text('0'))).toBeVisible();
    await expect(element(by.text('cigarettes'))).toBeVisible();
  });

  it('should increment count when quick add button is tapped', async () => {
    // Verify initial state
    await expect(element(by.text('0'))).toBeVisible();

    // Tap quick add button
    await element(by.text('Quick Add Cigarette')).tap();

    // Wait for count to increment to 1
    await waitFor(element(by.text('1')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify cost is calculated (default 0.50)
    await expect(element(by.text('$0.50'))).toBeVisible();
  });

  it('should add multiple cigarettes', async () => {
    // Add first cigarette and wait for it
    await element(by.text('Quick Add Cigarette')).tap();
    await waitFor(element(by.text('1')))
      .toBeVisible()
      .withTimeout(3000);

    // Add second cigarette and wait for it
    await element(by.text('Quick Add Cigarette')).tap();
    await waitFor(element(by.text('2')))
      .toBeVisible()
      .withTimeout(3000);

    // Add third cigarette and wait for it
    await element(by.text('Quick Add Cigarette')).tap();
    await waitFor(element(by.text('3')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify total cost (3 * 0.50 = 1.50)
    await expect(element(by.text('$1.50'))).toBeVisible();
  });

  it('should show recent logs after quick add', async () => {
    // Add a cigarette
    await element(by.text('Quick Add Cigarette')).tap();

    // Wait for recent logs section to appear
    await waitFor(element(by.text('Recent Logs')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify log entry is visible
    await expect(element(by.text(/just now|ago/))).toBeVisible();
  });

  it('should maintain count across quick adds', async () => {
    // Add first cigarette
    await element(by.text('Quick Add Cigarette')).tap();
    await waitFor(element(by.text('1')))
      .toBeVisible()
      .withTimeout(3000);

    // Add second cigarette
    await element(by.text('Quick Add Cigarette')).tap();
    await waitFor(element(by.text('2')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify final count
    await expect(element(by.text('2'))).toBeVisible();
  });

  it('should show today stats update', async () => {
    // Verify stats section exists
    await expect(element(by.text("Today's Progress"))).toBeVisible();

    // Add cigarette
    await element(by.text('Quick Add Cigarette')).tap();

    // Wait for count to update
    await waitFor(element(by.text('1')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify "spent" amount is shown
    await expect(element(by.text('spent'))).toBeVisible();
  });

  it('should navigate to logs from quick log screen', async () => {
    // Add a cigarette first
    await element(by.text('Quick Add Cigarette')).tap();
    await waitFor(element(by.text('1')))
      .toBeVisible()
      .withTimeout(3000);

    // Tap logs navigation
    await element(by.text('📋 Logs')).tap();

    // Verify logs screen loads
    await waitFor(element(by.text('My Logs')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should return to home and maintain count', async () => {
    // Add cigarettes
    await element(by.text('Quick Add Cigarette')).multiTap(2);
    await waitFor(element(by.text('2')))
      .toBeVisible()
      .withTimeout(5000);

    // Navigate to logs
    await element(by.text('📋 Logs')).tap();
    await waitFor(element(by.text('My Logs')))
      .toBeVisible()
      .withTimeout(3000);

    // Navigate back (typically via back button or home navigation)
    // This tests that count persists
    await device.reloadReactNative();

    // Count should still be 2
    await waitFor(element(by.text('2')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
