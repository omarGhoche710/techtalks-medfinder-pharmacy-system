// =====================================================
// Notification Service
// =====================================================

export async function sendTransferNotification(
  transferId: string,
  status: string,
) {
  console.log(
    `[Notification] Transfer ${transferId} status changed to ${status}`,
  );

  // Future integrations:
  // - Email
  // - SMS
  // - Push Notifications
  // - WebSockets
}
