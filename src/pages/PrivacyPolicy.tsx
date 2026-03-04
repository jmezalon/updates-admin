export function PrivacyPolicy() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #FFB800;
            border-bottom: 2px solid #FFB800;
            padding-bottom: 10px;
        }
        h2 {
            color: #555;
            margin-top: 30px;
        }
        .last-updated {
            color: #666;
            font-style: italic;
            margin-bottom: 30px;
        }
        .contact-info {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin-top: 30px;
        }
    </style>

    <h1>Privacy Policy - Updates App</h1>
    <p class="last-updated">Last updated: ${new Date().toLocaleDateString()}</p>

    <h2>Introduction</h2>
    <p>Updates ("we," "our," or "us") operates the Updates mobile application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.</p>

    <h2>Information We Collect</h2>
    <ul>
        <li><strong>Account Information:</strong> Name, email address when you create an account</li>
        <li><strong>Profile Information:</strong> Optional profile photo and church preferences</li>
        <li><strong>Usage Data:</strong> Information about how you use the app, events you view and like</li>
        <li><strong>Device Information:</strong> Device type, operating system, app version</li>
    </ul>

    <h2>How We Use Your Information</h2>
    <ul>
        <li>To provide and maintain our Service</li>
        <li>To notify you about changes to our Service</li>
        <li>To provide customer support</li>
        <li>To gather analysis or valuable information to improve our Service</li>
        <li>To monitor usage of our Service</li>
    </ul>

    <h2>Data Sharing</h2>
    <p>We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
    <ul>
        <li>With your explicit consent</li>
        <li>To comply with legal obligations</li>
        <li>To protect our rights and safety</li>
    </ul>

    <h2>Data Security</h2>
    <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

    <h2>Your Rights</h2>
    <ul>
        <li>Access your personal data</li>
        <li>Correct inaccurate data</li>
        <li>Delete your account and data</li>
        <li>Withdraw consent at any time</li>
    </ul>

    <h2>Children's Privacy</h2>
    <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.</p>

    <h2>Changes to This Privacy Policy</h2>
    <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>

    <div class="contact-info">
        <h2>Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us:</p>
        <ul>
            <li>Email: max.mezalon@gmail.com</li>
            <li>Website: https://www.linkedin.com/in/max-mezalon/</li>
        </ul>
    </div>
        `,
      }}
    />
  );
}
