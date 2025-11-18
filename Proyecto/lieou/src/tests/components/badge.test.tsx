import { describe, it, expect } from 'vitest';

import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('renders with default styles', () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText('New');
    expect(badge.className).not.toBe('');
  });
});
