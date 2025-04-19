import ollama from "ollama";

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

export const newPrompt = async (req, res) => {
  const { content, user } = req.body;
  
  try {
    if (!content) {
      return res.status(400).json({ error: 'Prompt content is required' });
    }
    
    // Add system prompt before user's content
    const systemInstructions = "You are a helpful blogging assistant. Provide informative, well-structured content with a friendly tone. Include relevant headings, examples, and concise explanations. Don't use inappropriate language or generate false information.";
    
    const response = await ollama.chat({
      model: "llama3:8b",
      messages: [
        { role: "system", content: systemInstructions },
        { role: "user", content: content }
      ],
    });
    
    if (response.error) {
      return res.status(500).json({ error: response.error });
    }
    
    res.status(200).json({ message: response.message.content });
    
  } catch (error) {
    console.error("Error processing user prompt:", error);
    res.status(500).json({ error: "Failed to process prompt" });
  }
}