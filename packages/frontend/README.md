# @l2beat/frontend

The statically generated frontend that is the face of L2BEAT.

## Setup

To run or develop the frontend you need to install and build its dependencies. You can do it by running the following
commands in the repository root:

```
yarn
yarn build:frontend
```

## Scripts

- `yarn start` - run the development server
- `yarn build` - compile the production static site
- `yarn format` - check if formatting is correct with prettier
- `yarn format:fix` - run prettier automatic formatter
- `yarn lint` - check if the code satisfies the eslint configuration
- `yarn lint:fix` - run eslint automatic fixer
- `yarn typecheck` - check if the code satisfies the typescript compiler

## Storybook

Production build requires (for some unknown reason) rebuilding dependencies in with ESM. Use `yarn storybook:build` to do exactly that.
