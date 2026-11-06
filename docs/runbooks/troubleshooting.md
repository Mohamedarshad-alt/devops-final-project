# DevOps Application Troubleshooting Runbook

## 1. Purpose
This runbook explains how to investigate and recover common problems in the AWS EC2 deployment.

## 2. Access
Connect to EC2 using AWS Systems Manager Session Manager.

## 3. Application health
Check the API directly:

    curl -i http://127.0.0.1:3000/health

Check through Nginx:

    curl -i http://127.0.0.1/health

Expected result: HTTP 200, healthy status, database connected.

## 4. Docker containers

    sudo docker ps
    sudo docker ps -a
    sudo docker stats --no-stream

## 5. Application and database logs

    sudo docker logs --tail 100 devops-app-api-1
    sudo docker logs --tail 100 devops-app-db-1

All Compose logs:

    sudo docker compose --env-file /home/ubuntu/devops-app/.env -f /home/ubuntu/devops-app/docker-compose.yml logs --tail 100

## 6. API recovery

Inspect logs before restarting:

    sudo docker start devops-app-api-1
    curl -i http://127.0.0.1:3000/health

## 7. Nginx troubleshooting

    sudo systemctl status nginx --no-pager
    sudo nginx -t
    sudo tail -n 100 /var/log/nginx/error.log
    sudo tail -n 100 /var/log/nginx/access.log

Restart only after checking the configuration:

    sudo systemctl restart nginx

## 8. Monitoring troubleshooting

    sudo docker logs --tail 100 devops-app-prometheus-1
    sudo docker logs --tail 100 devops-app-grafana-1
    sudo docker logs --tail 100 devops-app-node-exporter-1

Check Prometheus Targets and confirm API and Node Exporter are UP.
Check Grafana panels for CPU, memory, disk and API availability.

Grafana email delivery is not configured because SMTP is not configured.

## 9. Host resource checks

    uptime
    free -h
    df -h /
    sudo docker stats --no-stream
    sudo /usr/local/bin/devops-health-check.sh
    sudo tail -n 100 /var/log/devops-monitoring/health.log

## 10. Database backup troubleshooting

    sudo systemctl status devops-db-backup.timer --no-pager
    sudo systemctl status devops-db-backup.service --no-pager
    sudo journalctl -u devops-db-backup.service -n 100 --no-pager

List S3 backups:

    aws s3 ls s3://devops-final-project-db-backups-788516091241/postgres/

## 11. Application rollback

A manual application rollback was tested.

1. Identify the previously working image tag.
2. Back up the current Compose file.
3. Change the API image tag to the previous version.
4. Validate Compose configuration.
5. Recreate only the API service.
6. Verify API health.
7. Restore the intended Compose configuration after testing.

Back up the configuration:

    cd /home/ubuntu/devops-app
    sudo cp docker-compose.yml docker-compose.yml.rollback-backup

Validate:

    sudo docker compose --env-file /home/ubuntu/devops-app/.env -f /home/ubuntu/devops-app/docker-compose.yml config --quiet

Recreate only the API:

    sudo docker compose --env-file /home/ubuntu/devops-app/.env -f /home/ubuntu/devops-app/docker-compose.yml up -d --no-deps api

Verify:

    curl -i http://127.0.0.1:3000/health

Never delete database volumes during application rollback.

## 12. Database recovery

A PostgreSQL restoration test was completed using a separate database named devops_restore_test. The live database was not replaced.

Before production restoration:
1. Identify and verify the backup.
2. Take a fresh backup.
3. Prefer an isolated test database.
4. Verify restored tables and records.
5. Never overwrite production without an approved recovery plan.

## 13. Safety precautions

- Never expose database port 5432 publicly.
- Do not expose application or monitoring ports unnecessarily.
- Never commit .env, passwords, access keys or Terraform state.
- Do not run docker compose down -v during troubleshooting.
- Do not delete PostgreSQL persistent volumes.
- Inspect logs before restarting services.
- Verify application health after recovery.

## 14. Known limitations

- HTTPS certificate configuration is pending because a domain has not been configured.
- Grafana SMTP email delivery is not configured.
- Manual image-digest rollback was successfully tested on the isolated test EC2, and a separate configuration rollback simulation was completed. The GitHub Actions automatic failure-triggered image rollback path has not been tested.
- Terraform state is stored in an encrypted, versioned S3 remote backend with native S3 lock-file configuration. Concurrent locking behavior has not been independently tested.
- The deployment uses one EC2 instance and has a single point of failure.
