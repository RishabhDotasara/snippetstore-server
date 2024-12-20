import express, { Request, RequestHandler } from "express"

import { snippetModel } from "../../db/models/snippet";

import { codeBlockModel } from "../../db/models/code-block";
import { indexDocument } from "../../open-search/client";
import { authValidator } from "../../middlewares/authValidator";

const codeRouter = express.Router();

codeRouter.use(authValidator as unknown as RequestHandler);


//add server side data validation, looking around that.
//also add the data to the search engine before adding to DB


//CREATION ROUTES

codeRouter.post("/snippet/create", async (req:Request, res)=>{
    try 
    {
        // console.log(req.body);
        //first create the document in mongo
        const dataToStore = {
            ...req.body,
            type:"snippet"
        }
        console.log(dataToStore);
        const snippet = await snippetModel.create(dataToStore);
    
        //then index the document in the search engine, and store the docId to avoid using mongo again!
        const snippetToIndex = {
            title: snippet.title,
            description: snippet.description,
            id:snippet._id.toString(),
            language: snippet.language,
            type:"snippet"
        }
        console.log(snippetToIndex);
        await indexDocument(snippetToIndex, snippet._id.toString());
        res.status(201).json({message: "Creation Successfull!"});
    }
    catch(err)
    {
        console.log(`[ERROR] Snippet Creation: ${err} `);
        res.status(500).json({message: "Internal Server Error"});
    }
})

codeRouter.post("/block/create", async (req:Request, res)=>{
    console.log(req.body);
    const block = await codeBlockModel.create({...req.body, type:"block"});

    const blockToIndex = {
        title: block.title,
        description: block.description,
        language: block.language,
        totalSnippets: block.snippets.length,
        type:"block",
        id:block._id.toString()
    }

    await indexDocument(blockToIndex, block._id.toString());

    res.status(201).json({message: "Code Block Created!"});
})

//GET ROUTES
codeRouter.get("/snippet/:id", async (req:Request, res)=>{
    try 
    {
        const snippet = await snippetModel.findById(req.params.id);
        if(snippet)
        {
            res.status(200).json(snippet);
        }
        else
        {
            res.status(404).json({message: "Snippet Not Found"});
        }
    }
    catch(err)
    {
        console.log(`[ERROR] Snippet Fetching: ${err} `);
        res.status(500).json({message: "Internal Server Error"});
    }

});

// @ts-ignore
codeRouter.get("/block/:id", async (req:Request, res)=>{
    try 
    {
        const block = await codeBlockModel.findById(req.params.id);
        if(block)
        {
            res.status(200).json(block);
        }
        else
        {
            res.status(404).json({message: "Block Not Found"});
        }
    }
    catch(err)
    {
        console.log(`[ERROR] Block Fethcing Endpoint: ${err}`);
        return res.status(500).json({message:"Internal Server Error!"})
    }
})

export default codeRouter;