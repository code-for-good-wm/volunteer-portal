import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AgreementFormItem from './AgreementFormItem';

describe('AgreementFormItem', () => {
  it.each([
    [
      'termsAndConditions',
      'Participant Agreement',
      "I agree with CFG's Terms & Conditions",
    ],
    [
      'photoRelease',
      'Photograph & Video Release Form',
      "I agree with CFG's Photograph & Video Release Form",
    ],
    ['codeOfConduct', 'Code of Conduct', "I agree with CFG's Code of Conduct"],
  ] as const)('shows the %s title and checkbox', (theme, title, label) => {
    render(<AgreementFormItem theme={theme} />);

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: label })).not.toBeChecked();
  });

  it('marks required agreements with an asterisk', () => {
    render(<AgreementFormItem theme="codeOfConduct" required />);

    expect(
      screen.getByRole('checkbox', {
        name: /^I agree with CFG's Code of Conduct\s*\*$/,
      }),
    ).toBeInTheDocument();
  });

  it('reflects the selected state', () => {
    render(<AgreementFormItem theme="photoRelease" selected />);

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('reports which agreement was toggled', async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(<AgreementFormItem theme="termsAndConditions" handler={handler} />);

    await user.click(screen.getByRole('checkbox'));

    expect(handler).toHaveBeenCalledWith('termsAndConditions');
  });

  it('links to the full document in a new tab when given a url', () => {
    render(
      <AgreementFormItem theme="codeOfConduct" url="https://example.org/coc" />,
    );

    const link = screen.getByRole('link', { name: 'Code of Conduct' });
    expect(link).toHaveAttribute('href', 'https://example.org/coc');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
