import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run reminder check every day at 9 AM UTC
crons.daily(
    "send-signature-reminders",
    { hourUTC: 9, minuteUTC: 0 },
    internal.reminderScheduler.checkAndSendReminders
);

export default crons;
