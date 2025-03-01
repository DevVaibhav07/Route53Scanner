import { useState } from 'react';
import { Route53Client, ListHostedZonesCommand, ListResourceRecordSetsCommand } from "@aws-sdk/client-route-53";
import { Toaster, toast } from 'react-hot-toast';
import { ShieldAlert, Mail } from 'lucide-react';
import { CredentialsForm } from './components/CredentialsForm';
import { RecordsList } from './components/RecordsList';
import type { AWSCredentials, ResourceRecord } from './types/aws';
import { sendToSlack } from './utils/slack';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<ResourceRecord[]>([]);

  const scanRoute53 = async (credentials: AWSCredentials) => {
    setIsLoading(true);
    setRecords([]); // Clear previous records
    
    try {
      console.log('Initializing Route53 client...');
      const client = new Route53Client({
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
        },
        region: credentials.region,
      });

      console.log('Fetching hosted zones...');
      const zonesResponse = await client.send(new ListHostedZonesCommand({}));
      const zones = zonesResponse.HostedZones || [];
      console.log(`Found ${zones.length} hosted zones`);

      if (zones.length === 0) {
        toast.error('No hosted zones found in your account');
        return;
      }

      // For each zone, get its records
      const allRecords: ResourceRecord[] = [];
      
      for (const zone of zones) {
        console.log(`Fetching records for zone: ${zone.Name}`);
        try {
          const recordsResponse = await client.send(
            new ListResourceRecordSetsCommand({
              HostedZoneId: zone.Id?.replace('/hostedzone/', ''),
            })
          );

          if (recordsResponse.ResourceRecordSets) {
            const mappedRecords = recordsResponse.ResourceRecordSets.map(record => ({
              ...record,
              Name: record.Name || ''  // Ensure Name is always a string
            }));
            allRecords.push(...mappedRecords);
            console.log(`Found ${mappedRecords.length} records in zone ${zone.Name}`);
          }
        } catch (zoneError) {
          console.error(`Error fetching records for zone ${zone.Name}:`, zoneError);
          toast.error(`Failed to fetch records for zone ${zone.Name}`);
        }
      }

      setRecords(allRecords);
      
      // Send to Slack
      await sendToSlack({
        records: allRecords,
        timestamp: new Date().toISOString(),
        totalRecords: allRecords.length
      });

      toast.success('Scan completed and report sent to Slack!');
    } catch (error) {
      console.error('Scanning error:', error);
      toast.error('Failed to scan Route53 records');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white">
      <Toaster position="top-right" />
      
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ShieldAlert className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Vaibhav's Route 53 Scanner</span>
            </div>
            <div className="flex items-center">
              <a 
                href="mailto:dev.vaibhavk@gmail.com"
                className="flex items-center px-4 py-2 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Me
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              GUARDING YOUR<br />
              DIGITAL REALM
            </h1>
            <p className="mt-6 text-xl text-gray-600">
              Secure your AWS Route 53 domains with our advanced scanner. 
              Detect vulnerabilities and protect your digital infrastructure.
            </p>
            <div className="mt-8">
              <CredentialsForm onSubmit={scanRoute53} isLoading={isLoading} />
            </div>
          </div>
          
          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-blue-600/5 rounded-3xl animate-pulse"></div>
            <div className="relative w-96 h-96 mx-auto">
              {/* Outer rotating circle */}
              <div className="absolute inset-0 border-4 border-blue-200/30 rounded-full animate-spin-slow"></div>
              
              {/* Inner scanning effect */}
              <div className="absolute inset-4 border-4 border-blue-400/40 rounded-full animate-reverse-spin">
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="h-1/2 bg-gradient-to-b from-blue-500/20 to-blue-600/30 animate-scanner"></div>
                </div>
              </div>
              
              {/* Center shield */}
              <div className="absolute inset-8 flex items-center justify-center flex-col">
                <ShieldAlert className="w-32 h-32 text-blue-600" />
                <span className="text-blue-600 font-bold text-2xl mt-2 animate-pulse">VKR53</span>
              </div>
              
              {/* Floating dots */}
              <div className="absolute inset-0">
                <span className="absolute top-0 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-float"></span>
                <span className="absolute bottom-1/4 right-0 w-2 h-2 bg-blue-500 rounded-full animate-float-delayed"></span>
                <span className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-300 rounded-full animate-float"></span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <RecordsList records={records} />
        </div>
      </div>

      <footer className="mt-16 py-8 bg-blue-700 text-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center">
            Developed by <span className="font-semibold text-white-400">Vaibhav Kubade</span> <span className="text-gray-400">(Cyber Security Engineer)</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;