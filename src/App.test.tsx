import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

import { assert, expect, test } from 'vitest'

test('renders app', () => {
  render(<App />);
});
