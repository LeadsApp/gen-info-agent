import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

async function extractProfile(url: string): Promise<any> {
  const endpoint = "https://api-d7b62b.stack.tryrelevance.com/latest/studios/58b9883e-bfa9-424f-b359-3478e2f30bcf/trigger_limited";
  const project = "bba15f865414-4f3b-a593-89920096c57c";
  const body = {
    params: {
      url: url,
      name: ""
    },
    project: project
  };

  const response = await axios.post(endpoint, body, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "bba15f865414-4f3b-a593-89920096c57c:sk-Mjk2YzE1N2UtMWFkZS00OTNhLTg3NTAtNDhlMjU3YzViYjg5"
    }
  });
  return response.data;
}

async function extractProfilePosts(url: string): Promise<any> {
  const endpoint = "https://api-d7b62b.stack.tryrelevance.com/latest/studios/e61ff6df-f1e8-4622-a0ff-97dac7333c24/trigger_limited";
  const project = "bba15f865414-4f3b-a593-89920096c57c";
  const body = {
    params: {
      url: url,
      name: "",
      needle: "",
      haystack: {},
      limit: 5
    },
    project: project
  };

  const response = await axios.post(endpoint, body, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "bba15f865414-4f3b-a593-89920096c57c:sk-OTk4ODAxZjgtYmJkNy00MjkzLTgxMTAtZDNlMTk5NjdiNDRj"
    }
  });
  return response.data;
}

async function main() {
  const profileUrl = "https://www.linkedin.com/in/marc-oliver-knöpfel-6a4485112/";
  
  let profileData: any, postsData: any, limitedPosts: any;
  
  try {
    console.log("Extracting and summarizing LinkedIn Profile...");
    profileData = await extractProfile(profileUrl);
    console.log("Profile Extraction Response:\n", JSON.stringify(profileData, null, 2));
  } catch (err: any) {
    console.error("Profile Extraction Error:", err.response ? err.response.data : err.message);
    return;
  }

  try {
    console.log("Extracting and summarizing LinkedIn Profile POSTS...");
    postsData = await extractProfilePosts(profileUrl);
    // The posts are expected under postsData.output.linkedin_full_data.
    const allPosts = (postsData.output && Array.isArray(postsData.output.linkedin_full_data))
      ? postsData.output.linkedin_full_data
      : [];
    limitedPosts = allPosts.slice(0, 5);
    console.log("Profile Posts Extraction Response (First 5):\n", JSON.stringify(limitedPosts, null, 2));
  } catch (err: any) {
    console.error("Profile Posts Extraction Error:", err.response ? err.response.data : err.message);
    return;
  }

  // Combine profile and posts data into one object.
  const combinedData = {
    profile: profileData,
    posts: limitedPosts
  };

  // Prompt to send to GPT‑4.
  const prompt = `
You are an AI assistant specialized in analyzing social media profiles for personalized sales outreach. The following JSON object contains data scraped from a LinkedIn profile, including the lead's main profile details and the latest posts.

Data: ${JSON.stringify(combinedData, null, 2)}

Sections:
1. Profile Summary
   - Summarize the lead's professional background, industry, and role.
   - Highlight any notable achievements, affiliations, or milestones.
2. Key Insights
   - Identify interests or topics they frequently engage with.
   - Highlight potential pain points based on their posts or interactions.
   - Spot recent activity that suggests sales readiness (e.g., new roles, industry discussions).
3. Personalization Opportunities
   - Suggest conversation starters based on the lead's interests or recent activity.
   - Recommend specific topics or themes they seem focused on.
4. Call-to-Action Recommendations
   - Provide low-pressure, clear CTAs based on the lead’s engagement style or activity level.

If the provided data is unclear, please state "Not enough data available."
`.trim();

  try {
    // Call the GPT-4o API
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("LLM Analysis:\n", openaiResponse.data.choices[0].message.content);
  } catch (err: any) {
    console.error("LLM API Error:", err.response ? err.response.data : err.message);
  }
}

main();
