# Account & Authentication

## Create an Account

Registration asks for:

- First name
- Last name
- Email
- Password
- Confirm password
- Phone
- Country

Current validation includes a valid email, a password of at least 12 characters with a lowercase letter, a phone value of at least 11 characters, a country value of at least 3 characters, and matching passwords. The application service may apply additional checks.

## Sign In

Enter your email and password, then tap **Log in**. Login validation requires a password of at least 9 characters before the request is submitted. Server errors appear on the login screen.

## Staying Signed In

The app stores your login session and cached profile using the device's secure-storage facility. When the app starts, it restores that information and attempts to refresh the profile. This normally avoids signing in every time, but a failed refresh or unavailable service can affect what data is available.

## Sign Out

1. Open **Account**.
2. Tap **Log Out** near the bottom.
3. Confirm by tapping **Log out** in the dialog.

The app removes the local login session and returns to the initial screen.

## Session Problems

The AI assistant explicitly handles an expired session by clearing it and showing a **Session expired** alert. Other parts of the app may show a service error without automatically signing you out. If an account-only feature stops working, sign in again.

There is currently no forgot-password, password-change, email-verification, or account-deletion flow in the user interface.

## Account Safety

- Use a unique password.
- Do not share your password or login session.
- Avoid sending sensitive personal information in AI messages or uploaded images.
