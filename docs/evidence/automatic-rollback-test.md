# Automatic Deployment Rollback Test

## Test Information

- Date: 4 November 2026
- Environment: Isolated AWS test EC2
- Application: Node.js API
- Database: PostgreSQL 16
- Deployment: Docker Compose
- Test status: PASSED

## Objective

Verify that the deployment rollback mechanism can restore
the previous application configuration when a deployment
causes the original API endpoint to become unavailable.

## Test Procedure

1. Verified that the original API was healthy on port 3000.
2. Created a backup of the original Docker Compose configuration.
3. Temporarily changed the API host port from 3000 to 39001.
4. Recreated the API container using Docker Compose.
5. Verified that the API was healthy on port 39001.
6. Verified that port 3000 was unavailable.
7. Triggered automatic rollback.
8. Restored the original Docker Compose configuration.
9. Recreated the API container using the original configuration.
10. Verified that the API was healthy on port 3000.
11. Removed the temporary backup after successful recovery.

## Final Result

AUTOMATIC ROLLBACK TEST PASSED.

API health response:

{"status":"healthy","database":"connected"}

Original port mapping:

127.0.0.1:3000 -> 3000

## Conclusion

The automatic rollback mechanism successfully restored
the original application configuration and recovered
the API after the simulated deployment failure.

The test was performed on the isolated test EC2.
The production deployment was not modified.
EOFcat > docs/evidence/automatic-rollback-test.md <<'EOF'
