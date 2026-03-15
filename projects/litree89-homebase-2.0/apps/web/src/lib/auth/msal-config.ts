/**
 * Microsoft Entra External ID / MSAL Configuration
 *
 * @workspace Modern CIAM solution (Next-gen B2C replacement)
 * Benefits:
 * - FREE for first 50,000 monthly active users
 * - No custom policies needed
 * - Simplified setup & management
 * - Social logins: Google, Facebook, Apple, Microsoft
 * - Native authentication support for mobile
 *
 * Setup: Create External tenant at entra.microsoft.com
 * Migration from B2C: Same MSAL SDK, just different authority URLs
 */

import { Configuration, LogLevel, PopupRequest } from '@azure/msal-browser';

/**
 * B2C Policies Configuration
 */
export const b2cPolicies = {
  authorityDomain: `${process.env.NEXT_PUBLIC_ENTRA_TENANT_NAME || 'litlabsb2c'}.ciamlogin.com`,
  names: {
    signUpSignIn: 'B2C_1_signup_signin',
    forgotPassword: 'B2C_1_reset',
    editProfile: 'B2C_1_edit_profile',
  },
  authorities: {
    signUpSignIn: {
      authority: `https://${process.env.NEXT_PUBLIC_ENTRA_TENANT_NAME || 'litlabsb2c'}.ciamlogin.com/tfp/${
        process.env.NEXT_PUBLIC_ENTRA_TENANT_ID || process.env.NEXT_PUBLIC_ENTRA_TENANT_NAME || 'litlabsb2c'
      }/B2C_1_signup_signin`,
    },
    forgotPassword: {
      authority: `https://${process.env.NEXT_PUBLIC_ENTRA_TENANT_NAME || 'litlabsb2c'}.ciamlogin.com/tfp/${
        process.env.NEXT_PUBLIC_ENTRA_TENANT_ID || process.env.NEXT_PUBLIC_ENTRA_TENANT_NAME || 'litlabsb2c'
      }/B2C_1_reset`,
    },
    editProfile: {
      authority: `https://${process.env.NEXT_PUBLIC_ENTRA_TENANT_NAME || 'litlabsb2c'}.ciamlogin.com/tfp/${
        process.env.NEXT_PUBLIC_ENTRA_TENANT_ID || process.env.NEXT_PUBLIC_ENTRA_TENANT_NAME || 'litlabsb2c'
      }/B2C_1_edit_profile`,
    },
  },
};

/**
 * Entra External ID Configuration
 * Uses ciamlogin.com domain for external tenants
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || '00000000-0000-0000-0000-000000000000',
    authority: `https://${
      process.env.NEXT_PUBLIC_ENTRA_TENANT_NAME || 'litlabsb2c'
    }.ciamlogin.com/`,
    knownAuthorities: [b2cPolicies.authorityDomain],
    redirectUri:
      globalThis.window === undefined
        ? 'http://localhost:3000'
        : globalThis.window.location.origin,
    postLogoutRedirectUri:
      globalThis.window === undefined
        ? 'http://localhost:3000'
        : globalThis.window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
        }
      },
      piiLoggingEnabled: false,
      logLevel: process.env.NODE_ENV === 'development' ? LogLevel.Verbose : LogLevel.Error,
    },
  },
};

/**
 * Login scopes for Entra External ID
 * Simplified - no custom policy URLs needed
 */
export const loginRequest: PopupRequest = {
  scopes: ['openid', 'profile', 'email', 'offline_access'],
};

/**
 * Token request for accessing protected APIs
 */
export const tokenRequest = {
  scopes: ['openid', 'profile', 'email'],
};

/**
 * Scopes for silent token acquisition
 */
export const silentRequest = {
  scopes: ['openid', 'profile', 'email'],
};
