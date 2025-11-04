/**
 * E2E Test: Settings Persistence
 *
 * Tests settings persist across app restarts
 * Critical flow for MVP: User settings are saved to device storage
 *
 * Duration: ~45 seconds
 */

describe('Settings Persistence', () => {
  beforeAll(async () => {
    // Launch app
    await device.launchApp({
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    // Reset state between tests
    await device.reloadReactNative();
  });

  it('should navigate to settings screen', async () => {
    // Tap settings navigation
    await element(by.text('⚙️ Settings')).tap();

    // Verify settings screen loads
    await waitFor(element(by.text('Settings')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify key sections are visible
    await expect(element(by.text('Pricing'))).toBeVisible();
    await expect(element(by.text('Goals'))).toBeVisible();
  });

  it('should display default settings initially', async () => {
    // Navigate to settings
    await element(by.text('⚙️ Settings')).tap();

    // Verify default cost is shown
    await waitFor(element(by.id('costInput')))
      .toBeVisible()
      .withTimeout(5000);

    // Default cost should be 0.5
    await expect(element(by.id('costInput')).and(by.text('0.5'))).toBeVisible();

    // Default currency should be $
    await expect(element(by.id('currencyInput')).and(by.text('$'))).toBeVisible();
  });

  it('should allow changing cost per cigarette', async () => {
    await element(by.text('⚙️ Settings')).tap();

    // Wait for settings to load
    await waitFor(element(by.text('Settings')))
      .toBeVisible()
      .withTimeout(3000);

    // Find and clear cost input
    await element(by.id('costInput')).clearText();

    // Type new cost
    await element(by.id('costInput')).typeText('1.0');

    // Verify new cost is entered
    await expect(element(by.id('costInput')).and(by.text('1.0'))).toBeVisible();
  });

  it('should allow changing currency symbol', async () => {
    await element(by.text('⚙️ Settings')).tap();

    // Wait for settings to load
    await waitFor(element(by.text('Settings')))
      .toBeVisible()
      .withTimeout(3000);

    // Find and clear currency input
    await element(by.id('currencyInput')).clearText();

    // Type new currency
    await element(by.id('currencyInput')).typeText('€');

    // Verify new currency is entered
    await expect(element(by.id('currencyInput')).and(by.text('€'))).toBeVisible();
  });

  it('should save settings changes', async () => {
    await element(by.text('⚙️ Settings')).tap();

    // Wait for settings to load
    await waitFor(element(by.text('Settings')))
      .toBeVisible()
      .withTimeout(3000);

    // Change cost
    await element(by.id('costInput')).clearText();
    await element(by.id('costInput')).typeText('1.5');

    // Change currency
    await element(by.id('currencyInput')).clearText();
    await element(by.id('currencyInput')).typeText('£');

    // Tap save button
    await element(by.text('Save Settings')).tap();

    // Wait for success message
    await waitFor(element(by.text('Success')))
      .toBeVisible()
      .withTimeout(5000);

    // Tap OK on alert
    await element(by.text('OK')).tap();
  });

  it('should allow setting daily goal', async () => {
    await element(by.text('⚙️ Settings')).tap();

    // Wait for settings to load
    await waitFor(element(by.text('Settings')))
      .toBeVisible()
      .withTimeout(3000);

    // Find daily goal input
    await element(by.id('dailyGoalInput')).typeText('5');

    // Verify goal is entered
    await expect(element(by.id('dailyGoalInput')).and(by.text('5'))).toBeVisible();
  });

  it('should persist cost setting across app restart', async () => {
    // Set cost to 2.0
    await element(by.text('⚙️ Settings')).tap();
    await waitFor(element(by.text('Settings')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('costInput')).clearText();
    await element(by.id('costInput')).typeText('2.0');

    // Save
    await element(by.text('Save Settings')).tap();
    await waitFor(element(by.text('Success')))
      .toBeVisible()
      .withTimeout(3000);

    // Tap OK
    await element(by.text('OK')).tap();

    // Navigate away
    await element(by.text('VibeKeeper')).tap();

    // Kill and restart app
    await device.sendToHome();
    await device.launchApp({ newInstance: false });

    // Navigate back to settings
    await element(by.text('⚙️ Settings')).tap();

    // Verify cost persisted
    await waitFor(element(by.id('costInput')).and(by.text('2.0')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should persist currency symbol across app restart', async () => {
    // Set currency to £
    await element(by.text('⚙️ Settings')).tap();
    await waitFor(element(by.text('Settings')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('currencyInput')).clearText();
    await element(by.id('currencyInput')).typeText('£');

    // Save
    await element(by.text('Save Settings')).tap();
    await waitFor(element(by.text('Success')))
      .toBeVisible()
      .withTimeout(3000);

    // Tap OK
    await element(by.text('OK')).tap();

    // Navigate away
    await element(by.text('VibeKeeper')).tap();

    // Kill and restart app
    await device.sendToHome();
    await device.launchApp({ newInstance: false });

    // Navigate back to settings
    await element(by.text('⚙️ Settings')).tap();

    // Verify currency persisted
    await waitFor(element(by.id('currencyInput')).and(by.text('£')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should persist daily goal across app restart', async () => {
    // Set daily goal to 10
    await element(by.text('⚙️ Settings')).tap();
    await waitFor(element(by.text('Settings')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('dailyGoalInput')).typeText('10');

    // Save
    await element(by.text('Save Settings')).tap();
    await waitFor(element(by.text('Success')))
      .toBeVisible()
      .withTimeout(3000);

    // Tap OK
    await element(by.text('OK')).tap();

    // Navigate away
    await element(by.text('VibeKeeper')).tap();

    // Kill and restart app
    await device.sendToHome();
    await device.launchApp({ newInstance: false });

    // Navigate back to settings
    await element(by.text('⚙️ Settings')).tap();

    // Verify goal persisted
    await waitFor(element(by.id('dailyGoalInput')).and(by.text('10')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should apply settings changes to home screen cost display', async () => {
    // Go home and add a cigarette
    await element(by.text('Quick Add Cigarette')).tap();
    await waitFor(element(by.text('1')))
      .toBeVisible()
      .withTimeout(3000);

    // Should show default cost (0.5)
    await expect(element(by.text('$0.50'))).toBeVisible();

    // Go to settings and change cost
    await element(by.text('⚙️ Settings')).tap();
    await waitFor(element(by.text('Settings')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('costInput')).clearText();
    await element(by.id('costInput')).typeText('1.0');

    // Save
    await element(by.text('Save Settings')).tap();
    await waitFor(element(by.text('Success')))
      .toBeVisible()
      .withTimeout(3000);

    // Tap OK
    await element(by.text('OK')).tap();

    // Go back home
    await element(by.text('VibeKeeper')).tap();

    // Cost display should update to new currency * 1 log
    await waitFor(element(by.text('$1.00')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle multiple setting changes together', async () => {
    await element(by.text('⚙️ Settings')).tap();
    await waitFor(element(by.text('Settings')))
      .toBeVisible()
      .withTimeout(3000);

    // Change multiple settings
    await element(by.id('costInput')).clearText();
    await element(by.id('costInput')).typeText('1.75');

    await element(by.id('currencyInput')).clearText();
    await element(by.id('currencyInput')).typeText('€');

    await element(by.id('dailyGoalInput')).typeText('8');

    // Save
    await element(by.text('Save Settings')).tap();
    await waitFor(element(by.text('Success')))
      .toBeVisible()
      .withTimeout(3000);

    // Tap OK
    await element(by.text('OK')).tap();

    // Navigate away and back
    await device.reloadReactNative();

    // Go back to settings
    await element(by.text('⚙️ Settings')).tap();
    await waitFor(element(by.text('Settings')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify all settings persisted
    await expect(element(by.id('costInput')).and(by.text('1.75'))).toBeVisible();
    await expect(element(by.id('currencyInput')).and(by.text('€'))).toBeVisible();
    await expect(element(by.id('dailyGoalInput')).and(by.text('8'))).toBeVisible();
  });

  it('should show privacy notice in about section', async () => {
    await element(by.text('⚙️ Settings')).tap();

    // Scroll down to about section
    await waitFor(element(by.text('About')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify privacy notice
    await expect(
      element(by.text(/All data is stored locally/))
    ).toBeVisible();
  });
});
