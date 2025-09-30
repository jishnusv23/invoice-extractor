# invoice-extractor
Installation

Clone the repository:

git clone https://github.com/jishnusv23/invoice-extractor.git
cd invoice-extractor


Install dependencies:

npm install
# or
yarn install


Create a .env file in the root directory:

OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_URL=https://openrouter.ai/api/v1/chat/completions

Usage
Run in Development
npx ts-node src/index.ts