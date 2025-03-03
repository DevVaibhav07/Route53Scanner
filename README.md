# AWS Route 53 Scanner

A security tool designed to monitor and detect potential DNS vulnerabilities in AWS Route 53 configurations. This application consists of a React-based web interface and an AWS Lambda function that performs periodic scans of Route 53 records.

## Features

- 🔍 Real-time Route 53 DNS record scanning
- 🔄 Automated periodic scans (every 5 minutes)
- 📊 Historical scan data storage in DynamoDB
- 🔔 Slack notifications for DNS changes
- 📱 Responsive web interface
- 🔒 Cross-account scanning support

## Architecture

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: AWS Lambda (Node.js 18.x)
- **Infrastructure**: AWS SAM (Serverless Application Model)
- **Storage**: DynamoDB
- **Notifications**: Slack Webhooks

## Prerequisites

- Node.js 18.x or later
- AWS SAM CLI
- AWS Account with appropriate permissions
- Slack Webhook URL (for notifications)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aws-route53-scanner
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install Lambda function dependencies
cd lambda
npm install
```

3. Configure environment variables:
- Create a `.env` file in the root directory:
```env
VITE_SLACK_WEBHOOK_URL=your_slack_webhook_url
```

## Development

1. Start the frontend development server:
```bash
npm run dev
```

2. Build the Lambda function:
```bash
cd lambda
npm run build
```

## Deployment

1. Update the deployment configuration in `deploy-lambda.sh`:
```bash
# Configure your AWS credentials and region
export TARGET_ACCESS_KEY_ID="your_access_key"
export TARGET_SECRET_ACCESS_KEY="your_secret_key"
export TARGET_REGION="your_region"
```

2. Deploy using SAM:
```bash
./deploy-lambda.sh
```

## Security Considerations

- Store AWS credentials securely
- Use IAM roles with minimum required permissions
- Regularly rotate access keys
- Monitor CloudWatch logs for suspicious activities

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Vaibhav Kubade - Cyber Security Engineer
- Email: dev.vaibhavk@gmail.com

## Acknowledgments

- AWS SDK for JavaScript
- React and Vite communities
- TailwindCSS team
## Preview
![image](https://github.com/user-attachments/assets/9a2ec945-3e34-4cfc-b43a-446eb127e41c)
