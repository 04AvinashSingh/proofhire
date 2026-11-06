# API Design Specification

**Date:** 2026-10-21  
**Milestone:** 1 — Engineering Foundation  
**Status:** `DECIDED`

---

## 1. Protocol & Principles

- **Base URL:** `/api/v1`
- **Protocol:** HTTP/1.1 over TLS (HTTPS in production)
- **Content-Type:** `application/json`
- **Authentication:** HttpOnly, Secure, SameSite=Strict cookies (`proofhire_session`)
- **Correlation ID:** Every request receives an `x-request-id` header in the response for tracing.

---

## 2. Response Envelopes

All API endpoints return standard JSON envelopes defined in `@proofhire/shared-contracts`.

### 2.1 Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 2.2 Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address",
        "code": "invalid_string"
      }
    ],
    "requestId": "4d557022-7f28-40b4-a4b5-827b40974b62"
  }
}
```

---

## 3. Standard Error Codes

| HTTP Status | Error Code | Description |
|---|---|---|
| `400` | `BAD_REQUEST` | Malformed request or general syntax error. |
| `400` | `VALIDATION_ERROR` | Request payload failed Zod schema validation. |
| `401` | `UNAUTHORIZED` | Missing or expired session cookie. |
| `403` | `FORBIDDEN` | Valid session, but insufficient privileges or wrong organization context. |
| `404` | `NOT_FOUND` | Resource or endpoint path not found. |
| `409` | `CONFLICT` | Unique constraint violation (e.g., email already registered, duplicate slug). |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected unhandled exception (stack trace omitted in production). |
| `503` | `SERVICE_UNAVAILABLE` | Downstream dependency (e.g., database) unhealthy. |

---

## 4. Milestone 1 Core Endpoints

### 4.1 Liveness Probe
- **Path:** `GET /health`
- **Auth:** None (public)
- **Response (200 OK):**
```json
{
  "status": "ok",
  "version": "0.1.0",
  "environment": "development",
  "uptime": 124,
  "timestamp": "2026-10-21T12:00:00.000Z"
}
```

### 4.2 Readiness Probe
- **Path:** `GET /ready`
- **Auth:** None (public)
- **Response (200 OK):**
```json
{
  "status": "ready",
  "checks": {
    "database": "healthy"
  },
  "uptime": 124,
  "timestamp": "2026-10-21T12:00:00.000Z"
}
```
- **Response (503 Service Unavailable):**
```json
{
  "status": "not_ready",
  "checks": {
    "database": "unhealthy"
  },
  "uptime": 124,
  "timestamp": "2026-10-21T12:00:00.000Z"
}
```
