# SuperStock - Product Requirements Context

This directory contains the authoritative Product Requirement Documents (PRD) for SuperStock.

## 1. System Overview
**SuperStock** is a web-based Inventory Management System (IMS) for supermarkets.
*   **Primary Goals:** Minimize shrinkage (waste/theft) and enforce First-Expired, First-Out (FEFO) stock rotation.
*   **Scope:** Single-store, MVP focus. Mobile-responsive web app (no native mobile app).
*   **Key Constraint:** Simulated hardware (POS, Scales, Scanners) via web interface.

## 2. Critical Business Logic

### 2.1 FEFO (First-Expired, First-Out)
This is the core differentiator.
1.  **Batch Tracking:** Inventory is tracked at the **Batch** level, not just Product level.
2.  **Deduction Logic:** When an item is sold or wasted:
    *   Find all batches with `quantity > 0`.
    *   Sort by `expiry_date` ASC (oldest first).
    *   Deduct from the oldest batch. If depleted, move to the next.
    *   **Strict Rule:** System must prevent negative inventory states.

### 2.2 Inventory Transactions
All inventory changes are recorded in an **immutable** `InventoryTransactions` table.
*   **Types:** `receipt`, `sale`, `adjustment`, `waste`, `return`.
*   **Waste Reasons:** `expired`, `damaged`, `theft`, `vendor_return`, `admin_error`, `sampling`, `donation`.

## 3. Data Model Summary
*   **Category:** Hierarchical (Self-referencing ParentID).
*   **Product:** SKU, Unit of Measure, Low Stock Threshold.
    *   Has many **Barcodes** (1:N, allowing multipacks).
    *   Has many **Batches** (1:N, carrying Expiry Date, Cost).
*   **Batch:** The atomic unit of inventory.
*   **Transaction:** Links to Batch + User + Reason.
*   **User:** Roles (`Admin`, `Manager`, `Clerk`).

## 4. Technical Architecture (Mandated)
*   **Pattern:** Modular Monolith with Vertical Slices.
*   **Backend:** ASP.NET Core 8 Web API.
    *   **CQRS:** MediatR for decoupling.
    *   **Validation:** FluentValidation.
    *   **ORM:** EF Core 8 (PostgreSQL 16).
*   **Frontend:** React 18 + Vite + TypeScript.
    *   **State:** TanStack Query (Server), Context/Reducer (Client).
    *   **UI:** Tailwind CSS + shadcn/ui.
*   **Infrastructure:** Docker Compose (Postgres, Redis, API, Web).

## 5. User Roles & Access
| Role | Key Permissions |
| :--- | :--- |
| **Admin** | Full Access, User Management, Config. |
| **Manager** | Reports, Approvals, Adjustments, Void Sales. |
| **Clerk** | Receive Goods, Stocking, Sales, Record Waste. |

## 6. Implementation Priorities (P0 - MVP)
1.  **Product Mgmt:** CRUD, Hierarchies, Multi-barcode.
2.  **Inventory:** Receive Goods (Batches), Manual Adjustments.
3.  **FEFO Engine:** The auto-deduction logic described in 2.1.
4.  **POS Simulation:** Web UI to process sales and trigger FEFO.
5.  **Alerts:** Low Stock & Expiring Items.
6.  **Auth:** JWT-based login with RBAC.

## 7. Key Workflows
*   **Receiving:** User scans product -> Enters Batch/Expiry -> Increases Stock.
*   **Selling:** User scans barcode -> System finds product -> System calculates Batch deduction (FEFO) -> Decreases Stock.
*   **Shrinkage:** User identifies bad stock -> Selects specific batch -> Enters reason -> Decreases Stock.
