require('dotenv').config({ path: '.env.local' });
const { ConvexHttpClient } = require('convex/browser');
const { fetchQuery } = require('convex/nextjs');

async function test() {
  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    // test the setup
    console.log("convex client created", process.env.NEXT_PUBLIC_CONVEX_URL);
  } catch(e) { console.error(e); }
}
test();
