// Temporary, explicit preview mode. Set to "false" at BUILD time for live API use.
// Never switch to demo automatically after a failed live request.
export const WINK_DEMO = process.env.NEXT_PUBLIC_WINK_DEMO !== "false";
