import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import { ToggleSwitch } from '../src/design-system/components/inputs/ToggleSwitch';

test('calls onChange when toggled', () => {
  const onChange = jest.fn();
  const { getByRole } = render(
    <ToggleSwitch id="t" checked={false} onChange={onChange} label="Test" />,
  );
  const btn = getByRole('switch');
  fireEvent.click(btn);
  expect(onChange).toHaveBeenCalledWith(true);
});
