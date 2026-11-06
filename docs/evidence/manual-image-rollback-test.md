# Manual Docker Image-Digest Rollback Test

## Test Information

- Date: 6 November 2026
- Environment: Isolated AWS test EC2
- Region: ap-south-1
- Instance ID: i-0c4f68769d3bd1b69
- Application: Node.js REST API
- Database: PostgreSQL 16
- Deployment: Docker Compose
- Test status: PASSED

## Objective

Verify that a previously working Docker image can be restored
using its immutable SHA-256 digest after deploying a newer image.

The test was performed exclusively on the isolated test EC2.
The production application was not modified.

## Test Procedure

1. Connected to the isolated test EC2 using AWS Systems Manager.
2. Identified the currently running application image.
3. Verified the existing API health and database connectivity.
4. Downloaded the newer application image from GHCR.
5. Created backups of the original environment and Compose files.
6. Validated the newer image configuration.
7. Deployed the newer image using Docker Compose.
8. Verified the newer image ID and digest.
9. Verified that the API was healthy and PostgreSQL remained healthy.
10. Updated the test environment image reference.
11. Restored the previous application image using its immutable SHA-256 digest.
12. Verified the restored image ID matched the expected digest.
13. Verified the API returned a healthy response with database connectivity.
14. Restored the original environment configuration.

## Image Information

### Newer image deployed

- Tag: sha-53c5494dbd728128242c09fed434517278fc83a0
- Digest: sha256:9a53f7a12687e2b5a9237fa381ce8898429ed1b914f90a744450510d04bcac3b

### Previous image restored

- Tag originally used: sha-dc985bea520b1006bc8bbe015c8cb50badfa7a67
- Digest: sha256:0912c16aac60f53c374770fa15a99021341ec3296f646dc3c849eeedd577faee

## Final Verification

The restored API image ID matched the previous image digest.

API health response:

{"status":"healthy","database":"connected"}

Both containers remained running:

- devops-test-api-1
- devops-test-db-1

PostgreSQL remained healthy during the test.

## Final Result

MANUAL DOCKER IMAGE-DIGEST ROLLBACK TEST PASSED.

The previous application image was successfully restored,
and the API recovered with its database connection working.

## Limitations

- This test demonstrates manual image-digest rollback.
- It does not demonstrate automatic GitHub Actions rollback
  triggered by a failed deployment health check.
- Production was not modified.
- The database volume was not intentionally removed or recreated.
