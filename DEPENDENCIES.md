# Project Dependencies

This file lists all the external and internal libraries used in the SONEXA-PHP project.
The project is a full-stack application with a PHP/Laravel backend and a React (Vite) frontend.

## Quick Install

To install all dependencies for the entire project, run the following commands from the root directory:

```bash
# Install backend (PHP) dependencies
cd backend
composer install
cd ..

# Install frontend (Node) dependencies
cd frontend
npm install
cd ..
```

*(Note: The backend `composer.json` also has a convenient `setup` script that runs multiple setup commands. You can optionally run `composer setup` from the `backend` directory to do a full initialization).*

---

## 1. Backend Dependencies
*(Located in `backend/composer.json`)*

**Dependencies:**
- `php` (^8.2) - The PHP programming language requirement.
- `firebase/php-jwt` (^7.1) - A simple library to encode and decode JSON Web Tokens (JWT) in PHP.
- `imagekit/imagekit` (^4.0) - ImageKit.io PHP SDK for image upload, manipulation, and management.
- `laravel/framework` (^12.0) - The Laravel PHP framework.
- `laravel/tinker` (^2.10.1) - An interactive REPL for the Laravel framework.
- `mongodb/laravel-mongodb` (^5.8) - An Eloquent model and Query builder with support for MongoDB.
- `symfony/resend-mailer` (^7.4) - Symfony Mailer integration for Resend API to send emails.

**Dev Dependencies:**
- `fakerphp/faker` (^1.23) - Generates fake data for you (useful for database seeding).
- `laravel/pail` (^1.2.2) - Simplifies viewing your Laravel application's log files.
- `laravel/pint` (^1.24) - An opinionated PHP code style fixer for minimalists.
- `laravel/sail` (^1.41) - A light-weight command-line interface for interacting with Laravel's default Docker development environment.
- `mockery/mockery` (^1.6) - A simple yet flexible PHP mock object framework for use in unit testing.
- `nunomaduro/collision` (^8.6) - Beautiful error reporting for PHP command-line applications.
- `phpunit/phpunit` (^11.5.50) - A programmer-oriented testing framework for PHP.

---

## 2. Frontend Dependencies
*(Located in `frontend/package.json`)*

**Dependencies:**
- `@tailwindcss/vite` (^4.3.3) - Vite integration for Tailwind CSS v4.
- `axios` (^1.18.1) - Promise-based HTTP client for the browser.
- `react` (^19.2.7) - JavaScript library for building user interfaces.
- `react-dom` (^19.2.7) - React package for working with the DOM.
- `react-icons` (^5.7.0) - Popular icons inclusion for React projects.
- `react-router-dom` (^7.18.1) - Declarative routing for React web applications.
- `tailwindcss` (^4.3.3) - Utility-first CSS framework for rapid UI development.

**Dev Dependencies:**
- `@eslint/js` (^10.0.1) - ESLint recommended rules.
- `@types/react` (^19.2.17) - TypeScript definitions for React.
- `@types/react-dom` (^19.2.3) - TypeScript definitions for React DOM.
- `@vitejs/plugin-react` (^6.0.3) - Vite plugin for fast React refreshes.
- `eslint` (^10.6.0) - Pluggable linting utility for JavaScript and JSX.
- `eslint-plugin-react-hooks` (^7.1.1) - ESLint rules for React Hooks.
- `eslint-plugin-react-refresh` (^0.5.3) - React refresh support for Vite.
- `globals` (^17.7.0) - Global identifiers from different JavaScript environments.
- `vite` (^8.1.1) - Next-generation frontend tooling and fast bundler.
