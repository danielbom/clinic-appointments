# Client Appointments API

That API was implemented around [OpenAPI specification](https://swagger.io/specification/) ([openapi.json](./src/public/api/openapi.json)).
A function connects each route defined with an express handler.

## Get Started

```bash
pnpm install

# Actually I'm not saving the migrations so you need to it by yourself
npx prisma generate
npx prisma migrate dev --name init

pnpm run start # Prod
pnpm run dev # Dev
# On vscode, you could press F5 to start a debug mode or in `Run and Debug`

# pnpm run test # CI
# pnpm run test:watch # Dev

```
