# System Architecture

## Overview

The Knovator Job Importer is a queue-based job import system designed for scalability and reliability.

## Architecture Diagram
```
┌─────────────┐
│   Browser   │
│  React UI   │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────────┐
│  Express API    │
│  (importRoutes) │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ Redis  │ ◄─── Queue Management
    │ Queue  │
    └───┬────┘
        │
        ▼
┌──────────────────┐
│   BullMQ Worker  │
│                  │
│  fetcherService  │
└────────┬─────────┘
         │
    ┌────▼─────────┐
    │   MongoDB    │
    │  - jobs      │
    │  - importlogs│
    └──────────────┘
```

## Components

### 1. Frontend (React)
- **Purpose:** Admin UI for enqueueing feeds and viewing history
- **Technology:** React, Axios, Tailwind CSS
- **File:** `client/src/App.js`

### 2. API Layer (Express)
- **Purpose:** REST API endpoints
- **Routes:**
  - `/api/import/enqueue` - Add feed to queue
  - `/api/import/history` - Fetch import logs
- **Files:** `server/src/routes/importRoutes.js`

### 3. Queue System (BullMQ + Redis)
- **Purpose:** Async job processing
- **Why:** Prevents blocking, handles failures, enables retry
- **Files:** 
  - `server/src/queues/queue.js` - Queue definition
  - `server/src/queues/worker.js` - Job processor

### 4. Business Logic (Services)
- **fetcherService:** Core import logic
  - Fetches RSS feed
  - Parses XML to JSON
  - Cleans data (removes invalid MongoDB keys)
  - Saves to database
  - Logs results
- **xmlToJson:** XML parser wrapper
- **Files:** `server/src/services/`

### 5. Database (MongoDB)
- **Collections:**
  - `jobs` - Stores job listings (unique by link)
  - `importlogs` - Tracks import history
- **Files:** `server/src/models/`

## Design Decisions

### 1. Why Queue-Based Processing?
- **Scalability:** Can handle multiple feeds concurrently
- **Reliability:** Jobs persist if server crashes
- **Decoupling:** API responds immediately, processing happens async

### 2. Why MongoDB?
- **Flexible schema:** RSS feeds have varying structures
- **Upsert capability:** Easy duplicate prevention
- **Document storage:** Natural fit for job data

### 3. Why BullMQ over Bull?
- Better TypeScript support
- More active maintenance
- Improved performance

### 4. Data Cleaning Strategy
**Problem:** XML parsers add keys like `$` and `.` which MongoDB rejects

**Solution:** `deepClean()` function recursively removes invalid keys

### 5. Duplicate Prevention
**Strategy:** Use `link` field as unique identifier with `findOneAndUpdate` upsert

### 6. Error Handling
- Each job wrapped in try-catch
- Failed jobs logged with reason
- Import continues even if individual jobs fail

## Data Flow

1. **User Action:** Enters feed URL, clicks "Enqueue"
2. **API:** Validates URL, adds to Redis queue
3. **Worker:** Picks job from queue
4. **Fetch:** Downloads RSS feed (XML)
5. **Parse:** Converts XML → JSON
6. **Clean:** Removes invalid MongoDB keys
7. **Extract:** Pulls relevant fields (title, link, company, etc.)
8. **Store:** Upserts to MongoDB (prevents duplicates)
9. **Log:** Creates import log entry
10. **UI:** Displays updated history

## Scalability Considerations

### Current Setup (Single Server)
- 1 Express server
- 1 Worker process
- Suitable for: <1000 feeds/day

### Future Scaling Options

1. **Horizontal Scaling:**
   - Multiple worker processes
   - Load balancer for API servers
   - Redis Cluster for queue

2. **Performance Optimizations:**
   - Batch inserts (currently one-by-one)
   - Caching frequent feeds
   - Rate limiting per feed source

3. **Monitoring:**
   - Add Bull Board for queue visualization
   - Prometheus metrics
   - Error alerting

## Security Considerations

1. **Input Validation:** Feed URLs validated before processing
2. **Rate Limiting:** Should add per-IP limits on API
3. **MongoDB:** Currently no auth (add for production)
4. **CORS:** Configure allowed origins

## Future Enhancements

1. **Scheduled Imports:** Cron jobs for automatic feed refresh
2. **Webhooks:** Notify on import completion
3. **Feed Management:** CRUD for feed sources
4. **Analytics:** Dashboard with import metrics
5. **Search:** Full-text search on job listings

## Technology Choices Summary

| Component | Technology | Reason |
|-----------|------------|--------|
| Backend | Node.js + Express | Fast, async I/O, JavaScript ecosystem |
| Database | MongoDB | Flexible schema, easy upserts |
| Queue | BullMQ + Redis | Reliable, scalable, retry logic |
| Frontend | React | Component-based, easy state management |
| Parser | xml2js | Mature, handles various XML formats |

## Development Guidelines

1. **Code Structure:** Modular (routes/services/models separation)
2. **Error Handling:** Always catch and log
3. **Validation:** Validate at API boundary
4. **Testing:** Test with various feed formats
5. **Documentation:** Keep this file updated with changes
