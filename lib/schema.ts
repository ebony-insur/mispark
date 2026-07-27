import { z } from 'zod';

export const MiSparkPayloadSchema = z.object({
  studentProfile: z.string(),
  weekTheme: z.string(),
  dailyFramework: z.array(z.object({
    day: z.string(),
    subject: z.string(),
    topic: z.string()
  })),
  mediaLinks: z.array(z.object({
    topicReference: z.string(),
    platformName: z.string().describe("e.g., Khan Academy, YouTube, Specific Podcast"),
    resourceTitle: z.string(),
    directUrl: z.string().url().describe("Exact, valid HTTPS URL directly to the video, article, or podcast episode. Ensure Khan Academy and YouTube links are properly formatted.")
  })),
  catalysts: z.object({
    pantrySpark: z.object({
      cost: z.string(),
      title: z.string(),
      supplies: z.array(z.string()),
      instructions: z.string()
    }),
    quickTripSpark: z.object({
      cost: z.string(),
      title: z.string(),
      supplies: z.array(z.string()),
      instructions: z.string()
    }),
    capstoneSpark: z.object({
      cost: z.string(),
      title: z.string(),
      supplies: z.array(z.string()),
      instructions: z.string()
    })
  }),
  illuminations: z.array(z.string()).describe("2 deep-dive questions for neurodivergent minds"),
  kindling: z.array(z.string()).describe("2 open-ended dinner table conversation prompts")
});