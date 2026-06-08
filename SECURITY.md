# Security Policy

Schemato is a static, browser-only converter. Conversion logic runs in the browser and pasted schemas or payloads are not sent to a conversion API.

## Reporting a vulnerability

If you find a security or privacy issue, please open a GitHub issue with enough detail to reproduce it. If the issue should not be public yet, include only a short description and ask for a private contact path.

Useful details include:

- Affected page or converter path
- Browser and operating system
- Minimal input needed to reproduce the issue
- Expected and actual behavior

## Scope

Security reports that are especially useful:

- Cross-site scripting or unsafe rendering in converter output
- Cases where pasted input is sent somewhere unexpectedly
- Broken links or issue templates that route users to the wrong place
- Dependency or build configuration issues that affect the deployed static site

## Privacy boundary

The project may use aggregate product analytics, but conversion input and generated output should not be sent as analytics event data. Please report any behavior that violates this boundary.
