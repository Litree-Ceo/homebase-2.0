import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service - LITLABS HomeBase</title>
        <meta name="description" content="Terms of Service for LITLABS HomeBase" />
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
                Terms of Service
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Last updated: January 4, 2026</p>
            </div>

            {/* Content */}
            <div className="prose dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  1. Agreement to Terms
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  By accessing or using LITLABS HomeBase ("the Service"), you agree to be bound by
                  these Terms of Service. If you disagree with any part of these terms, you may not
                  access the Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  2. Use License
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Subject to these Terms, LITLABS grants you a limited, non-exclusive,
                  non-transferable license to use the Service for your personal or business
                  purposes.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">You may not:</p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose without our consent</li>
                  <li>Attempt to decompile or reverse engineer any software</li>
                  <li>Remove any copyright or proprietary notations</li>
                  <li>Transfer the materials to another person</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  3. Subscriptions and Billing
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Some parts of the Service are billed on a subscription basis. You will be billed
                  in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are
                  set on a monthly or annual basis.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  At the end of each Billing Cycle, your subscription will automatically renew
                  unless you cancel it or LITLABS cancels it.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  4. Refund Policy
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We offer a 14-day money-back guarantee for all new subscriptions. If you're not
                  satisfied with the Service, contact us within 14 days of your purchase for a full
                  refund.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  After 14 days, all payments are non-refundable. Cancelling your subscription will
                  prevent future charges but will not refund past payments.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  5. Privacy Policy
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Your use of the Service is also governed by our Privacy Policy. We collect, use,
                  and protect your personal information as described in our{' '}
                  <Link href="/privacy" className="text-purple-600 hover:text-purple-700">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  6. User Accounts
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  You are responsible for maintaining the confidentiality of your account and
                  password. You agree to accept responsibility for all activities that occur under
                  your account.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  7. Limitation of Liability
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  In no event shall LITLABS, nor its directors, employees, partners, agents,
                  suppliers, or affiliates, be liable for any indirect, incidental, special,
                  consequential or punitive damages, including without limitation, loss of profits,
                  data, use, goodwill, or other intangible losses.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  8. Changes to Terms
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We reserve the right to modify or replace these Terms at any time. We will notify
                  you of any changes by posting the new Terms on this page and updating the "Last
                  updated" date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  9. Contact Us
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  If you have any questions about these Terms, please contact us:
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
