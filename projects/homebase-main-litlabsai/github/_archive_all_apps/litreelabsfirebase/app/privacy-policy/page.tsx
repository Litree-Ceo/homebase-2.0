export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-black mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3">1. Introduction</h2>
            <p>
              LitLabs (we, us, our, or Company) operates the litlabs-web.vercel.app website and LitLabs mobile applications (collectively, the Service). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">2. Information Collection and Use</h2>
            <p>
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>Personal Data: Email address, name, phone number, usage data</li>
              <li>Usage Data: Browser type, IP address, pages visited, time and date</li>
              <li>Cookies: We use cookies to track user behavior and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">3. Use of Data</h2>
            <p>
              LitLabs uses the collected data for various purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To gather analysis or valuable information to improve the Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address fraud and technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">4. Security of Data</h2>
            <p>
              The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">5. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at support@litlabs.io
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
