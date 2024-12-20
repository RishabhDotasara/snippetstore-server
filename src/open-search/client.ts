import { Client } from "@opensearch-project/opensearch";
import { configDotenv } from "dotenv";
import { INDEX_NAME } from "../constants/indexName";

configDotenv();

// const client = new Client({
//   node: process.env.BONSAI_CLUSTER_URI || "http://localhost:9200",
//   auth: {
//     username: process.env.BONSAI_CLUSTER_USERNAME || "admin",
//     password: process.env.BONSAI_CLUSTER_PASSWORD || "admin",
//   },
// });

const client = new Client({
  node: 'https://localhost:9200',
  auth: {
    username: 'admin',
    password: 'admin',
  },
  ssl: {
    rejectUnauthorized: false, // Disable SSL certificate verification
  },
});

console.log(`[OpenSearch] Connection SuccessFull!`);

async function createIndex() {
  try {
    const indexExists = await client.indices.exists({ index: INDEX_NAME });
    if (indexExists.body) 
    {
        console.log("[Open-Search] Index Already Exists");
        return;
    }

    const response = await client.indices.create({
      index: INDEX_NAME, // the name of the index
      body: {
        settings: {
          analysis: {
            tokenizer: {
              edge_ngram_tokenizer: {
                type: 'edge_ngram',
                min_gram: 1,
                max_gram: 25,
                token_chars: ['letter', 'digit'],
              },
            },
            analyzer: {
              edge_ngram_analyzer: {
                type: 'custom',
                tokenizer: 'edge_ngram_tokenizer',
              },
            },
          },
        },
        mappings: {
          properties: {
            title: {
              type: "text", // field for title (analyzed for full-text search)
              analyzer: 'edge_ngram_analyzer'
            },
            description: {
              type: "text", // field for description (analyzed for full-text search)
              analyzer: 'edge_ngram_analyzer'
            },
            language: {
              type: "keyword", // field for language (non-analyzed, exact match)
            },
            type: {
              type: "keyword", // field for type (non-analyzed, exact match)
            },
            mongoId:{
              type: "keyword",
            }
          },
        },
      },
    });

    console.log("[Open-Search] Index Created: ", response);
  } catch (err) {
    console.error("Error creating index:", err);
  }
}


const indexDocument = async (data: any, id?: string) => {
  try {
    const response = await client.index({
      index: "code-snippets",
      body: data,
      id: id,
    });
    console.log(`[OpenSearch-Indexing] Response: ${response}`);
  } catch (error) {
    console.error(`[OpenSearch-Indexing] Error: ${error}`);
  }
};



//query documents
export async function queryDocumentInTitleAndDescription(query:string)
{
  try {
    const { body } = await client.search({
      index: INDEX_NAME,
      body: {
      query: {
        bool:{
          should:[
            {match:{title:query}},
            {match:{description:query}},
          ],
          minimum_should_match:1
        }
      }
      }
    });
    console.log(`[OpenSearch-Query] Response: ${body}`);
    return body.hits.hits;
  } catch (error) {
    console.error(`[OpenSearch-Query] Error: ${error}`);
  }
}

// export {client};
export { indexDocument, createIndex, client };
