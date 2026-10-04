import type { NextConfig } from 'next';
const config: NextConfig = { serverExternalPackages: ['@cline/sdk', '@cline/agents', '@cline/core', '@cline/llms', '@cline/shared'] };
export default config;