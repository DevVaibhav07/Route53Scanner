import { FileText } from 'lucide-react';
import type { ResourceRecord } from '../types/aws';

interface RecordsListProps {
  records: ResourceRecord[];
}

export function RecordsList({ records }: RecordsListProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100">
        <FileText className="mx-auto h-12 w-12 text-blue-600" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No records found</h3>
        <p className="mt-2 text-gray-600">Enter your AWS credentials to start scanning your Route 53 zones.</p>
      </div>
    );
  }

  const getRecordValue = (record: ResourceRecord): string => {
    if (record.ResourceRecords && record.ResourceRecords.length > 0) {
      return record.ResourceRecords.map(r => r.Value).join(', ');
    }
    if (record.AliasTarget?.DNSName) {
      return `${record.AliasTarget.DNSName} (Alias)`;
    }
    return 'N/A';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-900">Scan Results</h2>
        <p className="mt-1 text-sm text-gray-600">Found {records.length} DNS records in your Route 53 zones</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TTL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record, index) => (
              <tr key={`${record.Name}-${index}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {record.Name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.Type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.TTL || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getRecordValue(record)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}