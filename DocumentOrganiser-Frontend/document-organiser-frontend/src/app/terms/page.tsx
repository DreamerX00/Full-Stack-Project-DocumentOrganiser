import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-3xl px-6 py-16">
                <Link href="/login">
                    <Button variant="ghost" size="sm" className="mb-8 gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                </Link>

                <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
                <p className="text-sm text-muted-foreground mb-10">
                    Last updated: February 17, 2026
                </p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing or using Document Organiser (&quot;the Service&quot;), you agree to be bound by
                            these Terms of Service. If you do not agree to these terms, please do not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Document Organiser is a cloud-based document management platform that allows users to
                            upload, organize, search, share, and manage digital files. The Service is provided by
                            Alpha Documents.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            You must create an account to use the Service. You are responsible for maintaining the
                            confidentiality of your account credentials and for all activities under your account.
                            You agree to notify us immediately of any unauthorized use.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
                        <p className="text-muted-foreground leading-relaxed">You agree not to:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                            <li>Upload content that violates any applicable law or regulation</li>
                            <li>Upload malware, viruses, or any harmful code</li>
                            <li>Attempt to gain unauthorized access to other accounts or systems</li>
                            <li>Use the Service for any illegal or unauthorized purpose</li>
                            <li>Exceed your storage quota by circumventing technical limits</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">5. Storage and Data</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Each account is subject to a storage quota. Files placed in the trash are automatically
                            deleted after 30 days. We reserve the right to modify storage limits with reasonable
                            notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">6. Sharing and Collaboration</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            When you share documents or folders, you grant other users the permissions you specify
                            (View, Download, or Edit). You remain responsible for the content you share. Share
                            links can be revoked at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            You retain ownership of all content you upload. By using the Service, you grant us a
                            limited license to store, display, and transmit your content solely for the purpose of
                            providing the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We may suspend or terminate your account if you violate these Terms. Upon termination,
                            your right to access the Service ceases, but we will provide a reasonable period to
                            download your data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            The Service is provided &quot;as is&quot; without warranties of any kind. We shall not be
                            liable for any indirect, incidental, or consequential damages arising from your use of
                            the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We may update these Terms from time to time. Continued use of the Service after changes
                            constitutes acceptance of the updated Terms. We will notify you of significant changes
                            via email or in-app notification.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have questions about these Terms, please contact us at{' '}
                            <a href="mailto:support@alphadocuments.com" className="text-primary hover:underline">
                                support@alphadocuments.com
                            </a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
