# SKILL: Vendor Portal & Invoice System

> **Domain:** Vendor Management — Onboarding, File Delivery, Invoicing
> **Applies to:** SCRIB3-OS layer, `/vendors` routes
> **Priority:** 🔴 Sixtyne — Montana gap (Plan v4 §3F)
> **Invoicing POC:** Camila

---

## Overview

Systematises vendor onboarding and invoice processing after Montana's departure. Vendors see only their own data. SCRIB3 team manages vendor lifecycle.

---

## Vendor Onboarding Requirements

All required before vendor can submit invoices:

| Field | Notes |
|-------|-------|
| Business name | Legal entity |
| Mailing address | Full postal |
| Primary SCRIB3 POC | Person who assigned the work |
| Type of work | PR / Development / Design / Motion / Content / Strategy / Other |
| Bank/ACH details | Submitted flag (details stored securely) |
| Tax form — W9 (US) or W8BEN-E (international) | Submitted flag |
| Currency | USD, US format only |

---

## Invoice Flow

```
1. Vendor submits invoice — MUST include project code(s)
   Multiple clients = separate line items
2. Submission notifies SCRIB3 POC (person who assigned the work)
3. POC validates: amount correct + work satisfactorily completed → marks approved
4. Approved invoice routes to Camila for payment processing
5. No invoice accepted without completed onboarding
```

## Invoice Statuses

| Status | Colour | Description |
|--------|--------|-------------|
| Submitted | `#6E93C3` | Awaiting POC review |
| Validated | `#F1C40F` | POC approved, awaiting Camila |
| Processing | `#E67E22` | Camila processing payment |
| Paid | `#27AE60` | Payment complete |
| Rejected | `#E74C3C` | POC rejected — needs correction |

## Vendor Dashboard (vendor role — minimal)

Vendors only see:
1. Their onboarding status and submitted details
2. Active project briefs + specs (shared by SCRIB3 team)
3. File delivery portal — upload finished assets, tag by project code
4. Invoice submission form

## Routes

- `/vendors` — Team/admin view with Vendors + Invoices tabs
- `/vendors/onboard` — New vendor registration form

## Data

- Source: `src/scrib3-os/lib/vendors.ts`
- Currently mock — 5 vendors, 5 invoices
- Supabase tables: `vendor_profiles`, `invoices` (see migration SQL)

## Access

| Role | Access |
|------|--------|
| admin, team, csuite | Full vendor + invoice management |
| vendor | Own data only (future — vendor role portal) |
