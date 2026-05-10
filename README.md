# Clinical Appointments

Clinical Appointments is a learning project focused on implementing the same clinic appointment system using different backend technologies.

The main goal of the repository is not comparing frameworks by benchmarks or performance, but understanding how the same business rules, architecture decisions, validations, and API behavior can be implemented across multiple ecosystems.

Building the backend multiple times helped identify bugs, improve implementation strategies, validate architectural decisions, and continuously evolve the project design.

## Demo

Access the demo here:

[Clinical Appointments Demo](https://danielbom.github.io/clinic-appointments)

The demo uses a fake API, so you can freely navigate through the interface and explore the application.

## Frontend Inspiration

The frontend UI was inspired by:

- [AdminJS](https://adminjs.co)

## Project Structure

```text
backend/
├── dotnet/        # .NET API
├── express-ts/    # Node.js + Express + TypeScript API
└── golang/        # Go API

frontend/          # React + Vite admin frontend
request/           # HTTPyac request files (.http)
tests/             # End-to-end tests
```

## Backend Implementations

Each backend provides essentially the same API and business behavior.

The implementations were created independently to explore:

- Architectural differences
- Language ergonomics
- Validation strategies
- Error handling approaches
- Code generation workflows
- Testing patterns
- Developer experience
- Maintainability trade-offs

The goal is consistency between implementations while still respecting the idioms and strengths of each ecosystem.

## Frontend

The frontend is a React admin interface built with Vite and designed to work with all backend implementations.

## Testing

The repository includes:

- End-to-end snapshot tests
- Error scenario tests
- HTTPyac request collections

The same testing strategy is reused across the different backend implementations to help verify behavior consistency.

## Task Runner

This repository uses Mise to manage and run project tasks.

List all available commands:

```bash
mise run
```

Task definitions are available in:

```text
mise.toml
```

Mise documentation:

- [Mise Documentation](https://mise.jdx.dev)

## Requirements

Depending on which backend you want to run, you may need:

- Docker
- Node.js
- Go
- .NET SDK
- Mise (optional)
