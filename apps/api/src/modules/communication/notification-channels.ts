export interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  userId: string;
  link?: string;
}

export interface NotificationChannel {
  send(notification: NotificationPayload): Promise<void>;
}

// Each URL can point to an email, SMS, or push adapter owned by the deployment.
export class WebhookNotificationChannel implements NotificationChannel {
  constructor(
    private readonly channel: "email" | "sms" | "push",
    private readonly url: string | undefined,
  ) {}

  async send(notification: NotificationPayload) {
    if (!this.url) return;
    const token = process.env.NOTIFICATION_WEBHOOK_TOKEN;
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ channel: this.channel, notification }),
    });
    if (!response.ok) {
      throw new Error(`${this.channel} notification webhook returned ${response.status}.`);
    }
  }
}

export const notificationChannels: NotificationChannel[] = [
  new WebhookNotificationChannel("email", process.env.EMAIL_NOTIFICATION_WEBHOOK),
  new WebhookNotificationChannel("sms", process.env.SMS_NOTIFICATION_WEBHOOK),
  new WebhookNotificationChannel("push", process.env.PUSH_NOTIFICATION_WEBHOOK),
];

export function deliverExternalNotifications(notification: NotificationPayload) {
  for (const channel of notificationChannels) {
    void channel.send(notification).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Notification delivery failed.";
      console.error(message);
    });
  }
}
