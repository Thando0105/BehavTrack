import { config } from 'dotenv';
config();

import '@/ai/flows/generate-weekly-behavior-summary.ts';
import '@/ai/flows/suggest-interventions-based-on-summary.ts';