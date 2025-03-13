# 5ED-Gen - Fitness Training Program Generator

This is a Next.js application for generating personalized fitness training programs using the 5ED methodology.

## Technologies used
- React with Next.js 14 App Router
- TailwindCSS
- Firebase Auth, Storage, and Database
- OpenAI API for workout generation and enhancement

## Getting started

1. Clone the repository
```bash
git clone https://github.com/eladman/5ED-Gen.git
cd 5ED-Gen
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following variables:
```
OPENAI_API_KEY=your_openai_api_key
```

4. Run the development server
```bash
npm run dev
```

## Deploying to Vercel

1. Create a Vercel account if you don't have one already
2. Install the Vercel CLI: `npm i -g vercel`
3. Run `vercel login` and follow the instructions
4. Set up your environment variables in the Vercel dashboard:
   - Go to your project settings
   - Add the `OPENAI_API_KEY` environment variable
5. Deploy using the Vercel CLI:
```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Features
- Personalized workout program generation
- Workout enhancement with variations and detailed instructions
- User profile management
- Progress tracking