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
6. Remove the temporary test database.

Example restoration command:

```bash
sudo docker exec -i devops-app-db-1 \
  pg_restore -U appuser \
  --no-owner --no-privileges \
  -d devops_restore_test \
  < /tmp/devops-restore-test/devopsdb.dump
```

The test database contained the expected `public.items` table and two records.

The production database was not overwritten during this test.

## 6. Application Version Rollback

Application rollback was tested using a previously published Docker image.

The process was:

1. Record the currently deployed image.
2. Back up the Docker Compose configuration.
3. Change the API image to the previous image tag.
4. Validate the Compose configuration.
5. Recreate only the API service.
6. Check application health.
7. Restore the original Compose configuration.
8. Redeploy the original API image.
9. Verify application and database health.

The previous version returned a successful health response.

The original version was then redeployed successfully.

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
- Automated application rollback is not yet integrated into GitHub Actions.
- High availability and cross-region disaster recovery are not implemented.

## 10. Recovery Test Result

The following operations were successfully tested:

- PostgreSQL backup uploaded to S3.
- Backup file inspected.
- Database restored to a separate test database.
- Restored tables and records verified.
- Previous application image deployed.
- Original application image restored.
- API health verified after recovery.
