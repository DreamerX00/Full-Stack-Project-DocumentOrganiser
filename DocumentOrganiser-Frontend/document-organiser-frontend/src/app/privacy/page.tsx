import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-3xl px-6 py-16">
                <Link href="/login">
                    <Button variant="ghost" size="sm" className="mb-8 gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                </Link>

                <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground mb-10">
                    Last updated: February 17, 2026
                </p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We collect the following types of information:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                            <li><strong>Account info:</strong> Name, email address, and profile picture (from Google OAuth)</li>
                            <li><strong>Documents:</strong> Files you upload, including metadata (name, size, type)</li>
                            <li><strong>Usage data:</strong> Activity logs, storage usage, and feature interactions</li>
                            <li><strong>Device info:</strong> Browser type, IP address, and operating system</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                        <p className="text-muted-foreground leading-relaxed">We use your information to:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                            <li>Provide and maintain the document management Service</li>
                            <li>Authenticate your identity and secure your account</li>
                            <li>Enable file sharing and collaboration features</li>
                            <li>Send notifications about your account and shared documents</li>
                            <li>Improve the Service through analytics and usage patterns</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">3. Data Storage and Security</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Your documents are stored securely using AWS S3 with encryption. Access credentials are
                            hashed using BCrypt. All API communication is encrypted via HTTPS. We implement
                            industry-standard security measures to protect your data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">4. Data Sharing</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We do not sell your personal data. We only share your information in these cases:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                            <li>When you explicitly share documents with other users</li>
                            <li>With cloud infrastructure providers (AWS) for storage purposes</li>
                            <li>When required by law or to protect our legal rights</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">5. Cookies and Local Storage</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We use browser local storage to maintain your authentication session (JWT tokens) and
                            user preferences (theme, view settings). No third-party tracking cookies are used.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Your data is retained as long as your account is active. Deleted files are moved to
                            trash and permanently removed after 30 days. Upon account deletion, all your data is
                            permanently removed within 30 days.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
                        <p className="text-muted-foreground leading-relaxed">You have the right to:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                            <li>Access and download your personal data</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your account and data</li>
                            <li>Export your documents at any time</li>
                            <li>Opt out of non-essential email notifications</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">8. Children&apos;s Privacy</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            The Service is not intended for children under 13. We do not knowingly collect
                            information from children under 13.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We may update this Privacy Policy periodically. We will notify you of significant
                            changes via email or in-app notification. Continued use of the Service constitutes
                            acceptance of the updated policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            For privacy-related questions or requests, contact us at{' '}
                            <a href="mailto:privacy@alphadocuments.com" className="text-primary hover:underline">
                                privacy@alphadocuments.com
                            </a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
