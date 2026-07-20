# Contributing to VisionIQ

First off, thank you for considering contributing to VisionIQ!

## 1. Project Setup
We use Docker Compose to orchestrate the entire development environment to ensure parity across all developer machines.
1. Install Docker Desktop.
2. Clone the repository: `git clone https://github.com/organization/visioniq.git`
3. Copy `.env.example` to `.env` and fill in any required variables.
4. Run the stack:
   ```bash
   docker-compose up --build
   ```
5. The API will be available at `http://localhost:8000`.
6. The Frontend will be available at `http://localhost:3000`.

## 2. Coding Standards
Please read the [PROJECT_RULES.md](docs/PROJECT_RULES.md) before submitting any code. 
- **Backend**: Strict type hints. Pydantic for validation. Clean Architecture structure.
- **Frontend**: Strict TypeScript. React Query for state. Shadcn/Tailwind for UI.

## 3. Pull Request Process
1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3. You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

## 4. Linting and Formatting
- **Backend**: We use `black` for formatting and `ruff` for linting.
  ```bash
  black .
  ruff check .
  ```
- **Frontend**: We use `eslint` and `prettier`.
  ```bash
  npm run lint
  npm run format
  ```

## 5. Architecture Expectations
All new features must follow the established Clean Architecture. 
If you are adding a new domain entity (e.g., `Brand`), you must create:
- A SQLAlchemy Model.
- A Pydantic Schema.
- A Repository class.
- A Service class.
- A FastAPI Router.

Do not skip layers. See the [DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) for a step-by-step tutorial.
