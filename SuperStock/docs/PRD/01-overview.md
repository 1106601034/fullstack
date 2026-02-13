# 1. Project Overview & User Roles

[← Back to Index](./README.md)

---

## 1.1 Purpose

**SuperStock** is a web-based inventory management system designed for supermarket operations. The system addresses two core problems: reducing shrinkage (spoilage, damage, theft) and optimizing stock rotation using First-Expired, First-Out (FEFO) logic.

This document serves as both a requirements specification and a development guide for building SuperStock as a full-stack application.

## 1.2 Goals

1. Track inventory with batch-level granularity and expiry dates
2. Automate FEFO logic when deducting stock from sales
3. Provide real-time visibility into low stock and expiring items
4. Record and categorize shrinkage for analysis
5. Demonstrate a production-quality full-stack architecture

## 1.3 Scope Definition

### In Scope (MVP)

- Single-store inventory management
- Product and category management (CRUD)
- Multi-barcode support per product
- Batch tracking with expiry dates
- Goods receipt workflow
- POS simulation with FEFO-based stock deduction
- Shrinkage/waste logging
- Low stock and expiry alerts
- Basic reporting (low stock, expiring items, shrinkage summary)
- User authentication with role-based access
- Responsive web interface

### Simulated (Not Real Integrations)

- POS system: Built-in simulation interface (no external POS integration)
- Scale integration: Manual weight entry (no hardware integration)
- Barcode scanning: Manual entry or camera-based scanning via browser

### Out of Scope

- Multi-store/chain management
- Electronic Shelf Label (ESL) integration
- Mobile native app (web app will be mobile-responsive)
- Offline mode with sync
- Purchase order auto-generation
- Advanced analytics and forecasting
- Third-party accounting integration

## 1.4 Technical Constraints

- Development timeline: 8 weeks (adjustable)
- Team size: Solo developer or small team
- Infrastructure: Local Docker environment; cloud deployment optional

---

## 2. User Roles and Permissions

### 2.1 Role Definitions

| Role | Description | Typical User |
|------|-------------|--------------|
| **Admin** | Full system access including user management and configuration | Store owner, IT administrator |
| **Manager** | Operational oversight, reporting, can approve adjustments | Store manager, department head |
| **Clerk** | Day-to-day operations: receiving, stocking, audits | Stock clerk, warehouse staff |

### 2.2 Permission Matrix

| Action | Admin | Manager | Clerk |
|--------|:-----:|:-------:|:-----:|
| **Products** | | | |
| View products | ✓ | ✓ | ✓ |
| Create/edit products | ✓ | ✓ | — |
| Delete products | ✓ | — | — |
| **Inventory** | | | |
| View stock levels | ✓ | ✓ | ✓ |
| Receive goods | ✓ | ✓ | ✓ |
| Adjust inventory | ✓ | ✓ | ✓ |
| Record waste/shrinkage | ✓ | ✓ | ✓ |
| **Sales (POS)** | | | |
| Process sales | ✓ | ✓ | ✓ |
| Void transactions | ✓ | ✓ | — |
| **Reports** | | | |
| View all reports | ✓ | ✓ | — |
| View basic alerts | ✓ | ✓ | ✓ |
| **Administration** | | | |
| Manage users | ✓ | — | — |
| System configuration | ✓ | — | — |
| View audit logs | ✓ | ✓ | — |

---

[Next: Data Model →](./02-data-model.md)
