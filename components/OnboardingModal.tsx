// Step 1: Select Learner Tier ('Solo', 'Modern Family', 'Classroom', 'Prefer not to say')
// Step 2: Select Primary Focus ('Neurodivergent', 'Hands-On', 'Traditional Support', 'Prefer not to say') + Consent Checkboxes
// Action: Saves directly to `profiles` table and triggers MailerLite subscriber sync.
// Assuming you already have these variables in your component state
// const userEmail = "...";
// const userFirstName = "...";
// const selectedTier = "...";
// const selectedFocus = "...";

try {
  await fetch("/api/mailerlite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: userEmail,
      firstName: userFirstName,
      learnerTier: selectedTier,
      primaryFocus: selectedFocus,
    }),
  });
  console.log("Marketing sync triggered!");
} catch (error) {
  console.error("Failed to trigger marketing sync:", error);
  // We usually don't want to block the user from entering the app just because MailerLite failed,
  // so failing silently (or just logging to console) here is best practice.
}