import {Client} from "@opensearch-project/opensearch"
import cron from "node-cron"
import {INDEX_NAME as index_name} from "../constants/indexName"
import { TAG_OPTIONS } from "@rishabhdotasara/snippetstore-types";

// // Initialize OpenSearch client
// const opensearch = new Client({
//   node: 'https://localhost:9200',
//   auth: {
//     username: 'admin',
//     password: 'admin',
//   },
//   ssl: {
//     rejectUnauthorized: false, // Disable SSL certificate verification
//   },
// });

const INDEX_NAME = index_name;
const TAG_FIELD = 'tags.keyword';

// In-memory storage for tag counts, we are going to user redis here, but for now testing this is used.
export let tagCountsCache:any = {};
export let frameworkTagCounts:Record<string, number> = {};
export let communityTagCounts:Record<string, number> = {};
export let languageTagCounts:Record<string, number> = {};

async function getFrameworkTags(tags:any)
{
    for (const tag in tags)
    {
        // @ts-ignore
        if(TAG_OPTIONS.framework.includes(tag))
        {
            frameworkTagCounts[tag] = tags[tag];
        }
    }
}

async function getCommunityTags(tags:any)
{
    for (const tag in tags)
    {
        // @ts-ignore
        if(TAG_OPTIONS.community.includes(tag))
        {
            communityTagCounts[tag] = tags[tag];
        }
    }
}

async function getLanguageTags(tags:any)
{
    for (const tag in tags)
    {
        // @ts-ignore
        if(TAG_OPTIONS.language.includes(tag))
        {
            languageTagCounts[tag] = tags[tag];
        }
    }
}

// Fetch tag counts from OpenSearch
async function fetchTagCounts(client: any) {
  const query = {
    size: 0,
    aggs: {
      tag_counts: {
        terms: {
          field: TAG_FIELD,
          size: 10, // Adjust based on the number of unique tags expected
        },
      },
    },
  };

  const response = await client.search({ index: INDEX_NAME, body: query });
  console.log(`[TAG AGREEGATOR] Fetched tag counts: ${response.body.aggregations.tag_counts.buckets.length} tags`);
  const buckets = response.body.aggregations.tag_counts.buckets;
  const tagCounts = {};

  buckets.forEach((bucket:any) => {
    // @ts-ignore
    tagCounts[bucket.key] = bucket.doc_count;
  });

  return tagCounts;
}

// Update in-memory storage for tag counts
function updateTagCountsCache(tagCounts:any) {
  tagCountsCache = tagCounts;
  console.log("[TAG AGREEGATOR] Updated tag counts cache: ", tagCountsCache);
}

// Log updates
function logUpdate(tagCounts:any) {
    const timestamp = new Date().toISOString();
    console.log(`[TAG AGREEGATOR] [${timestamp}] Updated tag counts: ${Object.keys(tagCounts).length} tags`);
    console.log(`[TAG AGREEGATOR] [${timestamp}] Framework tag counts: ${Object.keys(frameworkTagCounts).length} tags`);
    console.log(`[TAG AGREEGATOR] [${timestamp}] Community tag counts: ${Object.keys(communityTagCounts).length} tags`);
    console.log(`[TAG AGREEGATOR] [${timestamp}] Language tag counts: ${Object.keys(languageTagCounts).length} tags`);
}

// Main process
export async function RunTagCountCron(client:any) {
  console.log('[TAG AGREEGATOR] Starting tag count aggregation...');
  try {
    const tagCounts = await fetchTagCounts(client);
    updateTagCountsCache(tagCounts);
    await getFrameworkTags(tagCounts);
    await getCommunityTags(tagCounts);
    await getLanguageTags(tagCounts);
    logUpdate(tagCounts);
  } catch (error) {
    console.error('[TAG AGREEGATOR] Error during tag count aggregation:', error);
  }
}

// Schedule the job to run daily
cron.schedule('0 0 * * *', RunTagCountCron); // Runs at midnight daily


