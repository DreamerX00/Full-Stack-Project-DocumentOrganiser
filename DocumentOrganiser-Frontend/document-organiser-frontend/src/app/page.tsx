'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FileText,
  Upload,
  Search,
  Share2,
  Shield,
  Zap,
  ArrowRight,
  FolderOpen,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Upload,
    title: 'Easy Upload',
    description: 'Drag & drop files or use the upload button. Support for all file types up to 100MB.',
  },
  {
    icon: FolderOpen,
    title: 'Smart Organization',
    description: 'Create folders, add tags, and auto-categorize your documents by type.',
  },
  {
    icon: Search,
    title: 'Powerful Search',
    description: 'Find any document instantly with full-text search and advanced filters.',
  },
  {
    icon: Share2,
    title: 'Secure Sharing',
    description: 'Share files via email or link with customizable permissions and expiry dates.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Your files are encrypted and stored securely with role-based access control.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track storage usage, file distribution, and activity with real-time insights.',
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="DocOrganiser" width={28} height={28} className="h-7 w-7" />
            <span className="text-xl font-bold">DocOrganiser</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div {...fadeInUp} className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm">
            <Zap className="mr-2 h-3.5 w-3.5 text-yellow-500" />
            Modern Document Management Platform
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Organize Your Documents{' '}
            <span className="text-primary">Effortlessly</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Upload, organize, search, and share your files with ease. A powerful document
            management platform built for teams and individuals.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" asChild className="gap-2">
              <Link href="/login">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </motion.div>

        {/* Hero Image Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mt-16 max-w-5xl"
        >
          <div className="aspect-[16/9] rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 shadow-2xl flex items-center justify-center">
            <div className="text-center">
              <Image src="/logo.svg" alt="DocOrganiser" width={64} height={64} className="mx-auto h-16 w-16 opacity-30" />
              <p className="mt-4 text-muted-foreground">Dashboard Preview</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Everything You Need</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Powerful features to help you manage, organize, and share your documents.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Get started in three simple steps</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto">
            {[
              { step: '1', title: 'Sign In', desc: 'Sign in with your Google account in one click.' },
              { step: '2', title: 'Upload', desc: 'Drag & drop your files or use the upload button.' },
              { step: '3', title: 'Organize', desc: 'Create folders, tag files, and share with others.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          Join now and take control of your documents with our powerful platform.
        </p>
        <Button size="lg" asChild className="mt-8 gap-2">
          <Link href="/login">
            Start Organizing <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="DocOrganiser" width={20} height={20} className="h-5 w-5" />
            <span className="font-semibold">DocOrganiser</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DocOrganiser. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
