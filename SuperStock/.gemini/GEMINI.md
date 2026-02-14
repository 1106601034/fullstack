# SuperStock - Project Context

IMPORTANT: MAKE SURE YOU FOLLOW ALL THE RULES LISTED IN `/SuperStock/.gemini/rules`.

YOU ARE NOT ALLOW TO EDIT OR REMOVE RULES.

## 1. Project Overview

**SuperStock** is a web-based inventory management system (IMS) designed for supermarket operations.

* **Core Purpose:** Reduce shrinkage (spoilage/theft) and optimize stock rotation using First-Expired, First-Out (FEFO) logic.
* **Current Status:** **Initialization Phase.** The project requirements and architecture are fully documented in `docs/PRD/`, but the codebase implementation is pending.

## 2. Technical Architecture

### Backend (Planned)

* **Framework:** ASP.NET Core Web API 8.0 (C# 12)
* **Database:** PostgreSQL 16 (Entity Framework Core 8.0)
* **Architecture:** Modular Monolith with Vertical Slices
  * **Key Pattern:** CQRS-lite using MediatR.
  * **Structure:** Features grouped by domain (e.g., `Modules/Inventory/Features/AdjustStock/`).
* **Authentication:** JWT Bearer Tokens.

### Frontend (Planned)

* **Framework:** React 18 (TypeScript 5.x)
* **Build Tool:** Vite 5.x
* **Styling:** Tailwind CSS 3.x + shadcn/ui.
* **State Management:**
  * Server State: TanStack Query.
  * Form State: React Hook Form + Zod validation.

## 3. Directory Structure

| Directory | Purpose |
| :--- | :--- |
| `backend/` | Source code for the .NET Web API. (Currently empty/initialized) |
| `frontend/` | Source code for the React Web Application. (Currently empty/initialized) |
| `docs/` | **Source of Truth.** Contains Product Requirement Documents (PRD) and architectural decisions. |
| `.claude/` | Project rules and coding standards. |

## 4. Development Conventions

**Strict adherence to these rules is required.**

### General Principles

* **SOLID:** Follow SOLID principles (SRP, OCP, LSP, ISP, DIP).
* **KISS:** Keep It Simple, Stupid. Avoid over-engineering.
* **DRY:** Don't Repeat Yourself. Extract reusable logic.

### Code Organization

* **File Size:** Hard limit of **1000 lines** per file. Recommended < 500 lines.
* **Breakdown:** Split large components into smaller sub-components or custom hooks.

### Coding Standards

* **No Magic Strings:** All strings must be extracted to constants files (e.g., `WORKSHOP_TYPES`, `API_ENDPOINTS`).
* **TypeScript:**
  * Use `interface` instead of `type` for object structures.
  * **Strict Typing:** explicit interfaces for Props, API responses, and data structures. No `any`.
* **Backend Pattern:**
  * **Vertical Slices:** All code for a specific feature (Endpoint, Command, Handler, Validator) must live in the same folder.
  * **Dependency Rule:** Domain logic must not depend on infrastructure.

## 5. Getting Started (Implementation Guide)

Since the project is in the initialization phase, the immediate tasks are:

1. **Backend Setup:** Initialize the .NET solution and projects structure in `backend/` following the Modular Monolith guidelines.
2. **Frontend Setup:** Initialize the Vite + React application in `frontend/`.
3. **Infrastructure:** Set up Docker Compose for PostgreSQL and the API.

Refer to `docs/PRD/06-technical-stack.md` for precise version numbers and library choices.
