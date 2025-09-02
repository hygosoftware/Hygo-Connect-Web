import type { Metadata } from 'next';
import { UniversalHeader } from '../../components/atoms';

export const metadata: Metadata = {
  title: 'Terms & Conditions - Hygo Connect',
  description:
    'Hygo Healthcare Terms & Conditions outlining the rules of use, user responsibilities, and legal terms for using HYGO-connect.',
};

export default function TermsPage() {
  const lastUpdated = '02 Sep 2025';

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-30 bg-white">
        <UniversalHeader
          title="Terms & Conditions"
          icon="document"
          variant="default"
          showBackButton={true}
        />
      </div>

      <main>
        <div className="terms-content max-w-4xl mx-auto px-4 py-6 pb-28">
          <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>

          {/* Intro */}
          <section className="space-y-4 mt-4">
            <p className="text-gray-700">
              Welcome to HYGO-platform, a mobile application and Website developed and operated by Hygo Technology Private
              Limited ("Hygo Technology," "we," "us," or "our"), designed to facilitate healthcare services within the Nexus
              Panel ecosystem. By accessing, downloading, or using the HYGO-connect mobile application ("App"), you ("User,"
              "you," or "your") agree to be bound by these Terms and Conditions ("Terms"). These Terms constitute a legally
              binding agreement between you and Hygo Healthcare. If you do not agree with these Terms, please refrain from using the App.
            </p>
            <p className="text-gray-700">
              By using the App, you also provide specific and informed consent to our Privacy Policy, which governs how we collect,
              use, share, and protect your personal and medical information. These Terms incorporate the Privacy Policy and any
              other rules, guidelines, or policies relevant under applicable Indian laws, including but not limited to the Information
              Technology Act, 2000, the Digital Personal Data Protection Act, 2023 (DPDP Act), and IT Rules, 2021.
            </p>
          </section>

          {/* 1. Definitions */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">1. Definitions</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li><span className="font-medium">App:</span> Refers to the HYGO-connect mobile application available on the Google Play Store.</li>
              <li><span className="font-medium">Card Membership:</span> A subscription-based membership plan purchased through the App for accessing Hygo Healthcare services.</li>
              <li><span className="font-medium">Services:</span> Includes but is not limited to booking appointments, AI chatbot consultations, medicine reminders, and access to non-emergency healthcare services provided by Hygo Healthcare clinics or third-party providers.</li>
              <li><span className="font-medium">Third-Party Providers:</span> Doctors, medical professionals, or institutions providing services through the App, integrated within the Nexus Panel ecosystem.</li>
              <li><span className="font-medium">User Content:</span> Any data, information, medical records, or other materials uploaded or provided by the User through the App.</li>
            </ul>
          </section>

          {/* 2. Eligibility */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">2. Eligibility</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Are at least 18 years of age and competent to enter into a legally binding agreement under the Indian Contract Act, 1872.</li>
              <li>Have the authority and capacity to comply with these Terms.</li>
              <li>Are not impersonating any other individual and are using your true identity.</li>
              <li>Will comply with all applicable Indian laws, including those governing healthcare and data protection.</li>
              <li>Will not use the App on behalf of a child or minor unless you are their legal guardian and provide lawful consent.</li>
            </ul>
          </section>

          {/* 3. Services Provided */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">3. Services Provided</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Appointment Booking</li>
              <li>Card Membership</li>
              <li>AI Chatbot Consultation</li>
              <li>Medicine Reminders</li>
              <li>Health Records Management</li>
            </ul>
            <p className="text-gray-700">
              <span className="font-medium">Note:</span> The App is intended for non-emergency consultations only. For emergencies, contact emergency services.
              Hygo Healthcare is not liable for misuse of the App for urgent or emergency medical needs.
            </p>
          </section>

          {/* 4. License to Use */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">4. License to Use</h2>
            <p className="text-gray-700">
              Hygo Healthcare grants you a limited, non-exclusive, non-transferable, and revocable license to use the App for personal,
              non-commercial purposes. You may not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Copy, modify, reverse-engineer, or create derivative works of the App.</li>
              <li>Distribute, sell, or sublicense the App.</li>
              <li>Use the App for any unlawful or prohibited purpose.</li>
              <li>Reproduce, duplicate, copy, sell, resell, or exploit any portion of the App for commercial purposes, including for the development of competing applications or services.</li>
            </ul>
          </section>

          {/* 5. Payment and Refund Policy */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">5. Payment and Refund Policy</h2>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-900">5.1 Payment Details</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Payments can be made through UPI, debit/credit cards, or other available methods. Payment failures are subject to the terms of the payment processor. Hygo Healthcare is not liable for third-party transaction errors.</li>
                <li>All fees are exclusive of applicable taxes unless stated otherwise. Hygo Healthcare reserves the right to change pricing at any time.</li>
                <li>Never share secure credentials (OTP, CVV, etc.).</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-900">5.2 Refund Policy</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Appointment refunds are eligible if canceled 24 hours in advance and are subject to provider discretion.</li>
                <li>Card Membership payments are non-refundable.</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-900">5.3 Auto-Renewal Clause</h3>
              <p className="text-gray-700">
                If you opt for an auto-renewing Card Membership, you authorize recurring charges until canceled. You may cancel auto-renewal anytime from within your account settings.
              </p>
            </div>
          </section>

          {/* 6. Data Policy */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">6. Data Policy</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li><span className="font-medium">Consent:</span> You provide specific consent for collection and processing of your personal and medical data as described in the Privacy Policy.</li>
              <li><span className="font-medium">Third Parties:</span> Data may be processed by authorized processors under lawful contracts in compliance with the DPDP Act.</li>
              <li><span className="font-medium">Retention:</span> Records are stored up to 10 years as per MCI regulations.</li>
              <li><span className="font-medium">Security:</span> Reasonable security practices are implemented; no system is completely secure.</li>
            </ul>
          </section>

          {/* 7. User Content */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">7. User Content</h2>
            <p className="text-gray-700">You retain ownership of your uploaded content but grant Hygo Healthcare a non-exclusive license to use, store, and process it.</p>
            <p className="text-gray-700">You agree not to upload content that:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Infringes intellectual property rights.</li>
              <li>Is offensive, unlawful, or harmful.</li>
              <li>Contains malware or viruses.</li>
            </ul>
            <p className="text-gray-700">Hygo Healthcare may remove any content that violates these standards.</p>
          </section>

          {/* 8. Prohibited Conduct */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">8. Prohibited Conduct</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Use the App for illegal purposes.</li>
              <li>Gain unauthorized access to the App or its systems.</li>
              <li>Engage in spamming, data scraping, or disruptive activity.</li>
              <li>Violate the rights of others.</li>
            </ul>
          </section>

          {/* 9. Right to Terminate Accounts */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">9. Right to Terminate Accounts</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>You violate these Terms.</li>
              <li>Your account is associated with fraudulent or abusive activity.</li>
              <li>You misuse the App or its services.</li>
              <li>We believe, in our sole discretion, that your activity poses a risk to our operations or other users.</li>
            </ul>
          </section>

          {/* 10. Account Cancellation */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">10. Account Cancellation</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Go to "Account Settings" → "Deactivate Account"</li>
              <li>Or email: <a className="text-blue-700 underline" href="mailto:tech@thehygo.com">tech@thehygo.com</a></li>
              <li>Data may be retained under the data policy.</li>
            </ul>
          </section>

          {/* 11. Ownership and IP */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">11. Ownership and IP</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>All App content, design, and trademarks are owned by Hygo Healthcare.</li>
              <li>Unauthorized use is prohibited.</li>
            </ul>
          </section>

          {/* 12. Advertisements */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">12. Advertisements</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>The App may display Google Ads or others. You consent to such ads.</li>
              <li>Hygo is not responsible for third-party ad content.</li>
            </ul>
          </section>

          {/* 13. Copyright and DMCA Compliance */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">13. Copyright and DMCA Compliance</h2>
            <p className="text-gray-700">To report IP infringement:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Email: <a className="text-blue-700 underline" href="mailto:tech@thehygo.com">tech@thehygo.com</a></li>
              <li>Include description, URL, contact, and confirmation of ownership.</li>
            </ul>
          </section>

          {/* 14. Third-Party Providers */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">14. Third-Party Providers</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Hygo is not liable for services by third-party providers.</li>
              <li>Disputes are between User and Provider.</li>
              <li>Unless explicitly stated, Hygo Healthcare acts solely as a technology intermediary and is not the merchant of record for third-party services.</li>
            </ul>
          </section>

          {/* 15. Warranty Disclaimer */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">15. Warranty Disclaimer</h2>
            <p className="text-gray-700">App is provided "as is" without warranty.</p>
          </section>

          {/* 16. Limitation of Liability */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">16. Limitation of Liability</h2>
            <p className="text-gray-700">Hygo Healthcare is not liable for:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Use or inability to use the App</li>
              <li>Errors or service inaccuracies</li>
              <li>Loss of data</li>
              <li>Personal injury from reliance on Services</li>
            </ul>
            <p className="text-gray-700">Liability is limited to the amount paid by the User for services.</p>
          </section>

          {/* 17. Updates to Terms */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">17. Updates to Terms</h2>
            <p className="text-gray-700">Terms may be updated. Continued use of the App constitutes acceptance. Notifications will be sent in-app or by email.</p>
          </section>

          {/* 18. Governing Law */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">18. Governing Law</h2>
            <p className="text-gray-700">These Terms are governed by Indian laws. Disputes fall under New Delhi jurisdiction.</p>
          </section>

          {/* 18A. Dispute Resolution and Arbitration */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">18A. Dispute Resolution and Arbitration</h2>
            <p className="text-gray-700">
              In case of any dispute or difference arising under these Terms, the parties shall first attempt amicable resolution.
              If unresolved within 30 days, such disputes shall be referred to arbitration under the Arbitration and Conciliation Act, 1996.
              The arbitration shall be conducted in English by a sole arbitrator appointed by Hygo Healthcare. The seat of arbitration
              shall be New Delhi, India.
            </p>
          </section>

          {/* 19. Force Majeure */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">19. Force Majeure</h2>
            <p className="text-gray-700">We are not liable for failure due to events beyond our control.</p>
          </section>

          {/* 20. Infringement Reporting */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">20. Infringement Reporting</h2>
            <p className="text-gray-700">To report violations, email <a className="text-blue-700 underline" href="mailto:tech@thehygo.com">tech@thehygo.com</a> with details.</p>
          </section>

          {/* 21. Indemnity */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">21. Indemnity</h2>
            <p className="text-gray-700">You agree to indemnify Hygo Healthcare from any claims arising from:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Violation of these Terms</li>
              <li>Your content</li>
              <li>Third-party interactions</li>
              <li>Unauthorized use</li>
            </ul>
          </section>

          {/* 22. Privacy Policy */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">22. Privacy Policy</h2>
            <p className="text-gray-700">
              Our Privacy Policy is available at{' '}
              <a className="text-blue-700 underline" href="https://thehygo.com/privacy-policy" target="_blank" rel="noopener noreferrer">
                https://thehygo.com/privacy-policy
              </a>.
              By using the App, you agree to its terms.
            </p>
          </section>

          {/* 23. Grievance Redressal */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">23. Grievance Redressal</h2>
            <p className="text-gray-700 font-medium">Grievance Officer</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Name: Smit Maniar</li>
              <li>Email: <a className="text-blue-700 underline" href="mailto:tech@thehygo.com">tech@thehygo.com</a></li>
              <li>Address: B-303, 9 Square Om decora beside Marwadi Shares building Nana mauva circle Rajkot, India</li>
            </ul>
            <p className="text-gray-700">Complaints will be addressed within 15 days.</p>
          </section>

          {/* 24. Feedback and Intellectual Property */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">24. Feedback and Intellectual Property</h2>
            <p className="text-gray-700">
              By submitting suggestions or feedback, you grant Hygo Healthcare a perpetual, royalty-free license to use such input without
              obligation. This may include product improvements, AI features, or service enhancements.
            </p>
          </section>

          {/* 25. AI Consultation Limitation */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">25. AI Consultation Limitation</h2>
            <p className="text-gray-700">
              Medical advice generated by AI features is not a substitute for clinical diagnosis or treatment by a licensed practitioner.
              You should always consult a certified healthcare professional for serious or emergency medical concerns.
            </p>
          </section>

          {/* 26. Contact Us */}
          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-blue-900">26. Contact Us</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Email: <a className="text-blue-700 underline" href="mailto:tech@thehygo.com">tech@thehygo.com</a></li>
              <li>Address: Hygo Healthcare Private Limited, B-303, 9 Square Om decora beside Marwadi Shares building Nana mauva circle Rajkot, India</li>
            </ul>
          </section>

          {/* Compliance Note */}
          <section className="mt-8">
            <p className="text-gray-700">
              These Terms comply with the Information Technology Act, 2000, Digital Personal Data Protection Act, 2023, IT Rules 2021,
              and relevant healthcare regulations. International users must ensure local compliance.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
