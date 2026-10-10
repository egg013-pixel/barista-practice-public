import type { NextConfig } from 'next';
const config: NextConfig = { poweredByHeader:false, output:'export', trailingSlash:true, basePath:process.env.PAGES_BASE_PATH||'' };
export default config;
