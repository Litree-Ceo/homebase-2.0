import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - LITLABS HomeBase</title>
        <meta name="description" content="Privacy Policy for LITLABS HomeBase" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="mb-8">
              <Link href="/" className="text-purple-600 hover:text-purple-700 mb-4 inline-block">
                ← Back to Home
              </Link>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Privacy Policy
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Last updated: January 4, 2026</p>
            </div>

            {/* Content */}
            <div className="prose dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  1. Information We Collect
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Account information (name, email, password)</li>
                  <li>Payment information (processed securely through Paddle)</li>
                  <li>Usage data and preferences</li>
                  <li>Communications with our support team</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  2. How We Use Your Information
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Provide, maintain, and improve our Service</li>
                  <li>Process your transactions and send related information</li>
                  <li>Send you technical notices, updates, and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Protect against fraud and abuse</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  3. Information Sharing
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may
                  share your information with:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>
                    <strong>Service Providers:</strong> Companies that help us operate our Service
                    (e.g., Paddle for payments, Azure for hosting)
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> If required by law or to protect our rights
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with a merger, sale, or
                    acquisition
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  4. Data Security
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure Azure infrastructure with SOC 2 compliance</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  5. Cookies and Tracking
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We use cookies and similar tracking technologies to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Keep you signed in</li>
                  <li>Remember your preferences</li>
                  <li>Analyze how you use our Service</li>
                  <li>Improve user experience</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  You can control cookies through your browser settings.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  6. Your Rights
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Object to processing of your information</li>
                  <li>Export your data</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  To exercise these rights, contact us at litreelabs@outlook.com
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  7. Data Retention
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We retain your information for as long as your account is active or as needed to
                  provide you services. If you request deletion, we will delete your information
                  within 30 days, except where we are required to retain it for legal purposes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  8. Children's Privacy
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Our Service is not intended for children under 13. We do not knowingly collect
                  information from children under 13. If you believe we have collected information
                  from a child under 13, please contact us immediately.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  9. Changes to This Policy
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any
                  changes by posting the new Privacy Policy on this page and updating the "Last
                  updated" date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  10. Contact Us
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  If you have questions about this Privacy Policy, please contact us:
                </p>
                <ul className="list-none text-gray-700 dark:text-gray-300">
                  <li>📧 Email: litreelabs@outlook.com</li>
                  <li>
                    🌐 Website: litreelabstudio-bbgkcjhjg0huenb0.centralus-01.azurewebsites.net
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
