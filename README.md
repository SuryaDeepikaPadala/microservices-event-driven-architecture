📌 Overview

This project is a backend system built using a microservices architecture pattern.
Each service is independently structured and communicates asynchronously using RabbitMQ.

✨ Key Features
- Event-driven microservices architecture

- Asynchronous inter-service communication using RabbitMQ

- API Gateway for centralized routing

- Redis caching for optimized search performance

- Cloud-based media storage integration

- Modular and scalable service structure

🏗 Architecture

Services included:

API Gateway

Auth Service

Post Service

Media Service

Search Service

⚙️ Tech Stack

Node.js

Express.js

MongoDB

Redis

RabbitMQ

Cloudinary

Docker (configuration support included)

🧠 Design Decisions

- Microservices architecture chosen for scalability and independent deployment

- API Gateway implemented for centralized routing and request management

- RabbitMQ used for asynchronous, event-driven inter-service communication

- Redis integrated to improve search performance through caching

- Services are loosely coupled to allow independent scaling

🔄 System Workflow
Post Creation Flow

1. Client sends request to API Gateway

2. API Gateway routes request to Post Service

3. Post Service stores post data in MongoDB

4. Post Service publishes an event to RabbitMQ

5. Search Service consumes the event and updates search index

6. Media Service handles image uploads via Cloudinary

Post Deletion Flow

1. Post Service deletes post from database

2. Emits deletion event to RabbitMQ

3. Media Service listens to event and deletes related images from Cloudinary

4. Search Service updates its index accordingly



🚀 How to Run Locally

Install dependencies in each service:

npm install
npm run dev