import { ResourceRecordSet } from "@aws-sdk/client-route-53";

export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export type ResourceRecord = ResourceRecordSet;