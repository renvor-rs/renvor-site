import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import LandingPage from '../components/LandingPage';

export default function Home(): ReactNode {
  return (
    <Layout
      title="Application infrastructure for Rust teams"
      description="A complete Rust application framework for explicit services, full-stack delivery, desktop applications, and installable packages."
    >
      <LandingPage />
    </Layout>
  );
}
