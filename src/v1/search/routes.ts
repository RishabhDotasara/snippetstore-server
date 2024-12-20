import express, { Request, Response } from "express";
import {
  client,
  queryDocumentInTitleAndDescription,
} from "../../open-search/client";
import { INDEX_NAME } from "../../constants/indexName";

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

    const recommendations = await queryDocumentInTitleAndDescription(
      q.toString()
    );
    return res.status(200).json({ recommendations, length: recommendations ?  recommendations.length : 0 });
  } catch (err) {
    console.error(`[OpenSearch-Query] Recommendations Endpoint Error: ${err}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//@ts-ignore
searchRouter.delete('/clear-index/:index', async (req:Request, res:Response) => {
  const { index } = req.params;

  try {
    // Clear all documents in the specified index using _delete_by_query
    const response = await client.indices.delete({index:index})

    if (response.body.errors) {
      console.log(response.body);
      return res.status(500).json({ error: 'Failed to clear index documents.' });
    }

    res.status(200).json({ message: `All documents in index '${index}' deleted.` });
  } catch (err) {
    console.error('Error clearing index:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default searchRouter;
