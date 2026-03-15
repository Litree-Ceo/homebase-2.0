import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Login } from './Login';

// Mock the supabase client
vi.mock('@/lib/auth', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(() => {
        return Promise.resolve({ error: { message: 'Invalid login credentials' } });
      }),
      signInWithOAuth: vi.fn(),
    },
  },
}));

describe('Login Component', () => {
  it('renders the login form correctly', () => {
    render(<Login />);

    // Check for header text
    expect(screen.getByTestId('login-header')).toBeInTheDocument();

    // Check for input fields by their labels
    expect(screen.getByLabelText('EMAIL ID')).toBeInTheDocument();
    expect(screen.getByLabelText('ACCESS KEY')).toBeInTheDocument();

    // Check for the main login button
    expect(
      screen.getByRole('button', { name: /INITIALIZE SESSION/i })
    ).toBeInTheDocument();
  });

  it('shows an error for an invalid email format', async () => {
    render(<Login />);
    const emailInput = screen.getByLabelText('EMAIL ID');
    const passwordInput = screen.getByLabelText('ACCESS KEY');
    const submitButton = screen.getByRole('button', {
      name: /INITIALIZE SESSION/i,
    });

    // Enter an invalid email and a password
    await userEvent.type(emailInput, 'not-an-email');
    await userEvent.type(passwordInput, 'password123');

    // The form should show an error due to the native browser validation for type="email"
    expect(emailInput).toBeInvalid();
  });

  it('disables the submit button when fields are empty', () => {
    render(<Login />);
    const submitButton = screen.getByRole('button', {
      name: /INITIALIZE SESSION/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it('enables the submit button when both fields are filled', async () => {
    render(<Login />);

    const emailInput = screen.getByLabelText('EMAIL ID');
    const passwordInput = screen.getByLabelText('ACCESS KEY');
    const submitButton = screen.getByRole('button', {
      name: /INITIALIZE SESSION/i,
    });

    // Fill out the form
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
