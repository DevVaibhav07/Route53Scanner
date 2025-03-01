import { Route53Client, ListHostedZonesCommand, ListResourceRecordSetsCommand } from "@aws-sdk/client-route-53";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { diffArrays } from 'diff';
import fetch from 'node-fetch';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const TABLE_NAME = process.env.TABLE_NAME;

const route53 = new Route53Client({
  credentials: {
    accessKeyId: process.env.TARGET_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.TARGET_SECRET_ACCESS_KEY || ''
  },
  region: process.env.TARGET_REGION
});
const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

async function sendToSlack(blocks: any) {
  if (!SLACK_WEBHOOK_URL) {
    throw new Error('SLACK_WEBHOOK_URL environment variable is not set');
  }

  const response = await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks })
  });

  if (!response.ok) {
    throw new Error(`Failed to send to Slack: ${response.statusText}`);
  }
}

interface Record {
  type: string;
  name: string;
  value: string;
  ttl?: number;
}

async function getAllRecords(): Promise<Record[]> {
  const hostedZones = await route53.send(new ListHostedZonesCommand({}));
  let allRecords: Record[] = [];

  for (const zone of hostedZones.HostedZones || []) {
    const records = await route53.send(
      new ListResourceRecordSetsCommand({
        HostedZoneId: zone.Id
      })
    );
    
    const formattedRecords = records.ResourceRecordSets?.map(record => ({
      type: record.Type || 'UNKNOWN',
      name: record.Name || 'UNKNOWN',
      value: record.ResourceRecords?.[0]?.Value || 'N/A'
    })) || [];

    allRecords = [...allRecords, ...formattedRecords];
  }

  return allRecords;
}

async function getPreviousScan(): Promise<Record[] | null> {
  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
  const scanDateStr = fiveMinutesAgo.toISOString().split('T')[0];

  try {
    const response = await ddb.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'scanDate = :date',
      ExpressionAttributeValues: {
        ':date': scanDateStr
      },
      ScanIndexForward: false,  // Get most recent first
      Limit: 1
    }));

    return response.Items?.[0]?.records || null;
  } catch (error) {
    console.error('Error fetching previous scan:', error);
    return null;
  }
}

async function storeScanResults(records: Record[]) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Set TTL to 30 days from now
  const ttl = Math.floor(today.setDate(today.getDate() + 30) / 1000);

  await ddb.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      scanDate: todayStr,
      records,
      ttl
    }
  }));
}

function formatDiffForSlack(currentRecords: Record[], previousRecords: Record[] | null) {
  if (!previousRecords) {
    return {
      added: currentRecords,
      removed: [],
      unchanged: 0
    };
  }

  // Sort records to ensure consistent comparison
  const sortRecords = (records: Record[]) => 
    records.sort((a, b) => `${a.type}${a.name}${a.value}` < `${b.type}${b.name}${b.value}` ? -1 : 1);

  const current = sortRecords(currentRecords);
  const previous = sortRecords(previousRecords);

  const added = current.filter(curr => 
    !previous.some(prev => 
      prev.type === curr.type && 
      prev.name === curr.name && 
      prev.value === curr.value
    )
  );

  const removed = previous.filter(prev => 
    !current.some(curr => 
      curr.type === prev.type && 
      curr.name === prev.name && 
      curr.value === prev.value
    )
  );

  return {
    added,
    removed,
    unchanged: currentRecords.length - added.length
  };
}

function createSlackMessage(diff: any, currentRecords: Record[]) {
  const scanTime = new Date().toISOString();
  const totalChanges = (diff.added?.length || 0) + (diff.removed?.length || 0);

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🔍 Daily Route53 Scan Report 🔍",
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Scan Time: ${scanTime}\n⚠️ *Summary:*\nTotal Records: ${currentRecords.length}\nAdditions/Deletions: ${totalChanges}\nUnchanged Records: ${diff.unchanged || currentRecords.length}`
      }
    }
  ];

  if (diff.added?.length > 0) {
    const addedText = diff.added.map((record: Record) => 
      `Domain: ${record.name}\nType: ${record.type}\nValue: ${record.value}`
    ).join('\n\n');

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `⚠️*New Records:*\n${addedText}`
      }
    });
  }

  if (diff.removed?.length > 0) {
    const removedText = diff.removed.map((record: Record) => 
      `Domain: ${record.name}\nType: ${record.type}\nValue: ${record.value}`
    ).join('\n\n');

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `⚠️*Removed Records:*\n${removedText}`
      }
    });
  }

  return { blocks };
}

export const handler = async (_event: any) => {
  try {
    const currentRecords = await getAllRecords();
    const previousRecords = await getPreviousScan();
    
    await storeScanResults(currentRecords);
    
    const diff = formatDiffForSlack(currentRecords, previousRecords);
    const message = createSlackMessage(diff, currentRecords);
    await sendToSlack(message.blocks);

    return { statusCode: 200, body: 'Scan completed successfully' };
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    await sendToSlack([{
      type: "section",
      text: {
        type: "mrkdwn",
        text: `❌ Error in daily Route53 scan:\n\`\`\`${errorMessage}\`\`\``
      }
    }]);

    throw error;
  }
}; 