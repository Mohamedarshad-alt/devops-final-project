# Database Backup and Application Recovery

## 1. Objective

This document describes the PostgreSQL backup process, Amazon S3 storage, database restoration testing and application version rollback.

## 2. Backup Architecture

The project uses:

- PostgreSQL running in Docker.
- A scheduled backup script on EC2.
- PostgreSQL custom-format database dumps.
- Amazon S3 for backup storage.
- S3 versioning and server-side encryption.

S3 bucket:

`devops-final-project-db-backups-788516091241`

Backup script:

`/usr/local/bin/backup-devops-db.sh`

## 3. Automated Backup Process

The backup script performs the following operations:

1. Connects to the PostgreSQL container.
2. Creates a custom-format database dump.
3. Validates the dump.
4. Uploads the dump to Amazon S3.
5. Verifies the uploaded object.

The backup job is scheduled daily at 02:00 UTC using a systemd timer.

## 4. Verify Backup Files

Run on the EC2 instance through AWS Systems Manager:

```bash
aws s3 ls s3://devops-final-project-db-backups-788516091241/postgres/ --region ap-south-1
```

Check the backup script:

```bash
sudo ls -l /usr/local/bin/backup-devops-db.sh
```

## 5. Database Restoration Test

A restoration test was performed using a separate database named:

`devops_restore_test`

The restoration procedure was:

1. Download an existing backup from S3.
2. Inspect the dump using `pg_restore --list`.
3. Create a separate test database.
4. Restore the backup into the test database.
5. Verify the restored tables and records.
6. Retain the isolated test database for verification. Do not delete it as part of the documented test.

Example restoration command:

```bash
sudo docker exec -i devops-app-db-1 \
  pg_restore -U appuser \
  --no-owner --no-privileges \
  -d devops_restore_test \
  < /tmp/devops-restore-test/devopsdb.dump
```

The isolated test database `devops_restore_test` contained the expected `public.items` table and two verified records:

- `DevOps Pipeline` — `Automated build, test, scan and deployment`
- `Monitoring Dashboard` — `Application and infrastructure monitoring`

The test database was retained after verification. The production database was not overwritten during this test.

## 6. Application Version Rollback

The GitHub Actions publishing workflow implements automatic rollback
to the previously running API image digest when deployment or the new
version's health check fails.

The implementation was reviewed and confirms these steps:

1. Identify the currently running API container.
2. Retrieve its previous GHCR image digest.
3. Pull the new image without first replacing the running container.
4. Deploy the new API image.
5. Check the new application's health.
6. If deployment or health verification fails, recreate the API using
   the previous image digest.
7. Check the previous application's health and report the rollback result.

A successful deployment was verified, and its logs showed the previous
image digest before the new image was deployed. This successful deployment
did not trigger the image rollback function.

A separate rollback simulation was completed on an isolated test EC2
instance. It temporarily changed the API host port mapping, verified that
the original port became unavailable, restored the original Docker Compose
configuration, and verified API health again.

A separate manual image-digest rollback test was completed successfully on the isolated test EC2. The newer image was deployed, then the previous immutable image digest was restored and API and database health were verified.

This manual test does not exercise the GitHub Actions automatic failure-triggered rollback path. That path remains untested. Production was not modified.

## 7. Application Recovery Test

The API container was deliberately stopped and subsequently restarted.

The application health endpoint was checked after recovery:

`{"status":"healthy","database":"connected"}`

The PostgreSQL database remained available.

## 8. Important Safety Precautions

- Never use `docker compose down -v` during routine recovery.
- Never overwrite the production database during a restoration test.
- Verify backup files before restoring them.
- Preserve the existing database volume.
- Keep database credentials out of scripts and Git repositories.
- Verify application health after every recovery operation.

## 9. Current Limitations

- The application and database currently run on the same EC2 instance.
- The instance is a single point of failure.
- The database backup process depends on the EC2 instance and its scheduled job.
- The GitHub Actions publishing workflow implements automatic rollback to the previous API image digest. Manual image-digest rollback was tested successfully on the isolated test EC2, but the automatic failure-and-recovery path has not been tested.
- High availability and cross-region disaster recovery are not implemented.

## 10. Recovery Test Result

The following operations were successfully tested:

- PostgreSQL backup uploaded to S3.
- Backup file inspected.
- Database restored to a separate test database.
- Restored tables and records verified.
- Isolated configuration rollback simulation completed.
- API health verified after recovery.
