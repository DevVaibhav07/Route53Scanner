import type { ResourceRecord } from '../types/aws';

interface SlackMessage {
  records: ResourceRecord[];
  timestamp: string;
  totalRecords: number;
}

export async function sendToSlack(message: SlackMessage) {
  const webhookUrl = import.meta.env.VITE_SLACK_WEBHOOK_URL;
  
  const formattedRecords = message.records.map(record => ({
    type: record.Type,
    name: record.Name,
    value: record.ResourceRecords?.[0]?.Value || 'N/A'
  }));

  const slackPayload = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🔍 AWS Route53 Scan Report",
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Scan Time:*\n${message.timestamp}`
          },
          {
            type: "mrkdwn",
            text: `*Total Records:*\n${message.totalRecords}`
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "```" + JSON.stringify(formattedRecords, null, 2) + "```"
        }
      }
    ]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackPayload),
    });

    if (!response.ok) {
      throw new Error('Failed to send to Slack');
    }
  } catch (error) {
    console.error('Error sending to Slack:', error);
    throw error;
  }
} 