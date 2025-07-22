#!/bin/bash

# Give Playwright install script executable permission
chmod +x ./node_modules/.bin/playwright

# Install Playwright with system dependencies
npx --yes playwright install --with-deps
