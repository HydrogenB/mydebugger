import "@testing-library/jest-dom";
import { render } from '@testing-library/react';
import CookieScopeView from '../src/tools/cookie-scope/components/CookieScopePanel';
import { ParsedCookie } from '../src/tools/cookie-scope/lib/cookieScope';

const baseCookie: ParsedCookie = {
  name: 'foo',
  value: 'bar',
  domain: 'example.com',
  path: '/',
  sameSite: 'Lax',
  secure: false,
  httpOnly: false,
  accessible: true,
};

test('row has style classes for duplicates and conflicts', () => {
  const { container } = render(
    <CookieScopeView
      cookies={[baseCookie]}
      search=""
      setSearch={() => {}}
      showHttpOnly
      setShowHttpOnly={() => {}}
      duplicates={new Set(['foo'])}
      conflicts={new Set(['foo'])}
      sameSiteMismatch={new Set(['foo'])}
      exportJson={() => {}}
      exportHar={() => {}}
      copy={() => {}}
      toastMessage=""
    />,
  );
  const row = container.querySelector('tbody tr');
  expect(row).toHaveClass('bg-yellow-50');
  expect(row).toHaveClass('bg-red-50');
  expect(row).toHaveClass('bg-orange-50');
});


test('renders toast message and buttons fire callbacks', () => {
  const exportJson = jest.fn();
  const exportHar = jest.fn();
  const copy = jest.fn();
  const { getByText } = render(
    <CookieScopeView
      cookies={[baseCookie]}
      search=""
      setSearch={() => {}}
      showHttpOnly
      setShowHttpOnly={() => {}}
      duplicates={new Set()}
      conflicts={new Set()}
      sameSiteMismatch={new Set()}
      exportJson={exportJson}
      exportHar={exportHar}
      copy={copy}
      toastMessage="Done"
    />,
  );
  expect(getByText('Done')).toBeInTheDocument();
  getByText('Download JSON').click();
  getByText('Download HAR').click();
  getByText('Copy JSON').click();
  expect(exportJson).toHaveBeenCalled();
  expect(exportHar).toHaveBeenCalled();
  expect(copy).toHaveBeenCalled();
});

