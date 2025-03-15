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

### Prerequisites

- A Vercel account
- An OpenAI API key

### Environment Variables

When deploying to Vercel, make sure to set the following environment variables:

1. `OPENAI_API_KEY` - Your OpenAI API key
2. `USE_FALLBACK_WORKOUTS` - Set to `true` to use fallback workouts if the OpenAI API fails

### Deployment Steps

1. Push your code to a GitHub repository
2. Log in to your Vercel account
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - Set the Framework Preset to "Next.js"
   - Add the environment variables mentioned above
6. Click "Deploy"

### Troubleshooting API Issues

If you encounter issues with the OpenAI API in production:

1. Check that your OpenAI API key is correctly set in Vercel's environment variables
2. Ensure your OpenAI API key has sufficient quota and is not rate-limited
3. Set `USE_FALLBACK_WORKOUTS=true` in your environment variables to use predefined workouts instead of calling the OpenAI API
4. Check Vercel logs for specific error messages

## Features
- Personalized workout program generation
- Workout enhancement with variations and detailed instructions
- User profile management
- Progress tracking