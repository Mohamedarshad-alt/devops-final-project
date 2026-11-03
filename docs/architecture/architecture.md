# AWS DevOps Project Architecture

## 1. Architecture Diagram

```mermaid
flowchart TB
    DEV[Developer]
    GH[GitHub Repository]
    ACTIONS[GitHub Actions<br/>CI and Security Scans]
    GHCR[GitHub Container Registry]
    OIDC[AWS OIDC Role]
    SSM[AWS Systems Manager]

    DEV --> GH
    GH --> ACTIONS
    ACTIONS --> GHCR
    ACTIONS --> OIDC
    OIDC --> SSM

    subgraph AWS["AWS Cloud - ap-south-1"]
        subgraph EC2["Single Ubuntu EC2 Instance"]
            SG[Security Group<br/>HTTP 80 / SSH restricted<br/>443 rule configured]

            NGINX[Nginx Reverse Proxy<br/>Port 80]

            subgraph DOCKER["Docker Compose"]
                API[Node.js Express API<br/>127.0.0.1:3000]
                DB[(PostgreSQL Database)]
                PROM[Prometheus<br/>127.0.0.1:9090]
                GRAF[Grafana<br/>127.0.0.1:3001]
                NODE[Node Exporter<br/>Port 9100 internal]
            end

            BACKUP[Scheduled DB Backup Script]
            CWAGENT[CloudWatch Agent]
        end

        S3[(Amazon S3<br/>Database Backups)]
        CW[Amazon CloudWatch<br/>CPU Alarm and Logs]
    end

    USER[Application User]
    USER -->|HTTP| SG
    SG --> NGINX
    NGINX --> API
    API --> DB

    SSM -->|Deployment commands| EC2

    GHCR -->|Pull container image| API

    PROM -->|Scrape /metrics| API
    PROM -->|Scrape metrics| NODE
    GRAF -->|Query metrics| PROM

    BACKUP -->|Upload encrypted backup| S3
    CWAGENT --> CW
