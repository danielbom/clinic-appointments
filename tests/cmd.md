pnpm init
pnpm install jest ts-jest @types/jest typescript --save-dev
pnpm install axios
pnpm install dotenv
npx ts-jest config:init
npx tsc --init

API_URL=http://localhost:3000 pnpm run snapshot:api replay
API_URL=http://localhost:3000 pnpm run snapshot:api record