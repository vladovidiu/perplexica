## Feature: LLM-Generated Story Titles for Discover Section

### Objective
Replace the current "Summary: {url of the story}" title in the `discover` section with a concise, LLM-generated title based on the story's content.

### Approach Plan

1.  **Understand Current "Discover" Data Flow:**
    *   Examine `src/app/discover/page.tsx` to understand how story data is fetched and rendered.
    *   Identify the component responsible for displaying the story title and where the story content (or a link to it) is available.

2.  **Design New API Endpoint for Title Generation:**
    *   Create a new API route: `src/app/api/generate-title/route.ts`.
    *   This endpoint will accept the full text content of a story (or a URL from which to fetch the content) as input.
    *   It will return a concise, LLM-generated title.

3.  **Implement LLM Logic in New API Endpoint:**
    *   Inside `src/app/api/generate-title/route.ts`:
        *   Utilize the existing `langchain` setup to interact with an LLM.
        *   Craft a prompt that instructs the LLM to generate a short, descriptive title from the provided text. Example prompt considerations:
            ```
            "Generate a concise and descriptive title for the following article content. The title should be no more than 10 words and accurately reflect the main topic.

            Article Content:
            {article_content}

            Title:"
            ```
        *   Select an appropriate LLM for this task, prioritizing speed and cost-effectiveness (e.g., a smaller, faster model if available and suitable).
        *   Implement error handling for LLM calls.

4.  **Integrate LLM Title Generation into Frontend:**
    *   Modify `src/app/discover/page.tsx` or the relevant child component that renders the story cards.
    *   When a story is loaded, make an asynchronous call to the new `/api/generate-title` endpoint, passing the story's content.
    *   Display a loading indicator or a fallback title (e.g., "Loading Title..." or the original "Summary: {url}") while the LLM-generated title is being fetched.
    *   Once the LLM title is received, update the display.

5.  **Consider Caching (Optimization):**
    *   To prevent redundant LLM calls for the same story, implement a caching mechanism.
    *   This could be a simple in-memory cache on the server-side for frequently accessed stories, or leveraging the existing SQLite database to store generated titles persistently, keyed by the story's URL or a hash of its content.

6.  **Error Handling and Fallback:**
    *   Ensure robust error handling throughout the process. If the LLM call fails or returns an unusable title, gracefully fall back to a default title (e.g., "Untitled Story" or the original "Summary: {url}").

7.  **Testing:**
    *   **Unit Tests:** Write tests for the new `/api/generate-title` endpoint to ensure it correctly processes input and interacts with the LLM.
    *   **Integration Tests:** Verify that the frontend correctly calls the API, handles loading states, and displays the generated titles.
    *   **Manual Testing:** Thoroughly test the `discover` page to ensure titles are generated as expected and the user experience is smooth.

### Next Steps
Proceed with the implementation based on this plan, starting with the API endpoint for title generation.