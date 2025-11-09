# Knovator Job Importer

A scalable job import system that fetches job listings from RSS feeds, processes them using Redis queue, and stores them in MongoDB.

## Features
- RSS/XML feed parsing
- Background job processing with BullMQ
- MongoDB storage with duplicate prevention
- Import history tracking
- React admin UI

## Tech Stack
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Queue:** Redis + BullMQ
- **Frontend:** React
- **Parser:** xml2js

## Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- Redis (v6+)

### Installation

1. Clone the repository:
```bash
