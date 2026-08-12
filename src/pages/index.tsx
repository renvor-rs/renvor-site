import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import LandingPage from '../components/LandingPage';

export default function Home(): ReactNode {
  return (
    <Layout
      title="Application infrastructure for Rust teams — in development"
      description="Renvor is an in-development Rust application framework. No crate is published and nothing is installable yet. The planned scope covers explicit services, full-stack delivery, desktop applications, and installable packages."
    >
      <LandingPage />
    </Layout>
  );
}
