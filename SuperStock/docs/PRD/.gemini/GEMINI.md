# SuperStock - Product Requirements Context

This directory contains the authoritative Product Requirement Documents (PRD) for SuperStock.

## 1. Documentation Index
The PRD is split into the following active documents:
*   `01-overview.md`: Goals, Scope, User Roles.
*   `02-data-model.md`: Database Schema & Entities.
*   `03-api-specification.md`: REST API Endpoints.
*   `04-functional-requirements.md`: Detailed feature requirements.
*   `05-user-interface.md`: UI/UX & Wireframes.
*   `06-technical-stack.md`: Architecture & Tech choices.
*   `07-non-functional.md`: Performance, Security.
*   `08-testing.md`: Testing Strategy.
*   `09-deployment.md`: Docker & CI/CD.
*   `11-appendix.md`: Glossary & Future features.
*   *(Note: 10-operations.md has been removed)*

## 2. System Overview
**SuperStock** is a web-based Inventory Management System (IMS) for supermarkets.
*   **Primary Goals:** Minimize shrinkage (waste/theft) and enforce First-Expired, First-Out (FEFO) stock rotation.
*   **Scope:** Single-store, MVP focus. Mobile-responsive web app.
*   **Key Constraint:** Simulated hardware (POS, Scales, Scanners) via web interface.

## 3. Critical Business Logic

### 3.1 FEFO (First-Expired, First-Out)
*   **Batch Tracking:** Inventory tracked at **Batch** level (Expiry Date, Cost).
*   **Deduction:** Sales/Waste deduct from the **oldest** batch (`expiry_date` ASC).
*   **Constraint:** No negative inventory allowed.

### 3.2 Transactions
*   **Immutable Log:** All moves recorded in `InventoryTransactions`.
*   **Types:** Receipt, Sale, Adjustment, Waste, Return.

## 4. Technical Architecture
*   **Pattern:** Modular Monolith with Vertical Slices.
*   **Backend:** ASP.NET Core 8, EF Core 8, PostgreSQL 16.
*   **Frontend:** React 18, Vite, TypeScript, Tailwind, shadcn/ui.
*   **Infra:** Docker Compose (Postgres, Redis, API, Web).

## 5. Implementation Priorities (MVP)
1.  **Product/Category:** CRUD, Multi-barcode.
2.  **Inventory:** Receive Goods, Adjustments.
3.  **FEFO Engine:** Logic to find and deduct from correct batches.
4.  **POS Sim:** Frontend to drive sales.
5.  **Reporting:** Low Stock, Expiring, Shrinkage.

## 6. User Roles
*   **Admin:** Config, Users.
*   **Manager:** Reports, Approvals.
*   **Clerk:** Ops (Receive, Sell, Count).