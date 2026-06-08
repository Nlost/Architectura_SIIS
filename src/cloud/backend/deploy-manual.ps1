$ErrorActionPreference = "Stop"

$ECR_REPO  = "096506568929.dkr.ecr.eu-central-1.amazonaws.com/seniorwatch-backend"
$REGION    = "eu-central-1"
$EB_APP    = "seniorwatch-cloud"
$EB_ENV    = "seniorwatch-dev"
$S3_BUCKET = "seniorwatch-reports-31m9"
$VERSION   = "manual-$(Get-Date -Format 'yyyyMMdd-HHmm')"

Write-Host "==> [1/6] Build JAR..." -ForegroundColor Cyan
mvn clean package -DskipTests
if ($LASTEXITCODE -ne 0) { throw "Maven build failed" }

Write-Host "==> [2/6] Login ECR..." -ForegroundColor Cyan
aws ecr get-login-password --region $REGION |
    docker login --username AWS --password-stdin $ECR_REPO
if ($LASTEXITCODE -ne 0) { throw "ECR login failed" }

Write-Host "==> [3/6] Build & push Docker image ($VERSION)..." -ForegroundColor Cyan
docker build -t "${ECR_REPO}:latest" -t "${ECR_REPO}:${VERSION}" .
if ($LASTEXITCODE -ne 0) { throw "Docker build failed" }
docker push "${ECR_REPO}:latest"
docker push "${ECR_REPO}:${VERSION}"
if ($LASTEXITCODE -ne 0) { throw "Docker push failed" }

Write-Host "==> [4/6] Creare Dockerrun.aws.json + ZIP..." -ForegroundColor Cyan
@"
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "${ECR_REPO}:${VERSION}",
    "Update": "true"
  },
  "Ports": [{ "ContainerPort": 8080, "HostPort": 8080 }],
  "Logging": "/var/log/app"
}
"@ | Out-File -FilePath Dockerrun.aws.json -Encoding utf8

if (Test-Path deploy-manual.zip) { Remove-Item deploy-manual.zip }
Compress-Archive -Path Dockerrun.aws.json -DestinationPath deploy-manual.zip

Write-Host "==> [5/6] Upload la S3 + creare versiune EB..." -ForegroundColor Cyan
aws s3 cp deploy-manual.zip "s3://${S3_BUCKET}/deploys/seniorwatch-${VERSION}.zip"

aws elasticbeanstalk create-application-version `
    --application-name $EB_APP `
    --version-label $VERSION `
    --source-bundle "S3Bucket=${S3_BUCKET},S3Key=deploys/seniorwatch-${VERSION}.zip"

Write-Host "==> [6/6] Deploy la Elastic Beanstalk..." -ForegroundColor Cyan
aws elasticbeanstalk update-environment `
    --environment-name $EB_ENV `
    --version-label $VERSION

Write-Host ""
Write-Host "Deploy trimis: $VERSION" -ForegroundColor Green
Write-Host "Monitorizeaza: https://eu-central-1.console.aws.amazon.com/elasticbeanstalk" -ForegroundColor Green
Write-Host "EB face pull din ECR si reporneste containerul in ~3-5 minute." -ForegroundColor Yellow
