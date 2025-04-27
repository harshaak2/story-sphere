import ollama from "ollama";
import { getAllPosts } from "./post.controller.js";
import { systemInstructions, categoryInstructions, rephraseInstructions, summariseInstructions } from "../utils/readFile.js";

export const ping = async (req, res) => {
    const response = await ollama.chat({
        model: "llama3:8b",
        messages: [{ role: "user", content: "Hi." }],
    });
    if (response.error) {
        return res.status(500).json({ error: response.error });
    }
    res.status(200).json({ message: response.message.content });
    console.log("Response sent:", response.message.content);
};

// this only generates ideas for blog - does not check novelty
export const newPrompt = async (req, res) => {
    const { content, user } = req.body;

    try {
        if (!content) {
            return res.status(400).json({ error: 'Prompt content is required' });
        }

        const responseJSON = await ollama.chat({
            model: "llama3:8b",
            messages: [
                { role: "system", content: systemInstructions },
                { role: "user", content: content }
            ],
        });

        if (responseJSON.error) {
            return res.status(500).json({ error: responseJSON.error });
        }

        console.log("Model response content:", responseJSON.message.content);

        let responseArray;
        try {
            responseArray = JSON.parse(responseJSON.message.content);
        } catch (parseError) {
            console.error("Failed to parse response as JSON:", responseJSON.message.content);
            return res.status(500).json({
                error: "Invalid response format from the model",
                rawResponse: responseJSON.message.content
            });
        }

        res.status(200).json(responseArray);

    } catch (error) {
        console.error("Error processing user prompt:", error);
        res.status(500).json({ error: "Failed to process prompt" });
    }
}

// generateNovelty is responsible for generating novel ideas for a user
// it first checks through mongodb to analyse all the blogs and then finds a novel idea
// it then generates a couple of ideas and inspirations for the user using the newPrompt function 
export const generateNovelty = async (req, res) => {
  const allPosts = await getAllPosts();
  var count = allPosts.length;
  var postContent = [];
  for (let i = 0; i < count; i++) {
    var post = allPosts[i];
    var content = post.content;
    var title = post.title;
    postContent.push({ title, content });
  }
  // console.log("All posts fetched:", postContent);
  
}

// TODO: simple functions for smaller tasks - generateNovelty as a function
// generateCategories
// which is not exposed to the user
// but newPrompt uses generateNovelty to generate ideas
// and sends it to the user as a response


// TODO: update generateCategories such that AI generates the categories
// before storing data in the database
// remove category dropdown from the frontend
// update the category model to take in an array of categories
export const generateCategories = async (req, res) => {
  const { title, content } = req.body;
  const response = await ollama.chat({
    model: "llama3:8b",
    messages: [
      { role: "system", content: categoryInstructions },
      { role: "user", content: `Generate categories for the following blog post:\nTitle: ${title}\nContent: ${content}` }
    ],
  });
  if (response.error) {
    return res.status(500).json({ error: response.error });
  }
  // handle output response format from the model
  return response.message.content;
}

// TODO: function to rephrase the content
// how to handle from frontend? - show the button after a 
// certain number of words in the text area? 
export const rephraseContent = async (req, res) => {
  const { content } = req.body;
  const responseJSON = await ollama.chat({
    model: "llama3:8b",
    messages: [
      { role: "system", content: rephraseInstructions },
      { role: "user", content: content }
    ],
  });
  if (responseJSON.error) {
    return res.status(500).json({ error: responseJSON.error });
  }
  // var flag = false; // for improving the rephrased content
  const parsedResponse = JSON.parse(responseJSON.message.content);

  return res.status(200).json(parsedResponse);
}

// function criticizeContent(content) {
//   const res = ollama.chat({
//     model: "llama3:8b",
//     messages: [
//       {role: "system", content: criticizeInstructions},
//       {role: "user", content: content}
//     ]
//   });
//   return res.message.content, ;
// }

export const summariseContent = async (req, res) => {
  const { content } = req.body;
  
  try {
    const responseJSON = await ollama.chat({
      model: "llama3:8b",
      messages: [
        { role: "system", content: summariseInstructions },
        { role: "user", content: content }
      ],
    });
    
    if (responseJSON.error) {
      return res.status(500).json({ error: responseJSON.error });
    }
    
    const rawContent = responseJSON.message.content;
    
    // Try to parse the response as JSON
    try {
      // First, try direct parsing
      const parsedResponse = JSON.parse(rawContent);
      return res.status(200).json(parsedResponse);
    } catch (parseError) {
      console.error("Initial JSON parsing failed:", parseError.message);
      
      // Try to extract JSON from the text response
      try {
        // Look for JSON-like content using regex
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extractedJson = jsonMatch[0];
          const parsedResponse = JSON.parse(extractedJson);
          console.log("Extracted JSON successfully");
          return res.status(200).json(parsedResponse);
        }
      } catch (extractError) {
        console.error("Failed to extract JSON:", extractError.message);
      }
      
      // If all parsing attempts fail, return an error so the user can try again
      return res.status(500).json({ 
        error: "Error summarizing content. Please try again.",
        message: "Failed to parse AI response into the expected format."
      });
    }
  } catch (error) {
    console.error("Error in summarize process:", error);
    return res.status(500).json({ 
      error: "Failed to summarize content", 
      message: error.message 
    });
  }
};