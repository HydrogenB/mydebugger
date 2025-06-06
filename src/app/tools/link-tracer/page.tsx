/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import MainLayout from '@/components/layout/MainLayout';
import LinkTracer from '@/view/LinkTracer';

export const metadata = {
  title: 'Link Tracer',
};

export default function LinkTracerPage() {
  return (
    <MainLayout>
      <LinkTracer />
    </MainLayout>
  );
}
