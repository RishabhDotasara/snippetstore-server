import express, { Request, Response } from "express";
import {
  client,
  getCompositeQuery,
  getQueryForDocumentFromTags,
  getQueryForDocumentInTitleAndDescription,
  searchDocuments,
} from "../../open-search/client";
import { INDEX_NAME } from "../../constants/indexName";
import { snippetModel } from "src/db/models/snippet";
import { codeBlockModel } from "src/db/models/code-block";
import {
  communityTagCounts,
  frameworkTagCounts,
  languageTagCounts,
} from "../../cron/tagCount";

const searchRouter = express.Router();

searchRouter.get("/", async (req: Request, res: Response) => {
  const { q } = req.query;

  const response = await client.search({
    index: INDEX_NAME,
    body: {
      query: {
        term: {
          type: "b",
        },
      },
    },
  });
  console.log();
  res.json({ message: "Search endpoint", response });
});

// @ts-ignore
searchRouter.get("/recommendations", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Query is required" });
    }

    const recommendationsQuery = await getQueryForDocumentInTitleAndDescription(
      q.toString()
    );
    const recommendations = await searchDocuments(recommendationsQuery, 5, 0);
    return res.status(200).json({
      recommendations,
      length: recommendations ? recommendations.length : 0,
    });
  } catch (err) {
    console.error(`[OpenSearch-Query] Recommendations Endpoint Error: ${err}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//@ts-ignore
searchRouter.delete(
  "/clear-index/:index",
  // @ts-ignore
  async (req: Request, res: Response) => {
    const { index } = req.params;

    try {
      // Clear all documents in the specified index using _delete_by_query
      const response = await client.indices.delete({ index: index });

      if (response.body.errors) {
        console.log(response.body);
        return res
          .status(500)
          .json({ error: "Failed to clear index documents." });
      }

      res
        .status(200)
        .json({ message: `All documents in index '${index}' deleted.` });
    } catch (err) {
      console.error("Error clearing index:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

//search by filters and query
// @ts-ignore
searchRouter.get("/query", async (req: Request, res: Response) => {
  try {
    const { q, tags, page, limit, fast } = req.query;

    console.log(
      `[OpenSearch-Query] Query: ${q}, Filters: ${tags}, Page: ${page}, Limit: ${limit}, Fast: ${fast}`
    );

    //pagination config code.
    const skip =
      (parseInt(page?.toString() || "1") - 1) *
      parseInt(limit?.toString() || "10");

    const searchQuery = await getCompositeQuery(
      q?.toString() as string,
      tags?.toString().split(",") as string[]
    );
    
    const response = await searchDocuments(
      searchQuery,
      parseInt(limit?.toString() || ""),
      skip
    );

    const finalResponseArray = response.map((hit: any) => hit._source);
    console.log(finalResponseArray)

    if (true) {
      return res.status(200).json({ message: "Search SuccessFull!", response: finalResponseArray });
    }
  } catch (err) {
    console.log(`[OpenSearch-Query] Search Endpoint Error: ${err}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// get the trending data
// @ts-ignore
searchRouter.get("/trending", async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      message: "Trending Endpoint",
      languageTags: Object.keys(languageTagCounts),
      communityTags: Object.keys(communityTagCounts),
      frameworkTags: Object.keys(frameworkTagCounts),
    });
  } catch (err) {
    console.error(`[OpenSearch-Query] Trending Endpoint Error: ${err}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default searchRouter;
