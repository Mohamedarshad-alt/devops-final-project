# Monitoring and Logging

## 1. Objective

This document explains how application and server monitoring, service availability alerts and log management are implemented in the AWS DevOps project.

## 2. Monitoring Tools

| Tool | Purpose |
|---|---|
| Prometheus | Collects and stores metrics |
| Grafana | Dashboards and alert rules |
| Node Exporter | Exposes Linux host metrics |
| CloudWatch | AWS infrastructure monitoring |
| CloudWatch Agent | Sends configured host metrics and logs to CloudWatch |

## 3. Prometheus

Prometheus runs as a Docker Compose service.

Configuration location:

`monitoring/prometheus/`

The configured scrape targets include:

- `api:3000` — application metrics.
- `node-exporter:9100` — EC2 host metrics.

The API exposes metrics through:

`/metrics`

Prometheus collects metrics at the configured 15-second interval.

## 4. Node Exporter

Node Exporter provides host-level metrics, including:

- CPU utilization.
- Memory usage.
- Filesystem usage.

It runs as a container and exposes its metrics internally on port 9100.

## 5. Grafana

Grafana is used to visualize Prometheus metrics.

The project dashboard includes:

- CPU utilization.
- Memory utilization.
- Disk utilization.
- API availability.

A service availability alert named `DevOps API Service Down` was configured using the Prometheus query:

`up{job="devops-api"}`

The alert checks whether the API target becomes unavailable.

## 6. CloudWatch

Amazon CloudWatch monitors EC2 CPU utilization.

The configured alarm is:

`devops-app-high-cpu`

Its threshold is CPU utilization above 80% for one five-minute evaluation period.

The CloudWatch Agent is installed and running on the EC2 instance.

## 7. Logging

### Application logs

View API container logs:

```bash
sudo docker logs --tail 50 devops-app-api-1
```

View all Compose service logs:

```bash
sudo docker compose \
  --env-file /home/ubuntu/devops-app/.env \
  -f /home/ubuntu/devops-app/docker-compose.yml \
  logs --tail 50
```

### Nginx logs

Access log:

```bash
sudo tail -n 50 /var/log/nginx/access.log
```

Error log:

```bash
sudo tail -n 50 /var/log/nginx/error.log
```

### Host health-check logs

The host health-check script writes to:

`/var/log/devops-monitoring/health.log`

View recent entries:

```bash
sudo tail -n 50 /var/log/devops-monitoring/health.log
```

## 8. Log Rotation

Docker logs use the `json-file` logging driver with a maximum size of 10 MB and a maximum of three files.

The host health-check log uses logrotate with:

- 5 MB size threshold.
- Four rotated files.
- Compression.
- Copy-truncate mode.

## 9. Alert Testing

The API container was deliberately stopped to test service availability monitoring.

The API was subsequently restarted.

The health endpoint was checked and returned:

`{"status":"healthy","database":"connected"}`

CloudWatch CPU alarm email notification was also received.

## 10. Current Limitations

- Grafana SMTP is not configured, so Grafana email alert delivery is not working.
- The Grafana alert rule exists, but successful email delivery must not be claimed.
- Monitoring services run on the same EC2 instance as the application, so an EC2 failure affects both application and monitoring.
