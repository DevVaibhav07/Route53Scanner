import { useState } from 'react';
import { Key, Lock, Globe } from 'lucide-react';
import type { AWSCredentials } from '../types/aws';

interface CredentialsFormProps {
  onSubmit: (credentials: AWSCredentials) => void;
  isLoading: boolean;
}

export function CredentialsForm({ onSubmit, isLoading }: CredentialsFormProps) {
  const [credentials, setCredentials] = useState<AWSCredentials>({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1'
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(credentials); }} 
          className="space-y-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Access Key ID
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <Key className="h-5 w-5 text-blue-500" />
          </div>
          <input
            type="text"
            required
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={credentials.accessKeyId}
            onChange={(e) => setCredentials(prev => ({ ...prev, accessKeyId: e.target.value }))}
            placeholder="Enter AWS Access Key ID"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Secret Access Key
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            required
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={credentials.secretAccessKey}
            onChange={(e) => setCredentials(prev => ({ ...prev, secretAccessKey: e.target.value }))}
            placeholder="Enter your AWS Secret Access Key"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Region
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={credentials.region}
            onChange={(e) => setCredentials(prev => ({ ...prev, region: e.target.value }))}
          >
            <option value="ap-south-1">Asia Pacific (Mumbai)</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Scanning...
          </>
        ) : (
          'Scan Route 53 Records'
        )}
      </button>
    </form>
  );
}