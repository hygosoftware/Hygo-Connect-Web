import type { Metadata } from 'next';
import { UniversalHeader } from '../../components/atoms';

export const metadata: Metadata = {
  title: 'Privacy Policy - Hygo Connect',
  description:
    'Hygo Healthcare Privacy Policy explaining how we collect, use, store, disclose, and safeguard your information in compliance with the DPDP Act, 2023 and applicable Indian laws.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = '02 Sep 2025';

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-30 bg-white">
        <UniversalHeader
          title="Privacy Policy"
          icon="document"
          variant="default"
          showBackButton={true}
        />
      </div>

      <main>
        <div className="max-w-4xl mx-auto px-4 py-6 pb-28">
          <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>

          <section className="space-y-4 mt-4">
            <p className="text-gray-700">
              Hygo Healthcare Private Limited (&quot;Hygo Healthcare,&quot; &quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;) respects your privacy and is committed to protecting your personal data. This
              Privacy Policy explains how we collect, use, store, disclose, and safeguard your information
              when you use the HYGO-connect mobile application (&quot;App&quot;).
            </p>
            <p className="text-gray-700">
              By accessing or using the App, you agree to the terms of this Privacy Policy and consent to
              the collection and use of your information as described herein, in compliance with the Digital
              Personal Data Protection Act, 2023 (DPDP Act), the Information Technology Act, 2000, and
              relevant Indian rules and regulations.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">1. Data We Collect</h2>
            <p className="text-gray-700">We may collect the following categories of personal and sensitive personal data:</p>

            <div className="space-y-2">
              <p className="font-medium text-blue-900">Personal Data:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Name, gender, date of birth</li>
                <li>Email address, phone number, address</li>
                <li>User ID and authentication data</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-blue-900">Health &amp; Sensitive Data:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Medical records, prescriptions, clinical history</li>
                <li>Appointment logs, symptom data</li>
                <li>Chat history with AI chatbot or healthcare providers</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-blue-900">Device &amp; Usage Data:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Device ID, model, OS version</li>
                <li>IP address, location data</li>
                <li>App usage statistics, crash logs</li>
              </ul>
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">2. Legal Basis for Processing</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Explicit user consent</li>
              <li>Contractual necessity (e.g., to deliver services)</li>
              <li>Compliance with legal obligations (e.g., medical data storage regulations)</li>
              <li>Legitimate interests, such as fraud prevention, analytics, and service improvement</li>
            </ul>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">3. How We Use Your Data</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Register and authenticate your account</li>
              <li>Enable appointment bookings and Card Memberships</li>
              <li>Facilitate chatbot interactions and healthcare access</li>
              <li>Provide medicine reminders and record storage</li>
              <li>Send notifications and service-related messages</li>
              <li>Improve the App functionality and user experience</li>
              <li>Conduct internal audits, analytics, and product development</li>
            </ul>
            <p className="text-gray-700">
              We may also use de-identified or aggregated user data to train machine learning models, optimize our AI chatbot,
              and enhance predictive care services. No personally identifiable information will be used for this purpose without
              your consent.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">4. Data Sharing and Disclosure</h2>
            <p className="text-gray-700">We do not sell your personal data. We may share your information:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>With third-party healthcare providers to deliver services</li>
              <li>With payment gateways (e.g., Razorpay, Paytm) for transactions</li>
              <li>With data processors or vendors for technical operations (under contractual obligations)</li>
              <li>When legally required (e.g., to comply with a court order or law enforcement request)</li>
              <li>In the event of a merger, acquisition, or asset sale (with adequate safeguards)</li>
              <li>
                With analytics providers or SDK services (e.g., Firebase) to monitor app usage, performance, and crash reports —
                limited to anonymized, non-medical data
              </li>
            </ul>
            <p className="text-gray-700">
              We may also use anonymized and aggregated data for research, clinical studies, academic partnerships, or commercial
              use in accordance with applicable laws.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">5. Your Rights</h2>
            <p className="text-gray-700">As a user under the DPDP Act, you have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Access your data</li>
              <li>Correct inaccuracies</li>
              <li>Withdraw consent at any time (impacting future processing)</li>
              <li>Request deletion of non-essential data</li>
              <li>File complaints with the Grievance Officer</li>
            </ul>
            <p className="text-gray-700">
              To exercise your rights, email:{' '}
              <a className="text-blue-700 underline" href="mailto:tech@thehygo.com">
                tech@thehygo.com
              </a>
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">6. Data Retention</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>
                Medical and user data will be retained for up to 10 years, or as required under applicable law (e.g., MCI
                Regulations).
              </li>
              <li>Data may be retained beyond service termination if required for legal or regulatory purposes.</li>
            </ul>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">7. Data Security</h2>
            <p className="text-gray-700">We implement appropriate administrative, technical, and physical safeguards to protect your data, including:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Data encryption</li>
              <li>Secure server access</li>
              <li>Role-based access control</li>
              <li>Monitoring and logging</li>
            </ul>
            <p className="text-gray-700">
              However, no system is completely secure. You access and use the App at your own risk.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">8. Children&apos;s Privacy</h2>
            <p className="text-gray-700">
              Our App is intended for users aged 18 years and above. If we become aware that a child has submitted personal
              data without guardian consent, we will delete such data.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">9. International Transfers</h2>
            <p className="text-gray-700">
              If data is transferred outside India (e.g., for cloud processing), such transfers will comply with applicable laws
              and include appropriate contractual safeguards.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">10. Changes to this Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. Users will be notified through the App or via email. Continued
              use of the App constitutes your acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">11. Grievance Redressal</h2>
            <p className="text-gray-700 font-medium">Grievance Officer</p>
            <p className="text-gray-700">Name: Smit Maniar</p>
            <p className="text-gray-700">
              Email:{' '}
              <a className="text-blue-700 underline" href="mailto:tech@thehygo.com">
                tech@thehygo.com
              </a>
            </p>
            <p className="text-gray-700">We aim to address all complaints within 15 days.</p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">12. Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions or concerns regarding this Privacy Policy, contact us at:
            </p>
            <p className="text-gray-700">
              Email:{' '}
              <a className="text-blue-700 underline" href="mailto:tech@thehygo.com">
                tech@thehygo.com
              </a>
            </p>
            <p className="text-gray-700">
              Address: Hygo Healthcare Private Limited, &quot;B-303, 9 Square Om decora beside Marwadi Shares building Nana mauva
              circle rajkot&quot;, India
            </p>
          </section>

          <section className="mt-8">
            <p className="text-gray-700">
              This Privacy Policy is compliant with the DPDP Act, 2023, the IT Act, 2000, and IT Rules, 2021, and applies to all
              users of the HYGO-connect App located in India or accessing the App from abroad.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}