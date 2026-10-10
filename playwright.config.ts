import {defineConfig} from '@playwright/test';
const baseURL=process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:3000';
export default defineConfig({testDir:'./tests/e2e',workers:1,use:{baseURL,headless:true,launchOptions:process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:['--enable-unsafe-swiftshader']}:{}},webServer:{command:'npm run dev',url:baseURL,reuseExistingServer:true,timeout:120000}});
