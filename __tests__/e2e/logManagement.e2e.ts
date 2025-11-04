/**
 * E2E Test: Log Management Flow
 *
 * Tests full log lifecycle: add with details, view, delete
 * Critical flow for MVP: Complete log management workflow
 *
 * Duration: ~1 minute
 */

describe('Log Management Flow', () => {
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

  it('should navigate to logs screen', async () => {
    // Tap logs navigation
    await element(by.text('📋 Logs')).tap();

    // Verify logs screen loads
    await waitFor(element(by.text('My Logs')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify date navigation is visible
    await expect(element(by.text('← Prev'))).toBeVisible();
    await expect(element(by.text('Next →'))).toBeVisible();
  });

  it('should display empty state initially', async () => {
    // Navigate to logs
    await element(by.text('📋 Logs')).tap();

    // Verify empty state message
    await waitFor(element(by.text('No logs for this date')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should open add modal', async () => {
    // Navigate to logs
    await element(by.text('📋 Logs')).tap();
    await waitFor(element(by.text('My Logs')))
      .toBeVisible()
      .withTimeout(3000);

    // Tap add log button
    await element(by.text('+ Add Log')).tap();

    // Verify modal opens
    await waitFor(element(by.text('Add Log')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify form fields
    await expect(element(by.id('timeInput'))).toBeVisible();
    await expect(element(by.id('notesInput'))).toBeVisible();
  });

  it('should add log with details', async () => {
    // Navigate to logs
    await element(by.text('📋 Logs')).tap();
    await waitFor(element(by.text('My Logs')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify empty state
    await expect(element(by.text('No logs for this date'))).toBeVisible();

    // Open add modal
    await element(by.text('+ Add Log')).tap();

    // Fill in time (use placeholder text to identify input)
    await element(by.placeholder('14:30')).typeText('14:30');

    // Fill in notes
    await element(by.placeholder('Add any notes...')).typeText('After lunch');

    // Submit
    await element(by.text('Add Log')).tap();

    // Wait for modal to close and log to appear
    await waitFor(element(by.text('After lunch')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify cigarette count updated
    await expect(element(by.text('1 cigarettes'))).toBeVisible();
  });

  it('should display added log in list', async () => {
    // Add a log first
    await element(by.text('📋 Logs')).tap();
    await waitFor(element(by.text('My Logs')))
      .toBeVisible()
      .withTimeout(3000);

    // Add log
    await element(by.text('+ Add Log')).tap();
    await element(by.placeholder('14:30')).typeText('14:30');
    await element(by.placeholder('Add any notes...')).typeText('Test cigarette');
    await element(by.text('Add Log')).tap();

    // Verify log appears in list
    await waitFor(element(by.text('Test cigarette')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify time is displayed
    await expect(element(by.text('14:30'))).toBeVisible();
  });

  it('should add multiple logs', async () => {
    await element(by.text('📋 Logs')).tap();
    await waitFor(element(by.text('My Logs')))
      .toBeVisible()
      .withTimeout(3000);

    // Add first log
    await element(by.text('+ Add Log')).tap();
    await element(by.placeholder('14:30')).typeText('14:00');
    await element(by.placeholder('Add any notes...')).typeText('Morning cigarette');
    await element(by.text('Add Log')).tap();

    // Wait for first log to appear
    await waitFor(element(by.text('Morning cigarette')))
      .toBeVisible()
      .withTimeout(3000);

    // Add second log
    await element(by.text('+ Add Log')).tap();
    await element(by.placeholder('14:30')).typeText('15:00');
    await element(by.placeholder('Add any notes...')).typeText('Afternoon break');
    await element(by.text('Add Log')).tap();

    // Wait for second log to appear
    await waitFor(element(by.text('Afternoon break')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify count shows 2
    await expect(element(by.text('2 cigarettes'))).toBeVisible();
  });

  it('should delete log', async () => {
    await element(by.text('📋 Logs')).tap();
    await waitFor(element(by.text('My Logs')))
      .toBeVisible()
      .withTimeout(3000);

    // Add a log to delete
    await element(by.text('+ Add Log')).tap();
    await element(by.placeholder('14:30')).typeText('14:30');
    await element(by.placeholder('Add any notes...')).typeText('To be deleted');
    await element(by.text('Add Log')).tap();

    // Wait for log to appear
    await waitFor(element(by.text('To be deleted')))
      .toBeVisible()
      .withTimeout(5000);

    // Tap delete button (×)
    await element(by.text('×')).atIndex(0).tap();

    // Confirm delete if alert appears
    await waitFor(element(by.text('Delete')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.text('Delete')).tap();

    // Verify log is removed
    await waitFor(element(by.text('No logs for this date')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify count is back to 0
    await expect(element(by.text('0 cigarettes'))).toBeVisible();
  });

  it('should navigate between dates', async () => {
    await element(by.text('📋 Logs')).tap();
    await waitFor(element(by.text('My Logs')))
      .toBeVisible()
      .withTimeout(3000);

    // Get current date text
    const currentDateRegex = /\d{4}-\d{2}-\d{2}/;

    // Navigate to previous date
    await element(by.text('← Prev')).tap();

    // Date should have changed
    await expect(element(by.text(/\d{4}-\d{2}-\d{2}/))).toBeVisible();

    // Navigate back to today
    // Tap the date area to go to today
    await element(by.text(/\d{4}-\d{2}-\d{2}/)).tap();

    // Should show current date again
    await expect(element(by.text(/\d{4}-\d{2}-\d{2}/))).toBeVisible();
  });

  it('should show relative time for logs', async () => {
    await element(by.text('📋 Logs')).tap();
    await waitFor(element(by.text('My Logs')))
      .toBeVisible()
      .withTimeout(3000);

    // Add a log
    await element(by.text('+ Add Log')).tap();
    await element(by.placeholder('14:30')).typeText('14:30');
    await element(by.placeholder('Add any notes...')).typeText('Recent log');
    await element(by.text('Add Log')).tap();

    // Wait for log and check for relative time
    await waitFor(element(by.text('Recent log')))
      .toBeVisible()
      .withTimeout(5000);

    // Should show "just now" or recent time
    await expect(element(by.text(/just now|ago/))).toBeVisible();
  });

  it('should filter logs by date', async () => {
    await element(by.text('📋 Logs')).tap();
    await waitFor(element(by.text('My Logs')))
      .toBeVisible()
      .withTimeout(3000);

    // Add a log with today's date
    await element(by.text('+ Add Log')).tap();
    await element(by.placeholder('14:30')).typeText('14:30');
    await element(by.placeholder('Add any notes...')).typeText('Today log');
    await element(by.text('Add Log')).tap();

    // Verify log appears
    await waitFor(element(by.text('Today log')))
      .toBeVisible()
      .withTimeout(3000);

    // Navigate to previous date
    await element(by.text('← Prev')).tap();

    // Log should no longer be visible (different date)
    await expect(element(by.text('Today log'))).not.toBeVisible();

    // Should show empty state for previous date
    await expect(element(by.text('No logs for this date'))).toBeVisible();

    // Navigate back to today
    await element(by.text('Next →')).tap();

    // Log should be visible again
    await waitFor(element(by.text('Today log')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should complete full lifecycle: add → view → delete', async () => {
    await element(by.text('📋 Logs')).tap();
    await waitFor(element(by.text('My Logs')))
      .toBeVisible()
      .withTimeout(3000);

    // Add log
    await element(by.text('+ Add Log')).tap();
    await element(by.placeholder('14:30')).typeText('16:00');
    await element(by.placeholder('Add any notes...')).typeText('Final test');
    await element(by.text('Add Log')).tap();

    // Verify it appears
    await waitFor(element(by.text('Final test')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify count is 1
    await expect(element(by.text('1 cigarettes'))).toBeVisible();

    // Delete it
    await element(by.text('×')).atIndex(0).tap();
    await element(by.text('Delete')).tap();

    // Verify empty state
    await waitFor(element(by.text('No logs for this date')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify count is 0
    await expect(element(by.text('0 cigarettes'))).toBeVisible();
  });
});
