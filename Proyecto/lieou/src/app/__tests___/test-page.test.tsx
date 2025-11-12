/**
 * @vitest-environment jsdom
 */

import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from '@/app/test-page/page'
 
test('Page', () => {
  render(<Page />)
  expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeDefined()
})
