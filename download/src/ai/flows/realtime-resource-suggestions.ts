// This is a server-side file.
'use server';

/**
 * @fileOverview Provides realtime resource suggestions for project tasks using generative AI.
 *
 * - `suggestResources` - A function that takes a task description and returns a list of suggested resources.
 * - `ResourceSuggestionInput` - The input type for the `suggestResources` function.
 * - `ResourceSuggestionOutput` - The return type for the `suggestResources` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResourceSuggestionInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the task for which to suggest resources.'),
});
export type ResourceSuggestionInput = z.infer<typeof ResourceSuggestionInputSchema>;

const ResourceSuggestionOutputSchema = z.object({
  suggestedResources: z
    .array(z.string())
    .describe('A list of suggested resources (URLs, document titles, etc.) relevant to the task.'),
});
export type ResourceSuggestionOutput = z.infer<typeof ResourceSuggestionOutputSchema>;

export async function suggestResources(input: ResourceSuggestionInput): Promise<ResourceSuggestionOutput> {
  return suggestResourcesFlow(input);
}

const suggestResourcesPrompt = ai.definePrompt({
  name: 'suggestResourcesPrompt',
  input: {schema: ResourceSuggestionInputSchema},
  output: {schema: ResourceSuggestionOutputSchema},
  prompt: `You are an AI assistant helping project managers find relevant resources for their tasks.
  Given the task description, suggest a list of resources that would be helpful for the team to understand and execute the task effectively.
  These resources can be documentation links, discussion threads, or any other relevant material.

  Task Description: {{{taskDescription}}}

  Suggested Resources:`,
});

const suggestResourcesFlow = ai.defineFlow(
  {
    name: 'suggestResourcesFlow',
    inputSchema: ResourceSuggestionInputSchema,
    outputSchema: ResourceSuggestionOutputSchema,
  },
  async input => {
    const {output} = await suggestResourcesPrompt(input);
    return output!;
  }
);
